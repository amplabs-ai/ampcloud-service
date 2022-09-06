import React, { useRef, useState } from "react";
import "./drop-file-input.css";
import { Modal, Radio, Spin } from "antd";
import { useFileUpload } from "../../context/FileUploadContext";
import ColumnMapping from "./ColumnMapping";
import Papa from "papaparse";
import uploadImg from "../../../src/assets/images/cloud-upload-regular-240.png";

const MAX_FILE_LENGTH = 10;

const BulkUploadDropFileInput = (props) => {
	const wrapperRef = useRef(null);
	const [showColMapModal, setShowColMapModal] = useState(false);

	const { state, action } = useFileUpload();

	const onDragEnter = () => wrapperRef.current.classList.add("dragover");
	const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
	const onDrop = () => wrapperRef.current.classList.remove("dragover");

	const onFileDrop = async (e) => {
		let fileCountAfterDrop = state.tableData.length + [...e.target.files].length;
		if (fileCountAfterDrop > MAX_FILE_LENGTH) {
			Modal.warning({
				title: "Maximum File Limit",
				content: `You can upload maximum of ${MAX_FILE_LENGTH} files`,
			});
			return;
		}
		action.setShowParsingSpinner(true);
		let files = [...e.target.files];
		let d = files.map((a, i) => doParseFile(a, i));
		Promise.allSettled(d).then((res) => {
			action.setShowParsingSpinner(false);
			let parsedData = [];
			res.forEach((p) => {
				if (p.status === "fulfilled") {
					parsedData.push(p.value);
				} else if (p.status === "rejected") {
					// ...
					console.error("error in parsing... ", p);
				}
			});
			action.setFilesToMapHeader(parsedData);
			setShowColMapModal(!!parsedData.length);
		});
	};

	const doParseFile = async (file) => {
		return new Promise((resolve, reject) => {
			Papa.parse(file, {
				// header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				preview: 1,
				complete: function (results) {
					if (results.errors && results.errors.length) {
						reject({
							file: file.name,
							errors: results.errors,
						});
						return;
					}
					let headers = results.data[0];
					// let headers = Object.keys(results.data[0]);
					resolve({
						fileName: file.name,
						// parsedData: results.data,
						file: file,
						headers,
					});
				},
			});
		});
	};

	const onCloseMappingModal = () => {
		setShowColMapModal(false);
		action.setFilesToMapHeader([]);
	};

	return (
		<>
			<Modal
				visible={state.showParsingSpinner}
				width="auto"
				footer={null}
				closable={false}
				bodyStyle={{ textAlign: "center" }}
				centered
			>
				<h6>Parsing File(s)...</h6>
				<Spin size="large" tip="Loading..." />
			</Modal>
			<Modal
				bodyStyle={{ paddingTop: 50 }}
				centered
				visible={showColMapModal}
				closable={true}
				onCancel={onCloseMappingModal}
				footer={null}
				destroyOnClose
			>
				<ColumnMapping closeModal={onCloseMappingModal} />
			</Modal>
			<div className="mb-2 d-flex justify-content-end">
				<Radio.Group defaultValue="normalTest" onChange={(e) => action.setFileType(e.target.value)}>
					<Radio.Button value="normalTest">Single Cell Data</Radio.Button>
					<Radio.Button value="referenceTest">Pack Data</Radio.Button>
				</Radio.Group>
			</div>
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
					multiple={state.fileType === "normalTest"}
				/>
			</div>
		</>
	);
};

export default BulkUploadDropFileInput;
