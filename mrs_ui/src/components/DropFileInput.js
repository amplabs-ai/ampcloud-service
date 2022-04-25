import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import blankFileImage from "../assets/file-blank-solid-240.png";
import uploadImg from "../assets/cloud-upload-regular-240.png";
import "./drop-file-input.css";
import { Progress, Typography, Alert, List, Avatar, Button, Modal, Spin, message } from "antd";
import { FaTimes } from "react-icons/fa";
import { FaCloudUploadAlt, FaExclamationCircle } from "react-icons/fa";
import Papa from "papaparse";

const { Text } = Typography;

const REQUIRED_HEADERS = ["test_time", "cycle", "current", "voltage"];

const DropFileInput = (props) => {
	console.log("props.uploadProgress", props.uploadProgress);
	const wrapperRef = useRef(null);
	const [fileList, setFileList] = useState([]);
	const [fileValidationErrs, setFileValidationErrs] = useState([]);
	const [shallShowFileValModal, setShallShowFileValModal] = useState(false);

	const onDragEnter = () => wrapperRef.current.classList.add("dragover");
	const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
	const onDrop = () => wrapperRef.current.classList.remove("dragover");

	const [fileName, setFileName] = useState("data.csv");

	const onFileDrop = (e) => {
		let fileName = e.target.files[0].name;
		let actualFile = e.target.files[0];
		if (props.pageType !== "cycle-test") {
			props.onFileChange([actualFile]);
			console.log("[[actualFile]]", [actualFile]);
			setFileList([actualFile]);
		} else {
			setShallShowFileValModal(true);
			// Parsing file data
			let data = [];
			let newFile = null;
			Papa.parse(e.target.files[0], {
				header: true,
				skipEmptyLines: true,
				fastMode: true,
				transformHeader: function (h, i) {
					// fix cycle column header
					console.log("transformHeader", h, i);
					if (h.toLowerCase().includes("cycle")) return "cycle";
					if (h.toLowerCase().includes("test") && h.toLowerCase().includes("time")) return "test_time";
					if (h.toLowerCase().includes("voltage")) return "voltage";
					if (h.toLowerCase().includes("current")) return "current";
					return h;
				},
				dynamicTyping: true,
				step: function (results, parser) {
					if (results.errors.length) {
						parser.abort();
						message.error("Error Parsing File");
						message.error("Error Parsing File");
						return;
					} else {
						data.push(results.data);
					}
				},
				complete: function (results) {
					if (data.length) {
						console.log("papaparse", data);
						if (props.pageType === "cycle-test") {
							newFile = _checkCycleTestCsv(data, fileName);
							if (newFile) {
								setShallShowFileValModal(false);
								props.onFileChange([newFile]);
								console.log("[newFile]", [newFile]);
								setFileList([newFile]);
							}
						} else if (props.pageType === "abuse-test") {
							// _validateAbuseTestCsv(data);
							// props.onFileChange([actualFile]);
							// console.log("[[actualFile]]", [actualFile]);
							// setFileList([actualFile]);
						}
					} else {
						console.log("file is empty!");
					}
				},
			});
		}
	};

	const _checkCycleTestCsv = (data, fileName) => {
		setFileValidationErrs([]); // reset err, file_preview_icon
		if (_checkHeaders(data)) {
			return _fixCycleIndex(_sortTestTime(data), fileName);
		} else {
			return false;
		}
	};

	const _checkHeaders = (data) => {
		let headers = Object.keys(data[0]).map((h) => h.toLowerCase());
		console.log("h", headers);
		let missingHeaders = [];
		missingHeaders = REQUIRED_HEADERS.filter(function (v) {
			return headers.indexOf(v) == -1;
		});
		console.log("missing", missingHeaders);
		if (missingHeaders.length) {
			setFileValidationErrs((prev) => [
				...prev,
				`Missing column headers: ${missingHeaders
					.map((h) => h)
					.join(", ")} [Required Headers: cycle, test_time, current, voltage]`,
			]);
			// find duplicate headers
			// let duplicates = [];
			// const tempArray = [...headers].sort();
			// for (let i = 0; i < tempArray.length; i++) {
			// 	if (tempArray[i + 1] === tempArray[i]) {
			// 		duplicates.push(tempArray[i]);
			// 	}
			// }
			// console.log("duplicates", duplicates);
			return false;
		} else {
			return true;
		}
	};

	const _sortTestTime = (data) => {
		let dataAfterTimeSort = data.sort(function (a, b) {
			return a["test_time"] - b["test_time"];
		});
		return dataAfterTimeSort;
	};

	const _fixCycleIndex = (data, fileName) => {
		let x = data.map((d, i, arr) => {
			if (i !== 0) {
				if (arr[i]["cycle"] < arr[i - 1]["cycle"]) {
					return {
						...d,
						cycle: arr[i - 1]["cycle"],
					};
				}
			}
			return d;
		});
		console.log("fixCycleIndexData", x);
		console.log("fixCycleIndexData csv", Papa.unparse(x));

		let parts = [new Blob([Papa.unparse(x)], { type: "text/plain" })];

		// Construct a file
		let file = new File(parts, fileName, {
			lastModified: new Date(0), // optional - default = now
			type: "text/csv", // optional - default = ''
		});

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			complete: function (results) {
				console.log("re-parse", results.data);
			},
		});

		if (file.size) {
			return file;
		} else {
			setShallShowFileValModal(false);
			message.error("Error Parsing File");
			message.error("Error Parsing File");
			return null;
		}
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
			{shallShowFileValModal && (
				<Modal
					centered
					visible={true}
					closable={fileValidationErrs.length}
					onCancel={() => setShallShowFileValModal(false)}
					footer={null}
					bodyStyle={{ padding: 10 }}
				>
					{fileValidationErrs.length ? (
						<div style={{ color: "red" }}>
							<ul>
								{fileValidationErrs.map((err) => (
									<li key={err}>{err}</li>
								))}
							</ul>
						</div>
					) : (
						<>
							<div className="text-center">
								<h5>Parsing File...</h5>
								<Spin size="large" />
							</div>
						</>
					)}
				</Modal>
			)}
			{fileList.length < 1 && (
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
					<input
						type="file"
						value=""
						accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .txt"
						onChange={onFileDrop}
						// multiple
					/>
				</div>
			)}
			{fileList.length > 0 ? (
				<div className="drop-file-preview">
					<div className="mb-1 d-flex justify-content-between">
						<Text type="secondary">Ready to upload</Text>
						<Button
							type="primary"
							onClick={(e) => {
								props.fileUploadHandler(e);
							}}
							icon={<FaCloudUploadAlt />}
							size="large"
							// loading={uploadBtnDisatrybled}
						>
							&nbsp;&nbsp;Upload
						</Button>
					</div>
					<div className="mb-4">
						<List
							dataSource={fileList}
							renderItem={(item) => (
								<List.Item
									key={item.id}
									extra={
										!Object.keys(props.uploadProgress).length && (
											<span title="Remove File" style={{ cursor: "pointer" }} onClick={() => fileRemove(item)}>
												<FaTimes />
											</span>
										)
									}
								>
									<List.Item.Meta
										avatar={<Avatar src={blankFileImage} />}
										title={item.name}
										description={
											getProgress(item.name).value ? (
												<>
													{getProgress(item.name).message ? (
														<Alert message={getProgress(item.name).message} type="error" showIcon />
													) : (
														<Progress percent={getProgress(item.name).value} status={getProgress(item.name).status} />
													)}
												</>
											) : (
												bytesToSize(item.size)
											)
										}
									/>
									{/* <br />
									{fileValidationErrs.length ? (
										<div style={{ position: "absolute", top: "90%", color: "red" }}>
											<ul>
												{fileValidationErrs.map((err) => (
													<li key={err}>{err}</li>
												))}
											</ul>
										</div>
									) : (
										<div></div>
									)} */}
								</List.Item>
							)}
						/>
					</div>
				</div>
			) : null}
		</>
	);
};

DropFileInput.propTypes = {
	onFileChange: PropTypes.func,
};

export default React.memo(DropFileInput);
