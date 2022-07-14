import React, { useState, useEffect, useRef } from "react";
import DropFileInput from "../components/upload/DropFileInput";
import styles from "./UploadPage.module.css";
import axios from "axios";
import { Radio, Typography, message, Alert } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import pako from "pako";
import { useTransition, animated } from "react-spring";
import UploadPageForms from "../components/upload/UploadPageForms";
import ProcessUpload from "../components/upload/ProcessUpload";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0Token } from "../utility/useAuth0Token";
import { audit } from "../auditAction/audit";
import mixpanel from "mixpanel-browser";

const { Title } = Typography;

const UploadPage = () => {
	const uploadPageFormsRef = useRef();
	const navigate = useNavigate();
	const location = useLocation();

	const [pageType, setPageType] = useState("cycle-test");
	const [files, setFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState({});
	const [fileUploadType, setFileUploadType] = useState("");
	const [reUpload, setReUpload] = useState(false);
	const [intervalId, setIntervalId] = useState(null);
	const [shallRedirectToDashBoard, setShallRedirectToDashBoard] = useState(false);
	const [filesUploadedCount, setFilesUploadedCount] = useState(0);
	const [showProcessing, setShowProcessing] = useState(false);
	const [processingProgress, setProcessingProgress] = useState({
		message: "",
		percentage: 0,
	});
	const [processingProgressMsg, setprocessingProgressMsg] = useState("Please wait while we process your uploads.");

	const { user } = useAuth0();
	const accessToken = useAuth0Token();

	const transition = useTransition(showProcessing, {
		from: { x: -600, opacity: 0 },
		enter: { x: 0, opacity: 1 },
		// leave: { x: -600, opacity: 0 },
	});

	// used to clearInterval for status
	useEffect(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [intervalId]);

	useEffect(() => {
		if (location.pathname === "/upload/abuse-test") {
			setPageType("abuse-test");
		} else if (location.pathname === "/upload/cycle-test" || location.pathname === "/upload") {
			setPageType("cycle-test");
			setFileUploadType("generic");
		}
		uploadPageFormsRef.current.resetForm();
	}, [location.pathname]);

	const onFileChange = (files) => {
		setUploadProgress({});
		setFiles(files);
	};

	const _initializeUploadProgress = () => {
		let initUploadProgress = {};
		files.forEach((file) => {
			initUploadProgress[file.name] = {
				detail: "IN PROGRESS",
				percentage: 1,
			};
		});
		setUploadProgress({ ...uploadProgress, ...initUploadProgress });
	};

	const _getUploadEndpoint = () => {
		switch (fileUploadType) {
			case "maccor":
				return "/upload/cells/maccor";
			case "generic":
				return "/upload/cells/generic";
			case "arbin":
				return "/upload/cells/arbin";
			case "snl":
				return "/upload/cells/snl";
			case "ornl":
				return "/upload/cells/ornl";
			default:
				return;
		}
	};

	const doFileUpload = (cellId) => {
		mixpanel.time_event("file_upload");
		setReUpload(false);
		let endpoint = _getUploadEndpoint();
		_initializeUploadProgress();
		files.forEach((file) => {
			const formData = new FormData();
			const reader = new FileReader();
			reader.onload = (e) => {
				const fileAsArray = new Uint8Array(e.target.result);
				const compressedFileArray = pako.gzip(fileAsArray);
				const compressedFile = compressedFileArray.buffer;
				const dataToUpload = new Blob([compressedFile], { type: file.type });
				const fileToUpload = new Blob([dataToUpload], { type: file.type });
				formData.append("file", fileToUpload, file.name);
				formData.append("cell_id", cellId);
				axios
					.post(endpoint, formData, {
						headers: {
							"Content-Type": "multipart/form-data",
							Authorization: `Bearer ${accessToken}`,
						},
						onUploadProgress: (progressEvent) => {
							let percentage = Math.ceil((progressEvent.loaded / progressEvent.total) * 100);
							let prog = {
								detail: percentage === 100 ? "completed" : "in progress",
								percentage: percentage,
							};
							setUploadProgress((prev) => {
								return {
									...prev,
									[file.name]: prog,
								};
							});
							if (prog.detail === "completed") {
								// update count of files uploaded
								setFilesUploadedCount((c) => {
									if (c + 1 === files.length) {
										setTimeout(() => {
											setShowProcessing(true);
											window.scrollTo(0, 0);
											getStatus(cellId);
										}, 1000);
									}
									return c + 1;
								});
							}
						},
					})
					.then((response) => {
						if (response.data.status === 200) {
							if (response.data.detail === "Success") {
							}
						}
					})
					.catch((error) => {
						console.error("file upload err", error);
					});
			};
			reader.readAsArrayBuffer(file);
		});
	};

	const fileUploadHandler = async (e) => {
		let cellMetadata = uploadPageFormsRef.current.getCellMetadata();
		if (!cellMetadata.cell_id) {
			message.warning("Please provide Cell Id");
			message.warning("Please provide Cell Id");
			return;
		}
		if (!fileUploadType) {
			message.warning("Please Select File-Type!");
			message.warning("Please Select File-Type!");
			return;
		}
		let uploadInitReqData = new FormData();
		uploadInitReqData.append("file_count", files.length);
		for (const key in cellMetadata) {
			const value = cellMetadata[key];
			uploadInitReqData.append(key, value);
		}
		if (pageType === "cycle-test") {
			let cycleTestMetadata = uploadPageFormsRef.current.getCycleTestMetadata();
			for (const key in cycleTestMetadata) {
				const value = cycleTestMetadata[key];
				uploadInitReqData.append(key, value);
			}
			uploadInitReqData.append("test_type", "cycle");
		} else if (pageType === "abuse-test") {
			let abuseTestMetadata = uploadPageFormsRef.current.getAbuseTestMetadata();
			for (const key in abuseTestMetadata) {
				const value = abuseTestMetadata[key];
				uploadInitReqData.append(key, value);
			}
			uploadInitReqData.append("test_type", "abuse");
		}
		// initial upload request
		axios
			.post("/upload/cells/initialize", uploadInitReqData, {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then((response) => {
				if (response.status === 200) {
					doFileUpload(cellMetadata.cell_id);
				} else if (response.status === 400) {
					console.error(response);
					message.error(response.data.detail);
					message.error(response.data.detail);
				}
			})
			.catch((error) => {
				console.error("init file upload err", error.response.data.detail);
				message.error(error.response.data.detail);
				message.error(error.response.data.detail);
			});
	};

	const _getFileSize = () => {
		let size = 0;
		files.map((f) => (size += f.size));
		return size;
	};

	const getStatus = (cellId) => {
		let errorCount = 0;
		let params = new URLSearchParams();
		params.append("cell_id", cellId);
		params.append("email", user.email);
		let intervalId = setInterval(() => {
			axios
				.get(`/upload/cells/status`, {
					params: params,
					// headers: {
					// 	Authorization: `Bearer ${accessToken}`,
					// },
				})
				.then((res) => {
					if (res.data.records) {
						if (parseInt(res.data.records.percentage) === 100) {
							// fire mixpanel event
							mixpanel.track("file_upload", { file_size: _getFileSize() });
							// redirect user
							let navigateTo = pageType === "cycle-test" ? "/dashboard" : "/dashboard/abuse-test";
							setTimeout(
								() =>
									navigate(navigateTo, {
										state: { from: "upload", cellId: cellId },
									}),
								1000
							);
							clearInterval(intervalId);
						} else if (parseInt(res.data.records.percentage) === -1) {
							setprocessingProgressMsg(res.data.records.message || "Oops! Error occured while processing uploads...");
							clearInterval(intervalId);
						}
						setProcessingProgress({ ...res.data.records });
					}
				})
				.catch((err) => {
					if (errorCount > 5) {
						clearInterval(intervalId);
						setprocessingProgressMsg("Oops! Error occured while processing uploads...");
					}
					console.error(err);
					errorCount++;
				});
		}, 1000);
		setIntervalId(intervalId);
		return intervalId;
	};

	return (
		<div className={styles.wrapper + " container"}>
			<div className="row">
				<div className="col-md-12 pb-5">
					<div>
						<Title level={3} style={{ paddingTop: "1rem" }}>
							Upload {pageType === "cycle-test" ? "Cycle-Test" : "Abuse Test"}
						</Title>
						{transition((style, item) => {
							return item ? (
								<animated.div style={style}>
									<ProcessUpload
										processingProgressMsg={processingProgressMsg}
										processingProgress={processingProgress}
										styles={styles}
									/>
								</animated.div>
							) : (
								<animated.div style={style}>
									<div className="my-3">
										<Alert
											closable
											description={
												pageType === "cycle-test" ? (
													<div>
														<div className="para">
															We provide support for generic csv files:
															<br />
															<p>
																CSV with columns <b>(cycle, test_time, current, voltage)</b>
																<br></br>
																Units for columns ={" "}
																<b>cycle (#), test_time (seconds), current (Amps), voltage (Volts)</b>
																<br></br> <span className="text-muted">Note: For current (A) charging is Positive</span>
															</p>
														</div>
													</div>
												) : (
													<div>
														<div className="para">We provide support for ORNL/SNL excel files</div>
													</div>
												)
											}
											type="info"
											showIcon
										/>
									</div>
									<UploadPageForms pageType={pageType} ref={uploadPageFormsRef} />
									{pageType !== "cycle-test" && (
										<div className="my-2">
											<Title level={5}>File-Type:</Title>
											<Radio.Group onChange={(e) => setFileUploadType(e.target.value)} buttonStyle="solid">
												{pageType === "cycle-test" ? (
													<>
														<Radio.Button value="arbin">arbin</Radio.Button>
														<Radio.Button value="maccor">maccor</Radio.Button>
														<Radio.Button value="generic">generic</Radio.Button>
													</>
												) : (
													<>
														<Radio.Button value="ornl">ORNL</Radio.Button>
														<Radio.Button value="snl">SNL</Radio.Button>
													</>
												)}
											</Radio.Group>
										</div>
									)}

									<div className="py-2">
										<DropFileInput
											preloadFile={location.state?.file || null}
											onFileChange={(files) => onFileChange(files)}
											fileUploadHandler={fileUploadHandler}
											uploadProgress={uploadProgress}
											shallRedirectToDashBoard={shallRedirectToDashBoard}
											reUpload={reUpload}
											pageType={pageType}
										/>
									</div>
								</animated.div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default UploadPage;
