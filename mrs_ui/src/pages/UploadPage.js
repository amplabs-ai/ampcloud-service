import React, { useState, useEffect } from "react";
import DropFileInput from "../components/DropFileInput";
import styles from "./UploadPage.module.css";
import axios from "axios";
import { Radio, Typography } from "antd";

const { Title } = Typography;

const UploadPage = () => {
	const [files, setFiles] = useState([]);
	const [uploadProgress, setUploadProgress] = useState({});
	const [fileUploadType, setFileUploadType] = useState("arbin");

	const [reUpload, setReUpload] = useState(false);

	const [intervalId, setIntervalId] = useState(null);

	const [shallRedirectToDashBoard, setShallRedirectToDashBoard] =
		useState(false);

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

	const fileUploadHandler = (e) => {
		let formData = new FormData();
		files.forEach((file) => {
			formData.append("file", file);
		});
		let endpoint = "";
		switch (fileUploadType) {
			case "maccor":
				endpoint = "http://localhost:4000/upload/cells/maccor";
				break;
			case "generic":
				endpoint = "http://localhost:4000/upload/cells/generic";
				break;
			default:
				endpoint = "http://localhost:4000/upload/cells/arbin";
				break;
		}
		let x = getStatus();
		setReUpload(false);
		axios
			.post(endpoint, formData, {
				headers: {
					"Content-Type": "multipart/form-data",
				},
			})
			.then((response) => {
				console.log("file upload finish", response.data.records);
				console.log("uploadProgress", uploadProgress);
				let redirect = true;
				for (const key in response.data.records) {
					const file = response.data.records[key];
					if (file.percentage === -1) {
						redirect = false;
						setReUpload(true);
						setUploadProgress((o) => {
							return {};
						});
						setTimeout(() => {
							clearInterval(x);
						}, 2000);
						break;
					}
				}
				console.log("redirect", redirect);
				if (redirect) {
					setShallRedirectToDashBoard(true);
				}
			})
			.catch((error) => {
				console.log("file upload err", error);
			});
	};

	const getStatus = () => {
		let intervalId = setInterval(() => {
			axios
				.get("http://localhost:4000/upload/cells/status")
				.then((res) => {
					console.log("status", res.data.records);
					setUploadProgress({ ...uploadProgress, ...res.data.records });
				})
				.catch((err) => {
					console.log(err);
				});
		}, 500);
		console.log("intervalID", intervalId);
		setIntervalId(intervalId);
		return intervalId;
	};

	return (
		<div className={styles.wrapper + " container"}>
			<div className="row">
				<div className="col-md-12 p-2">
					<div className="px-3">
						<p className="para fw-light">
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
							cursus vel diam nec commodo. Suspendisse tincidunt mi at dui
							tincidunt gravida. Duis id mattis magna.<br></br> Nulla facilisi.
							Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
							cursus vel diam nec commodo. Suspendisse tincidunt mi at dui
							tincidunt gravida. Duis id mattis magna. Nulla facilisi.
						</p>
					</div>
				</div>
				<div className={`col-md-12 ${styles.uploadSection}`}>
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
				</div>
			</div>
		</div>
	);
};

export default UploadPage;
