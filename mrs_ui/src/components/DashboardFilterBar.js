import React, { useState, useEffect } from "react";
import axios from "axios";
import { Space, Input, Table, Button, Popconfirm, message, Select, Modal, Spin, Typography } from "antd";
import { FaRegTrashAlt, FaCode } from "react-icons/fa";
import ViewCodeModal from "./ViewCodeModal";
import { cycleDataCodeContent, timeSeriesDataCodeContent, abuseCellIdViewCode } from "../chartConfig/cellIdViewCode";
import { audit } from "../auditAction/audit";
import Highlighter from "react-highlight-words";
import { useAuth } from "../context/auth";

import { SearchOutlined } from "@ant-design/icons";

const { Text } = Typography;
const { Option } = Select;
const SAMPLE_OPTIONS = [5].concat(Array.from({ length: 10 }, (_, index) => (index + 1) * 10));

const DashboardFilterBar = (props) => {
	const [cellIds, setCellIds] = useState([]);
	const [tableLoading, setTableLoading] = useState(true);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [step, setStep] = useState(localStorage.getItem("step") ? localStorage.getItem("step") : 500);
	const [stepInputPlaceholder, setStepInputPlaceholder] = useState("Step");
	const [stepInputStatus, setStepInputStatus] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [searchParams, setSearchParams] = useState("");
	const [sample, setSample] = useState(localStorage.getItem("sample") ? localStorage.getItem("sample") : 10);
	const [loading, setLoading] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const { user } = useAuth(); // auth context

	const [searchText, setSearchText] = useState("");
	const [searchedColumn, setSearchedColumn] = useState("");

	const [cellDirInfo, setCellDirInfo] = useState([]);

	const _initializeFilterBar = (data) => {
		let cellIdData = [];
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
			setCellIds([]);
			setSelectedRowKeys([]);
			setSelectedRows([]);
			props.onFilterChange([], props.testType === "abuseTest" ? sample : step);
			setTableLoading(false);
		}
	};

	useEffect(() => {
		let endpoint = props.testType === "abuseTest" ? "/cells/abuse/meta" : "/cells/cycle/meta";
		console.log("endpointt", endpoint);
		let data;
		if (props.testType === "cycleTest") {
			// temp wrap in object
			let x = [];
			props.cellData.map((c) => {
				x.push({ cell_id: c });
			});
			data = x;
			_initializeFilterBar(data);
		} else if (props.testType === "abuseTest") {
			axios
				.get(endpoint, {
					headers: {
						Authorization: `Bearer ${user.iss}`,
					},
				})
				.then((response) => {
					console.log("cell ids abuse", response);
					data = response.data.records[0];
					_initializeFilterBar(data);
				})
				.catch((err) => {
					console.log("get cellId err", err);
					props.internalServerErrorFound("500");
				});
		}
	}, []);

	const _cleanCellIds = (cellIds) => {
		let x = [];
		cellIds.map((k) => {
			x.push({ cell_id: k.substring(k.indexOf("_") + 1) });
		});
		return x;
	};

	useEffect(() => {
		let data;
		if (props.testType === "cycleTest") {
			console.log("in useEffect", props.cellData);
			setCellDirInfo(props.cellData);
			data = _cleanCellIds(props.cellData);
			_initializeFilterBar(data);
		}
	}, [props.cellData]);

	const handleCellDelete = (record) => {
		setLoading(true);
		console.log("delete", record);
		let params = new URLSearchParams();
		params.append("cell_id", record.cell_id);
		axios
			.delete(`/cells`, {
				params: params,
				headers: {
					Authorization: `Bearer ${user.iss}`,
				},
			})
			.then(() => {
				setLoading(false);
				setCellIds(cellIds.filter((item) => item.key !== record.key));
				let records = selectedRows.filter((item) => item.key !== record.key);
				setSelectedRows(records);
				setSelectedRowKeys(selectedRowKeys.filter((item) => item !== record.key));
				props.onCellIdChange(records);
				props.onCellDelete(record);
				message.success("Cell Id Deleted!");
				message.success("Cell Id Deleted!");
			})
			.catch((err) => {
				setLoading(false);
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
		console.log("selectedRows after delete", selectedRows);
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
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_data`, {
				params: params,
				headers: {
					Authorization: `Bearer ${user.iss}`,
				},
			})
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

	const getSearchParams = (cellId, dashboardId) => {
		let params = new URLSearchParams();
		params.append("cell_id", cellId);
		if (dashboardId) {
			params.append("dashboard_id", dashboardId);
		}
		return params.toString();
	};

	const viewCycleDataCode = (k) => {
		audit(`cycle_dash_cellId__cycle_viewcode`, user.iss);
		setSearchParams(getSearchParams(encodeURIComponent(k.trim()), props.dashboardId));
		setCodeContent(cycleDataCodeContent);
		setModalVisible(true);
	};

	const viewTimeSeriesDataCode = (k) => {
		audit(`cycle_dash_cellId__ts_viewcode`, user.iss);
		setSearchParams(getSearchParams(encodeURIComponent(k.trim()), props.dashboardId));
		setCodeContent(timeSeriesDataCodeContent);
		setModalVisible(true);
	};

	const downloadTimeSeriesData = (k) => {
		console.log("downloadTimeSeriesData", k);
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_timeseries`, {
				params: params,
				headers: {
					Authorization: `Bearer ${user.iss}`,
				},
			})
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

	const viewAbuseTSCode = (k) => {
		audit(`abuse_dash_cellId__ts_viewcode`, user.iss);
		setSearchParams(getSearchParams(encodeURIComponent(k.trim()), props.dashboardId));
		setCodeContent(abuseCellIdViewCode);
		setModalVisible(true);
	};

	const downloadAbuseTSData = (k) => {
		console.log("downloadAbuseTSData", k);
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/abuse_timeseries`, {
				params: params,
				headers: {
					Authorization: `Bearer ${user.iss}`,
				},
			})
			.then(({ data }) => {
				console.log("downloadAbuseTSData", data);
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

	// ===============Filter================
	let searchInput;
	const getColumnSearchProps = (dataIndex) => ({
		filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
			<div style={{ padding: 8 }}>
				<Input
					ref={(node) => {
						searchInput = node;
					}}
					placeholder={`Search ${dataIndex}`}
					value={selectedKeys[0]}
					onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
					onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
					style={{ marginBottom: 8, display: "block" }}
				/>
				<Space>
					<Button
						type="primary"
						onClick={() => {
							audit(`${props.testType}_dash_cellId_search`, user.iss);
							handleSearch(selectedKeys, confirm, dataIndex);
						}}
						icon={<SearchOutlined />}
						size="small"
						style={{ width: 90 }}
					>
						Search
					</Button>
					<Button onClick={() => handleReset(clearFilters)} size="small" style={{ width: 90 }}>
						Reset
					</Button>
					{/* <Button
						type="link"
						size="small"
						onClick={() => {
							confirm({ closeDropdown: false });
							setSearchText(selectedKeys[0]);
							setSearchedColumn(dataIndex);
						}}
					>
						Filter
					</Button> */}
				</Space>
			</div>
		),
		filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1890ff" : undefined, fontSize: "1rem" }} />,
		onFilter: (value, record) =>
			record[dataIndex] ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()) : "",
		onFilterDropdownVisibleChange: (visible) => {
			if (visible) {
				setTimeout(() => searchInput.select(), 100);
			}
		},
		render: (text) =>
			searchedColumn === dataIndex ? (
				<Highlighter
					highlightStyle={{ backgroundColor: "#ffc069", padding: 0 }}
					searchWords={[searchText]}
					autoEscape
					textToHighlight={text ? text.toString() : ""}
				/>
			) : (
				text
			),
	});

	const handleSearch = (selectedKeys, confirm, dataIndex) => {
		confirm();
		setSearchText(selectedKeys[0]);
		setSearchedColumn(dataIndex);
	};

	const handleReset = (clearFilters) => {
		clearFilters();
		setSearchText("");
	};

	// ==============================

	const columns = [
		{
			title: "Cell Id",
			dataIndex: "cell_id",
			width: 100,
			...getColumnSearchProps("cell_id"),
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
					<Button type="link" title="View Code" onClick={(e) => viewTimeSeriesDataCode(record.cell_id)}>
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
								<Button
									icon={<FaRegTrashAlt />}
									type="text"
									disabled={props.disableSelection || _checkIsReadOnly(record)}
								></Button>
							</Space>
						</Popconfirm>
					</div>
				) : null,
			width: 100,
		},
	];

	const _checkIsReadOnly = (record) => {
		// cellDirInfo
		return cellDirInfo.find((c) => {
			return record.cell_id === c.substring(c.indexOf("_") + 1) && c.split("_", 1)[0].includes("public");
		});
	};

	const abuseTestColumns = [
		{
			title: "Cell Id",
			dataIndex: "cell_id",
			width: 100,
			...getColumnSearchProps("cell_id"),
		},
		{
			title: "Time Series",
			key: "timeSeriesDownload",
			render: (text, record) => (
				<Space size="middle">
					<Button type="link" onClick={() => downloadAbuseTSData(record.cell_id)}>
						Download
					</Button>
					<Button type="link" title="View Code" onClick={(e) => viewAbuseTSCode(record.cell_id)}>
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

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedRowKeys(selectedRowKeys);
			setSelectedRows(selectedRows);
			props.onCellIdChange(selectedRows);
		},
		getCheckboxProps: (record) => ({
			disabled: props.disableSelection,
			// Column configuration not to be checked
		}),
	};

	const getColsToDisplay = (cols) => {
		return cols.filter((col) => {
			if (["shared", "public"].includes(props.type) && col.title === "Delete") {
				return false;
			}
			return true;
		});
	};

	return (
		<div>
			<Modal centered width="auto" visible={loading} closable={false} footer={null} maskClosable={false}>
				<Spin size="large" />
			</Modal>
			<div className="card shadow">
				<div className="card-body filterBar">
					<div style={{ display: "inline-block" }} className="pe-2">
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
								addonBefore="Cycle Step"
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
					<Button disabled={!cellIds.length} onClick={() => handleApplyFilter()}>
						{/* {props.testType === "abuseTest" ? "Apply Sample" : "Apply Cycle Step"} */}
						Apply Filter
					</Button>
					{/* view code modal */}
					<ViewCodeModal
						code={codeContent}
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						searchParams={searchParams}
					/>

					<span style={{ float: "right", fontSize: "0.9rem" }}>
						<Text type="secondary">Total: {cellIds.length}</Text>
					</span>
					<br />
					<Table
						sticky={true}
						loading={tableLoading}
						style={{ marginTop: "10px" }}
						columns={props.testType === "abuseTest" ? abuseTestColumns : getColsToDisplay(columns)}
						dataSource={cellIds}
						pagination={false}
						scroll={{
							x: true,
							y: "150px",
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
