import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Select, Spin, Tabs } from "antd";
import ColumnMapForm from "./ColumnMapForm";
import { useFileUpload } from "../../context/FileUploadContext";
import axios from "axios";
import Papa from "papaparse";

const { TabPane } = Tabs;
const { Option } = Select;
const REQUIRED_HEADERS = ["test_time", "cycle_index", "current", "voltage"];

const ColumnMapping = ({ closeModal }) => {
	const [activeKey, setActiveKey] = useState("0");
	const [cellSelectOptions, setCellSelectOptions] = useState(null);
	const [cellsSelected, setCellsSelected] = useState(1);
	const [colMapData, setColMapData] = useState({});
	const [colMapError, setColMapError] = useState(null);
	const [shallShowForm, setShallShowForm] = useState(false);
	const [supportedColumns, setSupportedColumns] = useState({});

	const {
		state: { filesToMapHeader, fileType, tableData, showParsingSpinner },
		action,
	} = useFileUpload();

	useEffect(() => {
		const size = 10 - tableData.length;
		let options = Array.from({ length: size })
			.map((_, i) => i + 1)
			.map((e) => (
				<Option key={e} value={e}>
					{e}
				</Option>
			));
		setCellSelectOptions(options);
	}, [tableData]);

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

	const onEdit = (targetKey, userAction) => {
		if (userAction === "remove") {
			remove(targetKey);
		}
	};

	const remove = (targetKey) => {
		let newActiveKey = activeKey;
		let lastIndex = parseInt(targetKey) - 1;
		let newData = filesToMapHeader.filter((_, i) => i !== parseInt(targetKey));
		action.setFilesToMapHeader(newData);
		if (!newData.length) {
			closeModal();
			return;
		}
		if (newActiveKey === targetKey) {
			if (lastIndex >= 0) {
				newActiveKey = lastIndex;
			} else {
				newActiveKey = 0;
			}
		}
		setActiveKey(String(newActiveKey));
	};

	const onCellNumberSubmit = () => {
		let data = [];
		let obj = filesToMapHeader[0];
		for (let i = 0; i < cellsSelected; i++) {
			data.push({ ...obj, fileName: `${obj.fileName}_${i + 1}` });
		}
		action.setFilesToMapHeader(data);
		setShallShowForm(true);
	};

	const validateUserMappings = () => {
		let errorMap = {};
		Object.keys(colMapData).map((f) => {
			let missingHeader = [];
			for (let i = 0; i < REQUIRED_HEADERS.length; i++) {
				const h = REQUIRED_HEADERS[i];
				if (h === "cycle_index" && fileType !== "normalTest") {
					continue;
				}
				if (!Object.values(colMapData[f]).includes(h)) {
					missingHeader.push(h);
				}
			}
			if (missingHeader.length) {
				errorMap[f] = missingHeader;
			}
		});
		let errorCount = Object.keys(errorMap).length;
		if (errorCount) {
			setColMapError(errorMap);
		}
		return errorCount;
	};

	const parseAndMapCols = async (file, fileName) => {
		let dataColMapping = colMapData[fileName];
		let missingHeaderCount = 0;
		return new Promise((resolve, reject) => {
			Papa.parse(file, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				transformHeader: function (h, i) {
					let index = h;
					if (!index) {
						missingHeaderCount++;
						index = `--missing header(${missingHeaderCount})--`;
					}
					return dataColMapping[index] || null;
				},
				complete: function (results) {
					if (results.errors && results.errors.length) {
						reject({
							file: file.name,
							errors: results.errors,
						});
						return;
					}
					resolve(results.data);
				},
			});
		});
	};

	const ignoreCols = (parsedDataHeaders) => {
		return parsedDataHeaders.filter((h) => h !== "null");
	};

	const doSaveColMappings = async () => {
		if (validateUserMappings()) return;
		action.setShowParsingSpinner(true);
		let files = [];
		for (let i = 0; i < filesToMapHeader.length; i++) {
			let { file, fileName } = filesToMapHeader[i];
			let parsedData = await parseAndMapCols(file, fileName);
			let unparsed = Papa.unparse(parsedData, {
				columns: ignoreCols(Object.keys(parsedData[0])),
			});
			let parts = [new Blob([unparsed], { type: "text/plain" })];
			let newFile = new File(parts, fileName, {
				lastModified: new Date(0),
				type: "text/csv",
			});

			var a = document.createElement("a");
			var blob = new Blob([unparsed], { type: "text/csv" });
			a.href = window.URL.createObjectURL(blob);
			a.download = "mydata.csv";
			a.click();

			files.push(newFile);
		}
		action.setFilesFromDropFileInput(files);
		action.setShowParsingSpinner(false);
		closeModal();
	};

	const onFormChangeHandler = (item, value, fileName) => {
		setColMapData((prev) => {
			let colMapdata = { ...prev };
			if (!colMapdata[fileName]) colMapdata[fileName] = {};
			colMapdata[fileName][item] = value;
			return colMapdata;
		});
	};

	return (
		<div>
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
			{fileType === "normalTest" || shallShowForm ? (
				<>
					<Tabs
						hideAdd
						type="editable-card"
						activeKey={activeKey}
						onEdit={onEdit}
						onChange={(key) => setActiveKey(key)}
					>
						{filesToMapHeader.map((fileObj, i) => {
							return (
								<TabPane tab={fileObj.fileName} key={i} forceRender>
									<ColumnMapForm
										onValChange={onFormChangeHandler}
										headers={fileObj.headers}
										options={supportedColumns}
										fileName={fileObj.fileName}
									/>
								</TabPane>
							);
						})}
					</Tabs>
					{colMapError && (
						<Alert
							className="my-2"
							message={
								<ul className="text-danger" style={{ maxHeight: "5rem", overflowY: "scroll" }}>
									{Object.keys(colMapError).map((f) => (
										<li>{`Error in ${f}: Missing headers (${colMapError[f].join(", ")})`}</li>
									))}
								</ul>
							}
							type="error"
							closable
							onClose={() => setColMapError(null)}
						/>
					)}
					<div className="mt-2 d-flex justify-content-end">
						<Button type="danger" size="large" onClick={closeModal}>
							Cancel
						</Button>
						<Button type="primary" size="large" className="ms-1" onClick={doSaveColMappings}>
							Save All
						</Button>
					</div>
				</>
			) : (
				<>
					<div className="m-2 p-2 text-center">
						Select no of cells:
						<Select
							defaultValue={1}
							style={{
								width: 120,
								marginLeft: 10,
								marginRight: 10,
							}}
							placeholder="Available Cells"
							onChange={(e) => setCellsSelected(e)}
						>
							{cellSelectOptions}
						</Select>
						<Button type="primary" onClick={onCellNumberSubmit}>
							Submit
						</Button>
					</div>
				</>
			)}
		</div>
	);
};

export default ColumnMapping;
