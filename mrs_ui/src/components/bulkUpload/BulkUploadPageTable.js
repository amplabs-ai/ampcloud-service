import React, { useEffect, useState } from "react";
import { Alert, Checkbox, Input, Modal, Popconfirm, Space, Table } from "antd";
import { Button } from "antd";
import { FaCloudUploadAlt, FaRegTrashAlt } from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import { useUserPlan } from "../../context/UserPlanContext";
import { useFileUpload } from "../../context/FileUploadContext";

const bytesToSize = (bytes) => {
	let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
	if (bytes === 0) return "0 Byte";
	let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
};

const UploadPageTable = (props) => {
	const [tableData, setTableData] = useState([]);
	const [userInputData, setUserInputData] = useState([]);
	const [validationErr, setValidationErr] = useState([]);
	const userPlan = useUserPlan();

	const { state, action } = useFileUpload();

	useEffect(() => {
		const newFiles = props.newFiles;
		if (!newFiles.length) return;
		const newFilesData = [];
		newFiles.map((f, i) => {
			newFilesData.push({
				key: uuidv4(),
				file: f,
				fileName: f.name,
				file_size: bytesToSize(f.size),
				ah: null,
				anode: null,
				cathode: null,
				cell_id: null,
				crate_c: null,
				crate_d: null,
				experiment: null,
				form_factor: null,
				label: null,
				soc_max: null,
				soc_min: null,
				source: null,
				temperature: null,
				v_max: null,
				v_min: null,
				test_type: "cycle",
				is_public: true,
			});
		});
		setTableData((prev) => {
			action.setTableData([...prev, ...newFilesData]);
			return [...prev, ...newFilesData];
		});
		setUserInputData((prev) => [...prev, ...newFilesData]);
	}, [props.newFiles]);

	const onTableInputChange = (e, key, col) => {
		let value, fileKey, column;
		if (e.target.type === "checkbox") {
			value = e.target.checked;
			fileKey = key;
			column = col;
		} else {
			value = e.target.value;
			fileKey = e.target.getAttribute("data-record");
			column = e.target.getAttribute("data-id");
		}
		let temp = userInputData;
		temp = temp.map((row) => {
			if (row.key === fileKey) {
				row[column] = value;
			}
			return row;
		});
		setUserInputData([...temp]);
	};

	const handleValidation = () => {
		let errors = [];
		tableData.map((f, i) => {
			if (!f["cell_id"] || !f["cell_id"].trim().length) {
				errors.push(`${i + 1}. ${f.fileName}`);
			}
		});
		return errors;
	};

	const uploadBtnHandler = () => {
		let errors = handleValidation();
		if (errors && errors.length) {
			setValidationErr(errors);
		} else {
			props.onUpload();
		}
	};

	const handleDelteFile = ({ key: fileKey }) => {
		const newTableData = tableData.filter((d) => d.key !== fileKey);
		const newUserInputData = userInputData;
		delete newUserInputData[fileKey];
		setUserInputData(newUserInputData);
		setTableData(newTableData);
		action.setTableData(newTableData);
	};

	const uploadPageDataCol = [
		{
			title: "S.no",
			dataIndex: "index",
			key: "index",
			width: 50,
			fixed: "left",
			align: "center",
			render(text, record, index) {
				return index + 1;
			},
		},
		{
			title: "File",
			dataIndex: "fileName",
			key: "fileName",
			width: 150,
			fixed: "left",
			align: "center",
		},
		{
			title: "size",
			dataIndex: "file_size",
			key: "file_size",
			width: 100,
			align: "center",
		},
		{
			title: "Cell Metadata",
			children: [
				{
					title: "Cell Id",
					dataIndex: "cell_id",
					key: "cell_id",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input onChange={onTableInputChange} data-record={record.key} status="warning" data-id="cell_id" />;
					},
				},
				{
					title: "Anode",
					dataIndex: "anode",
					key: "anode",
					width: 100,
					align: "center",
					render: (text, record, index) => {
						return <Input onChange={onTableInputChange} data-record={record.key} data-id="anode" />;
					},
				},
				{
					title: "Cathode",
					dataIndex: "cathode",
					key: "cathode",
					width: 100,
					align: "center",
					render: (text, record, index) => {
						return <Input onChange={onTableInputChange} data-record={record.key} data-id="cathode" />;
					},
				},
				{
					title: "Source",
					dataIndex: "source",
					key: "source",
					width: 100,
					align: "center",
					render: (text, record, index) => {
						return <Input onChange={onTableInputChange} data-record={record.key} data-id="source" />;
					},
				},
				{
					title: "Nominal Ah",
					dataIndex: "ah",
					key: "ah",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="ah" />;
					},
				},
				{
					title: "Form Factor",
					dataIndex: "form_factor",
					key: "form_factor",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input onChange={onTableInputChange} data-record={record.key} data-id="form_factor" />;
					},
				},
				{
					title: "Public",
					key: "is_public",
					align: "center",

					render: (text, record) => (
						<div className="filter-bar-delete-column">
							{!userPlan.includes("COMMUNITY") ? (
								<Checkbox
									defaultChecked={true}
									onChange={(e) => onTableInputChange(e, record.key, "is_public")}
								></Checkbox>
							) : (
								<Checkbox
									disabled={true}
									defaultChecked={true}
									onChange={(e) => onTableInputChange(e, record.key, "is_public")}
								></Checkbox>
							)}
						</div>
					),
					width: 100,
				},
			],
		},
		{
			title: "Test Metadata",
			render: () => {
				return <Input />;
			},
			children: [
				{
					title: "Temperature",
					dataIndex: "temperature",
					key: "temperature",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="temperature" />;
					},
				},
				{
					title: "Max SOC",
					dataIndex: "soc_max",
					key: "soc_max",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="soc_max" />;
					},
				},
				{
					title: "Min SOC",
					dataIndex: "soc_min",
					key: "soc_min",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="soc_min" />;
					},
				},
				{
					title: "Charge Rate",
					dataIndex: "crate_c",
					key: "crate_c",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="crate_c" />;
					},
				},
				{
					title: "Discharge Rate",
					dataIndex: "crate_d",
					key: "crate_d",
					width: 100,
					align: "center",

					render: (text, record, index) => {
						return <Input type="number" onChange={onTableInputChange} data-record={record.key} data-id="crate_d" />;
					},
				},
			],
		},
		{
			title: "Remove",
			key: "action",
			dataIndex: "delete",
			fixed: "right",
			align: "center",
			width: 90,
			render: (text, record) => (
				<div className="filter-bar-delete-column">
					<Popconfirm title="Sure to delete?" onConfirm={() => handleDelteFile(record)}>
						<Space size="middle">
							<Button icon={<FaRegTrashAlt />} type="text"></Button>
						</Space>
					</Popconfirm>
				</div>
			),
		},
	];

	const closeErrModal = () => {
		setValidationErr([]);
	};
	useEffect(() => {
		props.onGetTableData(tableData);
	}, [tableData]);

	return (
		<div className="m-3">
			<div>
				<Modal title="Errors" visible={validationErr.length} onOk={closeErrModal} onCancel={closeErrModal}>
					<p>Cell Id not defined:</p>
					{validationErr.map((err, i) => (
						<Alert key={i} message={err} type="error" />
					))}
				</Modal>
			</div>
			<form>
				<Button
					type="primary"
					onClick={uploadBtnHandler}
					icon={<FaCloudUploadAlt />}
					size="large"
					style={{ float: "right" }}
					className="m-3 me-0"
				>
					&nbsp;&nbsp;Upload
				</Button>
				<Table
					columns={uploadPageDataCol}
					dataSource={tableData}
					bordered
					pagination={false}
					scroll={{
						x: 600,
						y: "500px",
					}}
				/>
			</form>
		</div>
	);
};

export default UploadPageTable;
