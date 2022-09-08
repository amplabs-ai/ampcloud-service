import React, { useEffect, useRef, useState } from "react";
import { message, PageHeader } from "antd";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useFileUpload } from "../../context/FileUploadContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import BulkUploadDropFileInput from "./BulkUploadDropFileInput";
import BulkUploadPageTable from "./BulkUploadPageTable";
import BulkUploadProgress from "./BulkUploadProgress";
import pako from "pako";

const BulkUpload = () => {
	const [showProgress, setShowProgress] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({});
	const [getStatusIntervalId, setGetStatusIntervalId] = useState(null);

	const navigate = useNavigate();
	const controller = useRef(new AbortController());
	const { user } = useAuth0();
	const accessToken = useAuth0Token();

	const {
		state: { tableData },
		action,
	} = useFileUpload();

	const doFileUpload = () => {
		for (const eachFile of tableData) {
			let prog = {
				detail: "",
				percentage: 1,
				cellId: eachFile.cellId,
				size: eachFile.file.size,
			};
			setUploadProgress((prev) => {
				return {
					...prev,
					[eachFile.cellId]: prog,
				};
			});
			const formData = new FormData();
			const reader = new FileReader();
			/* eslint-disable */
			reader.onload = (e) => {
				const fileAsArray = new Uint8Array(e.target.result);
				const compressedFileArray = pako.gzip(fileAsArray);
				const compressedFile = compressedFileArray.buffer;
				const dataToUpload = new Blob([compressedFile], {
					type: eachFile.type,
				});
				const fileToUpload = new Blob([dataToUpload], { type: eachFile.type });
				formData.append("file", fileToUpload, eachFile.name);
				formData.append("cell_id", eachFile.cellId);
				axios
					.post("/upload/cells/generic", formData, {
						signal: controller.current.signal,
						headers: {
							"Content-Type": "multipart/form-data",
							Authorization: `Bearer ${accessToken}`,
						},
						onUploadProgress: (progressEvent) => {
							let percentage = Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
							prog = {
								detail: percentage === 100 ? "completed" : "in progress",
								percentage: percentage,
								cellId: eachFile.cellId,
								step: "Uploading",
								size: eachFile.file.size,
							};
							setUploadProgress((prev) => {
								return {
									...prev,
									[eachFile.cellId]: prog,
								};
							});
							if (percentage === 100) {
								getStatus(eachFile.cellId);
							}
						},
					})
					.then((response) => {
						if (response.data.status === 200) {
							if (response.data.detail === "Success") {
								// pass
							}
						}
					})
					.catch((error) => {
						console.error("file upload err", error);
					});
			};
			reader.readAsArrayBuffer(eachFile.file);
		}
	};

	const getStatus = (cellId) => {
		let errorCount = 0;
		let params = new URLSearchParams();
		params.append("cell_id", cellId);
		params.append("email", user.email);

		const idInterval = setInterval(() => {
			axios
				.get(`/upload/cells/status`, {
					params: params,
				})
				.then((res) => {
					const { percentage, steps, message } = res.data.records?.[cellId];
					setUploadProgress((prev) => {
						return {
							...prev,
							[cellId]: {
								cellId: cellId,
								getStatus: true,
								percentage: percentage,
								step: steps,
								message: message,
							},
						};
					});
					if (parseInt(percentage) === 100) {
						clearInterval(idInterval);
					} else if (parseInt(percentage) === -1) {
						setUploadProgress((prev) => {
							return {
								...prev,
								[cellId]: {
									cellId: cellId,
									getStatus: true,
									percentage: percentage,
									step: steps,
									message: message,
								},
							};
						});
						clearInterval(idInterval);
					}
				})
				.catch((error) => {
					errorCount++;
					if (errorCount > 1) clearInterval(idInterval);
					console.error(error);
				});
		}, 5000);
		setGetStatusIntervalId(idInterval);
	};

	const handleUpload = () => {
		setShowProgress(true);
		const initialRequestBody = tableData.forEach((file) => {
			delete file.file;
		});
		axios
			.post("/upload/cells/initialize", JSON.stringify(initialRequestBody), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then((response) => {
				if (response.status !== 200) return;
				doFileUpload();
			})
			.catch((error) => {
				console.error("init file upload err", error.response.data.detail);
				message.error(error.response.data.detail);
				message.error(error.response.data.detail);
			});
	};

	const isRedirection = () => {
		const valuesArray = Object.values(uploadProgress);
		function isValid(element) {
			const { getStatus, message, percentage, step } = element;
			return getStatus === true && message === "COMPLETED" && percentage === 100 && step === "COMPLETED";
		}
		return valuesArray.every(isValid) && !!valuesArray.length;
	};

	useEffect(() => {
		if (isRedirection()) {
			setTimeout(() => navigate("/dashboard"), 1000);
		}
	}, [uploadProgress]);

	useEffect(() => {
		const abort = controller.current;

		return () => {
			if (!getStatusIntervalId) return;
			abort.abort();
			clearInterval(getStatusIntervalId);
		};
	}, []);

	return (
		<div className="p-2 mt-1">
			<PageHeader className="site-page-header mb-1 " title="Upload" ghost={false}></PageHeader>
			{showProgress ? (
				<BulkUploadProgress progressObject={uploadProgress} />
			) : (
				<div>
					<div className="container mt-3">
						<BulkUploadDropFileInput />
					</div>
					<div>
						<BulkUploadPageTable onUpload={handleUpload} />
					</div>
				</div>
			)}
		</div>
	);
};

export default BulkUpload;
