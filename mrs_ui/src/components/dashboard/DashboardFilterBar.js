import React, { useState, useEffect } from "react";
import { audit } from "../../auditAction/audit";
import { cycleDataCodeContent, timeSeriesDataCodeContent, abuseCellIdViewCode } from "../../chartConfig/cellIdViewCode";
import { FaRegTrashAlt, FaCode } from "react-icons/fa";
import { SearchOutlined } from "@ant-design/icons";
import { Space, Input, Table, Button, Popconfirm, message, Select, Modal, Spin, Typography, Switch } from "antd";
import { useAuth0Token } from "../../utility/useAuth0Token";
import axios from "axios";
import Highlighter from "react-highlight-words";
import ViewCodeModal from "../ViewCodeModal";
import { useDashboard } from "../../context/DashboardContext";
import { useUserPlan } from "../../context/UserPlanContext";
import { useNavigate } from "react-router-dom";

import { useAuth0 } from "@auth0/auth0-react";

const { Text } = Typography;

const DashboardFilterBar = (props) => {
	const userPlan = useUserPlan();
	const [cellIds, setCellIds] = useState([]);
	const [tableLoading, setTableLoading] = useState(true);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [selectedRows, setSelectedRows] = useState([]);
	const [step, setStep] = useState(localStorage.getItem("step") ? localStorage.getItem("step") : 500);
	const [stepInputPlaceholder, setStepInputPlaceholder] = useState("Step");
	const [stepInputStatus, setStepInputStatus] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [searchParams, setSearchParams] = useState("");
	const [loading, setLoading] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const [searchText, setSearchText] = useState("");
	const [searchedColumn, setSearchedColumn] = useState("");
	const accessToken = useAuth0Token();
	const { state, action } = useDashboard();
	const navigate = useNavigate();

	const { user } = useAuth0();

	const _cleanCellIds = (cellIds) => {
		let x = [];
		cellIds.map((k) => {
			x.push({ cell_id: k });
		});
		return x;
	};

	useEffect(() => {
		if (accessToken && state.selectedCellIds.length && userPlan) {
			let data;
			data = _cleanCellIds(state.selectedCellIds);
			let cellIdData = [];
			if (data.length) {
				data.forEach((cellId, i) => {
					cellIdData.push({
						key: i,
						cell_id: cellId.cell_id.split("_").slice(2).join("_"),
						index: cellId.cell_id.split("_", 3)[0],
					});
				});
				setCellIds([...cellIdData]);
				setSelectedRowKeys(cellIdData.map((c) => c.key));
				setSelectedRows([...cellIdData]);
				setTableLoading(false);
				props.onFilterChange([...cellIdData], step, accessToken);
			} else {
				// error
				setCellIds([]);
				setSelectedRowKeys([]);
				setSelectedRows([]);
				props.onFilterChange([], step, accessToken);
				setTableLoading(false);
			}
		}
	}, [state.selectedCellIds, accessToken, userPlan]);

	const onVisibilityToggle = (record, checked) => {
		console.log(record)
		// setLoading(true);
		axios
			.patch("/cells/cycle/meta", [{"index":parseInt(record.index), "is_public": checked, "cell_id": record.cell_id}], {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then((response) => {
				setLoading(false);
				action.refreshSidebar();
				message.success("Updated");
				message.success("Updated");
			})
			.catch((err) => {
				setLoading(false);
				message.error("Error Updating");
				message.error("Error Updating");
			});
	};

	const handleCellDelete = (record) => {
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", record.cell_id);
		axios
			.delete(`/cells`, {
				params: params,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(() => {
				setLoading(false);
				setCellIds(cellIds.filter((item) => item.key !== record.key));
				let records = selectedRows.filter((item) => item.key !== record.key);
				setSelectedRows(records);
				setSelectedRowKeys(selectedRowKeys.filter((item) => item !== record.key));
				props.onCellIdChange(records);
				action.refreshSidebar(record.cell_id);
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
		localStorage.setItem("step", step);
		let result = props.onFilterChange(selectedRows, step, accessToken);
		if (result) {
			message.success("Filter Applied!"); // potential bug in antd need to call msg twice
			message.success("Filter Applied!");
		} else {
			message.error("Error Applying filters!");
			message.error("Error Applying filters!");
		}
	};

	const downloadCycleData = (k) => {
		audit(`cycle_data_download`, user);
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_data`, {
				params: params,
				responseType: "arraybuffer",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(({ data }) => {
				var a = document.createElement("a");
				var blob = new Blob([data], { type: "application/zip" });
				a.href = window.URL.createObjectURL(blob);
				a.download = k + " (Cycle Data).zip";
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
		audit(`cycle_dash_cellId__cycle_viewcode`, user);
		setSearchParams(getSearchParams(k.trim(), state.dashboardId));
		setCodeContent(cycleDataCodeContent);
		setModalVisible(true);
	};

	const viewTimeSeriesDataCode = (k) => {
		audit(`cycle_dash_cellId__ts_viewcode`, user);
		setSearchParams(getSearchParams(k.trim(), state.dashboardId));
		setCodeContent(timeSeriesDataCodeContent);
		setModalVisible(true);
	};

	const downloadTimeSeriesData = (k) => {
		audit(`time_series_data_download`, user);
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_timeseries`, {
				params: params,
				responseType: "arraybuffer",
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(({ data }) => {
				var a = document.createElement("a");
				var blob = new Blob([data], { type: "application/zip" });
				a.href = window.URL.createObjectURL(blob);
				a.download = k + " (Time Series).zip";
				a.click();
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	};

	// =========Filter================
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
							audit(`cycle_test_dash_cellId_search`, user);
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
	// =======Filter END==============
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
		{
			title: "Public",
			key: "toggle",
			render: (text, record) =>
				cellIds.length >= 1 ? (
					<div className="filter-bar-delete-column">
					
						<Switch 
						defaultChecked={_checkIsPublic(record)} 
						size="small"
						loading={props.disableSelection}
						disabled={userPlan.includes("COMMUNITY") || _checkIsReadOnly(record)}
						onChange={(checked) => onVisibilityToggle(record, checked)}
						></Switch>
					</div>
				) : null,
			width: 100,
		},
	];

	const _checkIsReadOnly = (record) => {
		return state.selectedCellIds.find((c) => {
			return record.cell_id === c.split("_").slice(2).join("_") && (!c.split("_", 3)[1].includes("public/user") && !c.split("_", 3)[1].includes("private"));
		});
	};
	const _checkIsPublic = (record) => {
		return state.selectedCellIds.find((c) => {
			return record.cell_id === c.split("_").slice(2).join("_") && c.split("_",3)[1].includes("public");
		});
	}


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
			if (["shared", "public"].includes(state.dashboardType) && col.title === "Delete") {
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
					</div>
					<Button disabled={!cellIds.length || props.disableSelection} onClick={() => handleApplyFilter()}>
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
						columns={getColsToDisplay(columns)}
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
