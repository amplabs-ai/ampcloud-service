import React, { useState, useEffect } from "react";
import { audit } from "../../../auditAction/audit";
import {
	cycleDataCodeContent,
	timeSeriesDataCodeContent,
} from "../../../chartConfig/cellIdViewCode";
import { FaCode } from "react-icons/fa";
import SearchOutlined from "@ant-design/icons/SearchOutlined";
import Space from "antd/es/space";
import Input from "antd/es/input";
import Table from "antd/es/table";
import Button from "antd/es/button";
import Modal from "antd/es/modal";
import Spin from "antd/es/spin";
import { useAuth0Token } from "../../../utility/useAuth0Token";
import axios from "axios";
import ViewCodeModal from "../../ViewCodeModal";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserPlan } from "../../../context/UserPlanContext";

const getHighlightedText = (text, highlight) => {
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
	console.log(text, highlight, parts)
    return <span> { parts.map((part, i) => 
        <span key={i} style={part.toLowerCase() === highlight.toLowerCase() ? { backgroundColor: "#ffc069", padding: 0 } : {} }>
            { part }
        </span>)
    } </span>;
} 

const PlotterFilterbar = (props) => {
	const [cellIds, setCellIds] = useState([]);
	const [tableLoading, setTableLoading] = useState(true);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [searchParams, setSearchParams] = useState("");
	const [loading, setLoading] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const [searchText, setSearchText] = useState("");
	const [searchedColumn, setSearchedColumn] = useState("");
	const accessToken = useAuth0Token();
	const { user } = useAuth0();
	const userPlan = useUserPlan()

	const { state} = useDashboard();

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
					});
				});
				setCellIds([...cellIdData]);
				setSelectedRowKeys(cellIdData.map((c) => c.key));
				props.onCellIdChange(cellIdData);
				setTableLoading(false);
			} else {
				// error
				setCellIds([]);
				setSelectedRowKeys([]);
				props.onCellIdChange([]);
				setTableLoading(false);
			}
		}
	}, [state.selectedCellIds, accessToken, userPlan]);

	const downloadCycleData = (k) => {
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_data`, {
				params: params,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(({ data }) => {
				var a = document.createElement("a");
				a.href =data.response_url;
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
		audit(`cycle_dash_cellId__cycle_viewcode`, {...user, userTier: userPlan});
		setSearchParams(getSearchParams(encodeURIComponent(k.trim()), state.dashboardId));
		setCodeContent(cycleDataCodeContent);
		setModalVisible(true);
	};

	const viewTimeSeriesDataCode = (k) => {
		audit(`cycle_dash_cellId__ts_viewcode`, {...user, userTier: userPlan});
		setSearchParams(getSearchParams(encodeURIComponent(k.trim()), state.dashboardId));
		setCodeContent(timeSeriesDataCodeContent);
		setModalVisible(true);
	};

	const downloadTimeSeriesData = (k) => {
		setLoading(true);
		let params = new URLSearchParams();
		params.append("cell_id", k);
		axios
			.get(`/download/cells/cycle_timeseries`, {
				params: params,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(({ data }) => {
				var a = document.createElement("a");
				a.href =data.response_url;
				a.download = k + " (Timeseries Data).zip";
				a.click();
				setLoading(false);
			})
			.catch((err) => {
				setLoading(false);
			});
	};

	// =========SEARCH================
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
							audit(`cycle_test_dash_cellId_search`, {...user, userTier: userPlan});
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
				getHighlightedText(text,searchText)
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
	// =======SEARCH END==============
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
	];
	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys, selectedRows) => {
			setSelectedRowKeys(selectedRowKeys);
			props.onCellIdChange(selectedRows);
		},
		getCheckboxProps: (record) => ({
			disabled: props.disableSelection,
			// Column configuration not to be checked
		}),
	};

	return (
		<div>
			<Modal centered width="auto" visible={loading} closable={false} footer={null} maskClosable={false}>
				<Spin size="large" />
			</Modal>
			<div className="card shadow">
				<div className="card-body filterBar">
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
						columns={columns}
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

export default PlotterFilterbar;
