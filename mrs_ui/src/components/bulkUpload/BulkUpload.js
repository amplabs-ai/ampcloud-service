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
	const [newFiles, setNewFiles] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [showProgress, setShowProgress] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({});
	const [getStatusIntervalId, setGetStatusIntervalId] = useState(null);

	const navigate = useNavigate();
	const controller = useRef(new AbortController());
	const { user } = useAuth0();
	const accessToken = useAuth0Token();

	// const handleFileChange = (files) => {
	// 	setUploadProgress({});
	// 	setNewFiles(files);
	// };

	const {
		state: { filesFromDropFileInput },
		action,
	} = useFileUpload();

	useEffect(() => {
		setUploadProgress({});
		setNewFiles(filesFromDropFileInput);
	}, [filesFromDropFileInput]);

	const doFileUpload = () => {
		for (const eachFile of tableData) {
			let prog = {
				detail: "",
				percentage: 1,
				cellId: eachFile.cell_id,
				size: eachFile.file.size,
			};
			setUploadProgress((prev) => {
				return {
					...prev,
					[eachFile.cell_id]: prog,
				};
			});

			const formData = new FormData();
			const reader = new FileReader();
			reader.onload = (e) => {
				const fileAsArray = new Uint8Array(e.target.result);
				const compressedFileArray = pako.gzip(fileAsArray);
				const compressedFile = compressedFileArray.buffer;
				const dataToUpload = new Blob([compressedFile], {
					type: eachFile.type,
				});
				const fileToUpload = new Blob([dataToUpload], { type: eachFile.type });
				formData.append("file", fileToUpload, eachFile.name);
				formData.append("cell_id", eachFile.cell_id);
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
								cellId: eachFile.cell_id,
								step: "Uploading",
								size: eachFile.file.size,
							};
							setUploadProgress((prev) => {
								return {
									...prev,
									[eachFile.cell_id]: prog,
								};
							});
							if (percentage === 100) {
								getStatus(eachFile.cell_id);
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

	const confirmUniqueCellIds = () => {
		const cellIdsArray = tableData.map((eachFile) => {
			const { cell_id } = eachFile;
			return { cellId: cell_id.trim() };
		});
		const valueArr = cellIdsArray.map((item) => item.cellId);
		const isDuplicate = valueArr.some((item, idx) => valueArr.indexOf(item) !== idx);
		return isDuplicate;
	};

	const handleUpload = () => {
		if (!tableData.length) {
			message.warning("There are no files to Upload");
			message.warning("There are no files to Upload");
			return;
		}
		if (confirmUniqueCellIds()) {
			message.warning("Please Provide Unique Values of Cell Ids(dupilication is NOT allowed)");
			message.warning("Please Provide Unique Values of Cell Ids(dupilication is NOT allowed)");
			return;
		}
		setShowProgress(true);
		const intialRequestedBody = tableData.map((eachFile) => {
			let tempObject = { ...eachFile };
			delete tempObject.file;
			return tempObject;
		});
		axios
			.post("/upload/cells/initialize", JSON.stringify(intialRequestedBody), {
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
		<>
			<PageHeader className="site-page-header mb-1 shadow " title="Upload" ghost={false}></PageHeader>
			{showProgress ? (
				<BulkUploadProgress progressObject={uploadProgress} />
			) : (
				<div>
					<div className="container mt-3">
						<BulkUploadDropFileInput />
					</div>
					<div className="mb-5">
						<BulkUploadPageTable
							newFiles={newFiles}
							onUpload={handleUpload}
							onGetTableData={(val) => setTableData(val)}
						/>
					</div>
				</div>
			)}
		</>
	);
};

export default BulkUpload;
