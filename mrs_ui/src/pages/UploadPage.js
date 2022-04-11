import React, { useState, useEffect } from "react";
import DropFileInput from "../components/DropFileInput";
import styles from "./UploadPage.module.css";
import axios from "axios";
import { Radio, Typography, Progress, Form, Input, message } from "antd";
import { useNavigate } from "react-router-dom";
import pako from "pako";
import { useTransition, animated } from "react-spring";

import UploadPageForms from "../components/UploadPageForms";

const { Title } = Typography;

const UploadPage = () => {
	const navigate = useNavigate();

	const [files, setFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState({});
	const [fileUploadType, setFileUploadType] = useState("arbin");
	const [reUpload, setReUpload] = useState(false);
	const [intervalId, setIntervalId] = useState(null);
	const [shallRedirectToDashBoard, setShallRedirectToDashBoard] = useState(false);
	const [userInputCellId, setUserInputCellId] = useState("");
	const [filesUploadedCount, setFilesUploadedCount] = useState(0);
	const [showProcessing, setShowProcessing] = useState(false);
	const [processingProgress, setProcessingProgress] = useState({
		message: "",
		percentage: 0,
	});
	const [processingProgressMsg, setprocessingProgressMsg] = useState("Please Wait... We're processing your uploads.");

	const transition = useTransition(showProcessing, {
		from: { x: -300, opacity: 0 },
		enter: { x: 0, opacity: 1 },
		leave: { x: -300, opacity: 0 },
	});

	// used to clearInterval for status
	useEffect(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [intervalId]);

	const onFileChange = (files) => {
		console.log(files);
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
			default:
				return "/upload/cells/arbin";
		}
	};

	const showProcessingBar = () => {
		setShowProcessing(true);
		getStatus();
	};

	const doFileUpload = () => {
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
				formData.append("cell_id", userInputCellId);

				console.log("compression size", fileToUpload.size);
				axios
					.post(endpoint, formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
						onUploadProgress: (progressEvent) => {
							console.log(file.name, progressEvent);
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
											console.log("show processing...");
											showProcessingBar();
										}, 1000);
									}
									return c + 1;
								});
							}
						},
					})
					.then((response) => {
						console.log("file upload finish", response, response.status === 200);
						if (response.data.status === 200) {
							if (response.data.detail === "Success") {
								console.log("upload finish", file.name);
							}
						}
						// _shallRedirectToDashboard(clearIntervalId, response);
					})
					.catch((error) => {
						console.log("file upload err", error);
						// setReUpload(true);
					});
			};
			reader.readAsArrayBuffer(file);
		});
	};

	const fileUploadHandler = async (e) => {
		if (!userInputCellId) {
			message.warning("Please provide Cell Id");
			message.warning("Please provide Cell Id");
			return;
		}
		let uploadInitReqData = new FormData();
		uploadInitReqData.append("cell_id", userInputCellId);
		uploadInitReqData.append("file_count", files.length);
		// initial upload request
		axios
			.post("/upload/cells/initialize", uploadInitReqData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((response) => {
				if (response.status === 200) {
					console.log("initiate file upload success!");
					doFileUpload();
				}
			})
			.catch((error) => {
				console.log("init file upload err", error);
			});
	};

	const _shallRedirectToDashboard = (clearIntervalId, response) => {
		let redirect = true;
		if (!response.data.records) {
			setReUpload(true);
			setTimeout(() => {
				clearInterval(clearIntervalId);
			}, 1000);
		}
		for (const key in response.data.records) {
			const file = response.data.records[key];
			if (file.percentage === -1) {
				redirect = false;
				setReUpload(true);
				setTimeout(() => {
					clearInterval(clearIntervalId);
				}, 1000);
				// setUploadProgress({});
				break;
			}
		}
		console.log("redirect", redirect);
		if (redirect) {
			setTimeout(() => navigate("/dashboard"), 1500);
		}
	};

	const getStatus = () => {
		let errorCount = 0;
		let intervalId = setInterval(() => {
			axios
				.get(`/upload/cells/status/${userInputCellId}`)
				.then((res) => {
					console.log("status", res.data.records);
					if (res.data.records) {
						if (parseInt(res.data.records.percentage) === 100) {
							// redirect user
							setTimeout(() => navigate("/dashboard"), 1000);
							clearInterval(intervalId);
						} else if (parseInt(res.data.records.percentage) === -1) {
							setprocessingProgressMsg("Oops! Error occured while processing uploads...");
							clearInterval(intervalId);
						}
						setProcessingProgress({ ...res.data.records });
					}
				})
				.catch((err) => {
					if (errorCount > 5) {
						clearInterval(intervalId);
					}
					console.log(err);
					errorCount++;
				});
		}, 1000);
		setIntervalId(intervalId);
		return intervalId;
	};

	const setCellMetadataObject = (event) => {
		setUserInputCellId(event[0].value);
		console.log(event[0].name[0], event[0].value);
	};

	return (
		<div className={styles.wrapper + " container pb-5"}>
			<div className="row">
				<div className={`col-md-12 ${styles.uploadSection}`}>
					<div>
						{transition((style, item) => {
							return item ? (
								<animated.div style={style}>
									<div className={styles.processingStatusBar}>
										<Title className="py-4" level={2}>
											{processingProgressMsg}
										</Title>
										<Progress
											type="circle"
											width="300px"
											status={Math.floor(parseInt(processingProgress.percentage)) === -1 ? "exception" : ""}
											percent={Math.floor(processingProgress.percentage)}
											format={(percent) => <div className="fs-4">{percent}%</div>}
										/>
									</div>
								</animated.div>
							) : (
								<animated.div style={style}>
									<div className="card col-md-12 p-2 my-3 w-100">
										<div className="card-body">
											<p className="para">
												We provide support for Arbin, Maccor cell test files.<br></br>
												Arbin: xlsx format Maccor: txt format
											</p>
											<p className="para">
												We also provide support for generic csv files:<br></br>
												CSV with columns (cycle, test_time, current, voltage)<br></br>
												units for columns = cycle (#), test_time (seconds), current (Amps), voltage (Volts)<br></br>{" "}
												Note: For current (A) charging is Positive
											</p>
										</div>
									</div>
									<div>
										<Form
											name="basic"
											labelCol={{ span: 0 }}
											wrapperCol={{ span: 8 }}
											initialValues={{ remember: true }}
											onFieldsChange={(e) => setCellMetadataObject(e)}
											layout="vertical"
										>
											<Form.Item
												label="Cell Id"
												name="cell_id"
												rules={[{ required: true, message: "Please provide Cell Id!" }]}
											>
												<Input />
											</Form.Item>
										</Form>
									</div>
									<div className="mb-2">
										<Title level={5}>File-Type:</Title>
										<Radio.Group
											defaultValue={fileUploadType}
											onChange={(e) => setFileUploadType(e.target.value)}
											buttonStyle="solid"
										>
											<Radio.Button value="arbin">arbin</Radio.Button>
											<Radio.Button value="maccor">maccor</Radio.Button>
											<Radio.Button value="generic">generic</Radio.Button>
										</Radio.Group>
									</div>
									<DropFileInput
										onFileChange={(files) => onFileChange(files)}
										fileUploadHandler={fileUploadHandler}
										uploadProgress={uploadProgress}
										shallRedirectToDashBoard={shallRedirectToDashBoard}
										reUpload={reUpload}
									/>
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

// {showProcessing ? (
// 	<div>
// 		<Progress type="circle" width="200px" percent={75} />
// 	</div>
// ) : (
// 	<>
// 		<div className="mb-2">
// 			<Title level={5}>File-Type:</Title>
// 			<Radio.Group
// 				defaultValue={fileUploadType}
// 				onChange={(e) => setFileUploadType(e.target.value)}
// 				buttonStyle="solid"
// 			>
// 				<Radio.Button value="arbin">arbin</Radio.Button>
// 				<Radio.Button value="maccor">maccor</Radio.Button>
// 				<Radio.Button value="generic">generic</Radio.Button>
// 			</Radio.Group>
// 		</div>
// 		<DropFileInput
// 			onFileChange={(files) => onFileChange(files)}
// 			fileUploadHandler={fileUploadHandler}
// 			uploadProgress={uploadProgress}
// 			shallRedirectToDashBoard={shallRedirectToDashBoard}
// 			reUpload={reUpload}
// 		/>
// 	</>
// )}
