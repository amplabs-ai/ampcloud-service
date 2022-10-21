import React, { useEffect, useRef } from "react";
import "./drop-file-input.css";
import { Modal, Radio, Spin } from "antd";
import { useFileUpload } from "../../context/FileUploadContext";
import ColumnMapping from "./ColumnMapping";
import Papa from "papaparse";
import uploadImg from "../../../src/assets/images/cloud-upload-regular-240.png";
import { v4 as uuidv4 } from "uuid";
import { bytesToSize } from "../../utility/bytesToSize";
import axios from "axios";
import stringSimilarity from "string-similarity";

const MAX_FILE_LENGTH = 10;

const BulkUploadDropFileInput = (props) => {
	const wrapperRef = useRef(null);

	const {
		state: { showColMapModal, tableData, showParsingSpinner, fileType, supportedColumns },
		action: {
			setShowColMapModal,
			setShowParsingSpinner,
			setFilesToMapHeader,
			setFileType,
			setSupportedColumns,
			setShowPackDataCellInput,
		},
	} = useFileUpload();

	const onDragEnter = () => wrapperRef.current.classList.add("dragover");
	const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
	const onDrop = () => wrapperRef.current.classList.remove("dragover");

	useEffect(() => {
		let endpoint = "/displayname/timeseries";
		const controller = new AbortController();
		axios
			.get(endpoint, {
				signal: controller.signal,
			})
			.then((res) => {
				let data = res.data?.records;
				data["--Ignore--"] = "";
				setSupportedColumns(res.data?.records || {});
			})
			.catch((err) => {
				console.error(err);
			});

		return () => {
			controller.abort();
		};
	}, []);

	const onFileDrop = async (e) => {
		let fileCountAfterDrop = tableData.length + [...e.target.files].length;
		if (fileCountAfterDrop > MAX_FILE_LENGTH) {
			Modal.warning({
				title: "Maximum File Limit",
				content: `You can upload maximum of ${MAX_FILE_LENGTH} files`,
			});
			return;
		}
		setShowParsingSpinner(true);
		let files = [...e.target.files];
		let d = files.map((a, i) => doParseFile(a, i));
		Promise.allSettled(d).then((res) => {
			setShowParsingSpinner(false);
			let parsedData = [];
			res.forEach((p) => {
				if (p.status === "fulfilled") {
					parsedData.push(p.value);
				} else if (p.status === "rejected") {
					// ...
					console.error("error in parsing... ", p);
				}
			});
			setFilesToMapHeader(parsedData);
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
						file: file,
						headers,
						size: bytesToSize(file.size),
						isPublic: true,
						cellId: "",
						id: uuidv4(),
						key: uuidv4(),
						mappings: getDefaultMappings(headers),
						template:"",
						new_template:""
					});
				},
			});
		});
	};

	const getDefaultMappings = (headers) => {
		let ops = Object.keys(supportedColumns);
		if (!(headers && headers.length && ops.length)) return;
		const getDefaultValue = (item) => {
			let matches = stringSimilarity.findBestMatch(item, ops);
			let res = matches.bestMatch.rating >= 0.2 ? matches.bestMatch.target : "";
			return supportedColumns[res] || "";
		};
		let mappings = {};
		headers.forEach((h, index) => {
			let key = h;
			let value = "";
			if (!key) {
				key = `--missing header||${index}`;
			} else {
				value = getDefaultValue(key);
			}
			mappings[key] = [Object.values(mappings).includes(value) ? "" : value,"none"];
		});
		console.log("default mappings", mappings);
		return mappings;
	};

	const onCloseMappingModal = () => {
		setShowColMapModal(false);
	};

	return (
		<>
			<Modal
				visible={showParsingSpinner}
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
				width={700}
			>
				<ColumnMapping closeModal={onCloseMappingModal} />
			</Modal>
			<div className="mb-2 d-flex justify-content-end">
				<Radio.Group
					defaultValue="normalTest"
					onChange={(e) => {
						let value = e.target.value;
						if (value === "referenceTest") {
							setShowPackDataCellInput(true);
						}
						setFileType(value);
					}}
				>
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
					<p>Click here or drag file to this area to upload</p>
				</div>
				<input
					type="file"
					value=""
					accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .txt"
					onChange={onFileDrop}
					multiple={fileType === "normalTest"}
				/>
			</div>
		</>
	);
};

export default BulkUploadDropFileInput;
