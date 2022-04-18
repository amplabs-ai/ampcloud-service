import React, { useState, useEffect } from "react";
import axios from "axios";
import { Space, Input, Table, Button, Typography, Popconfirm, message, Select, Modal, Spin } from "antd";
import { FaRegTrashAlt, FaCode } from "react-icons/fa";
import ViewCodeModal from "./ViewCodeModal";

import codeContent from "../chartConfig/cellIdViewCode";

const { Title, Text } = Typography;
const { Option } = Select;
const SAMPLE_OPTIONS = [5].concat(Array.from({ length: 10 }, (_, index) => (index + 1) * 10));

const DashboardFilterBar = (props) => {
	const [cellIds, setCellIds] = useState([]);
	const [tableLoading, setTableLoading] = useState(true);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [step, setStep] = useState(localStorage.getItem("step") ? localStorage.getItem("step") : 1);
	const [stepInputPlaceholder, setStepInputPlaceholder] = useState("Step");
	const [stepInputStatus, setStepInputStatus] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [searchParams, setSearchParams] = useState("");
	const [sample, setSample] = useState(localStorage.getItem("sample") ? localStorage.getItem("sample") : 10);
	const [loading, setLoading] = useState(false);

	console.log("localStorage", localStorage.getItem("sample"), localStorage.getItem("step"));

	console.log("testType", props.testType);

	useEffect(() => {
		let endpoint = props.testType === "abuseTest" ? "/cells/abuse/meta" : "/cells/cycle/meta";
		axios
			.get(endpoint)
			.then((response) => {
				console.log("cell ids", response);
				let cellIdData = [];
				let data = response.data.records[0];
				if (data.length) {
					data.forEach((cellId, i) => {
						cellIdData.push({
							key: i,
							cell_id: cellId.cell_id,
						});
					});
					console.log(cellIdData);
					setCellIds([...cellIdData]);
					setSelectedRowKeys(cellIdData.map((c) => c.key));
					setSelectedRows([...cellIdData]);
					setTableLoading(false);
					props.onFilterChange([...cellIdData], props.testType === "abuseTest" ? sample : step);
				} else {
					// error
					console.log("no data found!");
					props.onFilterChange([], props.testType === "abuseTest" ? sample : step);
					setTableLoading(false);
				}
			})
			.catch((err) => {
				console.log("get cellId err", err);
				props.internalServerErrorFound("500");
			});
		// const filterTitle = document.createElement("span");
		// filterTitle.innerHTML = "Select Filter ";
		// filterTitle.className = "ms-1";
		// document.querySelector(".ant-table-container table > thead > tr:first-child th:first-child").append(filterTitle);
	}, []);

	const handleCellDelete = (record) => {
		console.log("delete", record.key);
		axios
			.delete(`/cells/${record.cell_id}`)
			.then(() => {
				setCellIds(cellIds.filter((item) => item.key !== record.key));
				handleApplyFilter();
				message.success("Cell Id Deleted!");
				message.success("Cell Id Deleted!");
			})
			.catch((err) => {
				message.error("Error deleting Cell Id");
				message.error("Error deleting Cell Id");
			});
	};

	const handleApplyFilter = () => {
		if (!step) {
			setStepInputStatus("error");
			setStepInputPlaceholder("This field is required!");
			message.error("Step field is required!");
			message.error("Step field is required!");
			return;
		} else if (!selectedRows.length) {
			message.error("Please Select atleast one cell Id!");
			message.error("Please Select atleast one cell Id!");
			return;
		}
		localStorage.setItem("sample", sample);
		localStorage.setItem("step", step);
		let result = props.onFilterChange(selectedRows, props.testType === "abuseTest" ? sample : step);
		if (result) {
			message.success("Filter Applied!"); // potential bug in antd need to call msg twice
			message.success("Filter Applied!");
		} else {
			message.error("Error Applying filters!");
			message.error("Error Applying filters!");
		}
	};

	const downloadCycleData = (k) => {
		console.log("downloadCycleData", k);
		setLoading(true);
		axios
			.get(`/download/cells/cycle_data/${k}`)
			.then(({ data }) => {
				console.log("downloadcycledata", data);
				var a = document.createElement("a");
				var blob = new Blob([data], { type: "text/csv" });
				a.href = window.URL.createObjectURL(blob);
				a.download = k + " (Cycle Data).csv";
				a.click();
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	};

	const viewCycleDataCode = (k, type) => {
		setSearchParams(k);
		setModalVisible(true);
	};

	const downloadTimeSeriesData = (k) => {
		console.log("downloadTimeSeriesData", k);
		setLoading(true);
		axios
			.get(`/download/cells/cycle_timeseries/${k}`)
			.then(({ data }) => {
				console.log("downloadTimeSeriesData", data);
				var a = document.createElement("a");
				var blob = new Blob([data], { type: "text/csv" });
				a.href = window.URL.createObjectURL(blob);
				a.download = k + " (Time Series).csv";
				a.click();
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	};

	const columns = [
		{
			title: "Cell Id",
			dataIndex: "cell_id",
			width: 100,
		},
		{
			title: "Cycle Data",
			key: "cycleDataDownload",
			render: (text, record) => (
				<Space size="middle">
					<Button title="Download" type="link" onClick={() => downloadCycleData(record.cell_id)}>
						Download
					</Button>
					<Button type="link" title="View Code" onClick={() => viewCycleDataCode(record.cell_id)}>
						<FaCode />
					</Button>
				</Space>
			),
			width: 100,
		},
		{
			title: "Time Series",
			key: "timeSeriesDownload",
			render: (text, record) => (
				<Space size="middle">
					<Button type="link" onClick={() => downloadTimeSeriesData(record.cell_id)}>
						Download
					</Button>
					<Button type="link" title="View Code" onClick={() => viewCycleDataCode(record.cell_id, "timeSeries")}>
						<FaCode />
					</Button>
				</Space>
			),
			width: 100,
		},
		{
			title: "Delete",
			key: "action",
			render: (text, record) =>
				cellIds.length >= 1 ? (
					<div className="filter-bar-delete-column">
						<Popconfirm title="Sure to delete?" onConfirm={() => handleCellDelete(record)}>
							<Space size="middle">
								<FaRegTrashAlt style={{ cursor: "pointer" }} />
							</Space>
						</Popconfirm>
					</div>
				) : null,
			width: 100,
		},
	];

	const abuseTestColumns = [
		{
			title: "Cell Id",
			dataIndex: "cell_id",
			width: 100,
		},
		{
			title: "Delete",
			key: "action",
			render: (text, record) =>
				cellIds.length >= 1 ? (
					<div className="filter-bar-delete-column">
						<Popconfirm title="Sure to delete?" onConfirm={() => handleCellDelete(record)}>
							<Space size="middle">
								<FaRegTrashAlt style={{ cursor: "pointer" }} />
							</Space>
						</Popconfirm>
					</div>
				) : null,
			width: 100,
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedRowKeys(selectedRowKeys);
			setSelectedRows(selectedRows);
			props.onCellIdChange(selectedRows);
		},
	};

	return (
		<div>
			<Modal centered width="auto" visible={loading} closable={false} footer={null} maskClosable={false}>
				<Spin size="large" />
			</Modal>
			<div className="card shadow-sm">
				<div className="card-body filterBar">
					<div style={{ display: "inline-block" }} className="pe-2">
						{/* <Title level={5}>Step</Title> */}
						{props.testType === "abuseTest" ? (
							<>
								<span style={{ fontSize: "0.7rem" }}>Sample % : </span>
								<Select defaultValue={sample} onChange={(e) => setSample(e)} showArrow title="Sample">
									{SAMPLE_OPTIONS.map((o, i) => (
										<Option key={i} value={o}>
											{o}
										</Option>
									))}
								</Select>
							</>
						) : (
							<Input
								type="number"
								addonBefore="Step"
								status={stepInputStatus}
								onChange={(e) => {
									setStepInputStatus("");
									setStepInputPlaceholder("Step");
									setStep(e.target.value);
								}}
								value={step}
								placeholder={stepInputPlaceholder}
								allowClear
							/>
						)}
					</div>
					<button
						disabled={!cellIds.length}
						onClick={() => handleApplyFilter()}
						className=" btn btn-outline-dark btn-sm"
					>
						Apply Filter
					</button>
					{/* view code modal */}
					<ViewCodeModal
						code={codeContent}
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						searchParams={searchParams}
					/>
					<Table
						sticky={true}
						loading={tableLoading}
						style={{ marginTop: "10px" }}
						columns={props.testType === "abuseTest" ? abuseTestColumns : columns}
						dataSource={cellIds}
						pagination={false}
						scroll={{
							x: true,
							y: "300px",
						}}
						size="small"
						rowSelection={{
							type: "checkbox",
							...rowSelection,
						}}
					/>
				</div>
			</div>
		</div>
	);
};

export default DashboardFilterBar;
