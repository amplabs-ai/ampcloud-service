import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import blankFileImage from "../assets/file-blank-solid-240.png";
import uploadImg from "../assets/cloud-upload-regular-240.png";
import "./drop-file-input.css";
import { Progress, Typography, Alert } from "antd";
import { FaTimes } from "react-icons/fa";

const { Text } = Typography;

const DropFileInput = (props) => {
	console.log("props.uploadProgress", props.uploadProgress);
	const wrapperRef = useRef(null);
	const [fileList, setFileList] = useState([]);
	const [uploadBtnDisabled, setUploadBtnDisabled] = useState(false);

	const onDragEnter = () => wrapperRef.current.classList.add("dragover");
	const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
	const onDrop = () => wrapperRef.current.classList.remove("dragover");

	const onFileDrop = (e) => {
		let updatedList = props.reUpload ? [] : [...fileList];
		setUploadBtnDisabled(false);
		for (let i = 0; i < e.target.files.length; i++) {
			let file = e.target.files[i];
			if (file) {
				updatedList.push(file);
			}
		}
		props.onFileChange(updatedList);
		setFileList(updatedList);
	};

	const fileRemove = (file) => {
		const updatedList = [...fileList];
		updatedList.splice(fileList.indexOf(file), 1);
		props.onFileChange(updatedList);
		setFileList(updatedList);
	};

	const bytesToSize = (bytes) => {
		let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
		if (bytes === 0) return "0 Byte";
		let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
		return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
	};

	const getProgress = (fileName) => {
		if (Object.keys(props.uploadProgress).length) {
			let progress = parseInt(props.uploadProgress[fileName]?.percentage || 0);

			return {
				value: progress,
				status: progress === 100 ? "" : progress === -1 ? "exception" : "active",
				message: progress === -1 ? props.uploadProgress[fileName].detail : "",
			};
		} else {
			return {
				value: 0,
				status: "",
			};
		}
	};

	// const shallRedirectToDashBoard = () => {
	// 	if (props.shallRedirectToDashBoard) {
	// 		setTimeout(() => navigate("/dashboard"), 1000);
	// 	}
	// };
	// shallRedirectToDashBoard();

	return (
		<>
			<div
				ref={wrapperRef}
				className="drop-file-input shadow-sm"
				onDragEnter={onDragEnter}
				onDragLeave={onDragLeave}
				onDrop={onDrop}
			>
				<div className="drop-file-input__label">
					<img src={uploadImg} alt="" />
					<p>Click or drag file to this area to upload</p>
				</div>
				<input type="file" value="" onChange={onFileDrop} multiple />
			</div>
			{fileList.length > 0 ? (
				<div className="drop-file-preview">
					<div className="mb-1">
						<Text type="secondary">Ready to upload</Text>
					</div>
					{fileList.map((item, index) => (
						<div key={index}>
							<div className="drop-file-preview__item">
								<img src={blankFileImage} alt="" />
								<div className="drop-file-preview__item__info">
									<p>{item.name}</p>
									<p>{bytesToSize(item.size)}</p>
								</div>
								{!Object.keys(props.uploadProgress).length && (
									<span
										className="drop-file-preview__item__del"
										style={{ cursor: "pointer" }}
										onClick={() => fileRemove(item)}
									>
										<FaTimes />
									</span>
								)}
							</div>
							{getProgress(item.name).value ? (
								<>
									{getProgress(item.name).message ? (
										<Alert message={getProgress(item.name).message} type="error" showIcon />
									) : (
										<Progress percent={getProgress(item.name).value} status={getProgress(item.name).status} />
									)}
								</>
							) : null}
						</div>
					))}
					<div className="my-4 text-align-right btn-lg">
						<button
							className="btn btn-outline-dark"
							style={{ float: "right" }}
							onClick={(e) => {
								// setUploadBtnDisabled(true);
								props.fileUploadHandler(e);
							}}
							disabled={uploadBtnDisabled}
						>
							Upload
						</button>
					</div>
				</div>
			) : null}
		</>
	);
};

DropFileInput.propTypes = {
	onFileChange: PropTypes.func,
};

export default DropFileInput;
