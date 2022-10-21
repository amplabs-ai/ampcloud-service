import React, { useEffect, useState } from "react";
import { Alert, Button, Modal, Select, Spin, Tabs } from "antd";
import ColumnMapForm from "./ColumnMapForm";
import { useFileUpload } from "../../context/FileUploadContext";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useAuth0Token } from "../../utility/useAuth0Token";

const { TabPane } = Tabs;
const { Option } = Select;

const ColumnMapping = ({ closeModal }) => {
	const [activeKey, setActiveKey] = useState("0");
	const [cellSelectOptions, setCellSelectOptions] = useState(null);
	const [cellsSelected, setCellsSelected] = useState(1);
	const [colMapError, setColMapError] = useState([]);
    const [templateData, setTemplateData] = useState({});

    const accessToken = useAuth0Token();
	const {
		state: { filesToMapHeader, tableData, showParsingSpinner, supportedColumns, showPackDataCellInput },
		action: { setFilesToMapHeader, setTableData, setShowPackDataCellInput },
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
		if(accessToken){
			getTemplateData()
		}
    },[accessToken])

    const getTemplateData = () =>{
        axios
            .get("/template", {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            })
            .then((response) => {

                if (response.data.status === 200) {
                    setTemplateData(response.data.records[0])
                }
            })
            .catch((error) => {
                console.error("file upload err", error);
            });
    }

	const onEdit = (targetKey, userAction) => {
		if (userAction === "remove") {
			remove(targetKey);
		}
	};

	const remove = (targetKey) => {
		let newActiveKey = activeKey;
		let lastIndex = parseInt(targetKey) - 1;
		let newData = filesToMapHeader.filter((_, i) => i !== parseInt(targetKey));
		setFilesToMapHeader(newData);
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
			let clone = structuredClone(obj);
			clone.fileName = `${obj.fileName}_${i + 1}`;
			clone.id = uuidv4();
			clone.key = uuidv4();
			data.push(clone);
		}
		setFilesToMapHeader(data);
		setShowPackDataCellInput(false);
	};

	const validateFileMappingsAndInfo = () => {
		let errors = [];
		let data = filesToMapHeader;
		data.forEach((file) => {
			let err = `${file.fileName}: `;
			let isDuplicateCellId = checkDuplicateCellId(file.cellId, file.id);
            let isTemplateSelected = file.template ? true: false;

			if (!file.cellId || isDuplicateCellId || !isTemplateSelected) {
				if (!file.cellId) {
					err += "missing cell id, ";
				} else if (isDuplicateCellId) {
					err += "duplicate cell id, ";
				}
                if (!isTemplateSelected) {
					err += `template not selected or deleted`;
				}
				errors.push(err);
			}
		});
		setColMapError(errors);
		return errors.length;
	};

	const checkDuplicateCellId = (cellId, id) => {
		const test = (d) => {
			if (d.id !== id) {
				return d.cellId !== cellId;
			}
			return true;
		};
		return !filesToMapHeader.every(test) || !tableData.every(test);
	};


	const doSaveColMappings = async () => {
		if (validateFileMappingsAndInfo()) return;

		let newTableData = [...tableData];
		filesToMapHeader.forEach((data) => {
			let existingRecIndex = newTableData.findIndex((t) => t.id === data.id);
			if (existingRecIndex !== -1) {
				newTableData[existingRecIndex] = data;
			} else {
				newTableData.push(data);
			}
		});

		setTableData(newTableData);
		closeModal();
	};

	const onFileInfoInputChange = (item, value, fileName) => {
		let newFilesToMapHeader = [...filesToMapHeader];
		let index = newFilesToMapHeader.findIndex((file) => file.fileName === fileName);
		let obj = newFilesToMapHeader[index];
		obj[item] = value;
		setFilesToMapHeader(newFilesToMapHeader);
	};

	const onColMapChange = (item, value, fileName) => {
		// save data in filesToMapHeader
		let newFilesToMapHeader = [...filesToMapHeader];
		let index = newFilesToMapHeader.findIndex((file) => file.fileName === fileName);
		let obj = newFilesToMapHeader[index];
		obj.mappings[item][0] = value;
		setFilesToMapHeader(newFilesToMapHeader);
	};

    const onColMetricChange = (item, value, fileName) => {
		let newFilesToMapHeader = [...filesToMapHeader];
		let index = newFilesToMapHeader.findIndex((file) => file.fileName === fileName);
		let obj = newFilesToMapHeader[index];
		obj.mappings[item][1] = value;
		setFilesToMapHeader(newFilesToMapHeader);
	};

    const onTemplateSelect = (value, fileName) => {
        let newFilesToMapHeader = [...filesToMapHeader];
		let index = newFilesToMapHeader.findIndex((file) => file.fileName === fileName);
		let obj = newFilesToMapHeader[index];
		obj["template"] = value;
		setFilesToMapHeader(newFilesToMapHeader);  
    }

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
			{!showPackDataCellInput ? (
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
										onColMapChange={onColMapChange}
										onFileInfoInputChange={onFileInfoInputChange}
										options={supportedColumns}
										formInfo={fileObj}
                                        onTemplateSelect={onTemplateSelect}
                                        getTemplateData={getTemplateData}
                                        templateData={templateData}
                                        onColMetricChange={onColMetricChange}
									/>
								</TabPane>
							);
						})}
					</Tabs>
					{colMapError.length ? (
						<Alert
							className="my-2"
							message={
								<ul className="text-danger" style={{ maxHeight: "5rem", overflowY: "auto" }}>
									{colMapError.map((error, i) => (
										<li key={i}>{error}</li>
									))}
								</ul>
							}
							type="error"
							closable
							onClose={() => setColMapError([])}
						/>
					) : null}
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
