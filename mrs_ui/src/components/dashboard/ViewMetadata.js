import { message, Modal, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import EditableTable from "../EditableTable";

const cellMetadataCol = [
	{
		title: "Cell ID",
		dataIndex: "cell_id",
		key: "cell_id",
		editable: true,
	},
	{
		title: "Anode",
		dataIndex: "anode",
		key: "anode",
		editable: true,
	},
	{
		title: "Cathode",
		dataIndex: "cathode",
		key: "cathode",
		editable: true,
	},
	{
		title: "Source",
		dataIndex: "source",
		key: "source",
		editable: true,
	},
	{
		title: "Nominal Ah",
		dataIndex: "ah",
		key: "ah",
		editable: true,
	},
	{
		title: "Form Factor",
		dataIndex: "form_factor",
		key: "form_factor",
		editable: true,
	},
	{
		title: "Active Mass (mg)",
		dataIndex: "active_mass",
		key: "active_mass",
		editable: true,
	},
];

const testMetadataCol = [
	{
		title: "CellId",
		dataIndex: "cell_id",
		key: "cell_id",
	},
	// {
	// 	title: "Experiment",
	// 	dataIndex: "experiment",
	// 	key: "experiment",
	// 	editable: true,
	// },
	// {
	// 	title: "Label",
	// 	dataIndex: "label",
	// 	key: "label",
	// 	editable: true,
	// },
	{
		title: "Temprature",
		dataIndex: "temperature",
		key: "temperature",
		editable: true,
	},
	{
		title: "Max Voltage",
		dataIndex: "v_max",
		key: "v_max",
		editable: true,
	},
	{
		title: "Min Voltage",
		dataIndex: "v_min",
		key: "v_min",
		editable: true,
	},
	{
		title: "Max SOC",
		dataIndex: "soc_max",
		key: "soc_max",
		editable: true,
	},
	{
		title: "Min SOC",
		dataIndex: "soc_min",
		key: "soc_min",
		editable: true,
	},
	{
		title: "Charge Rate",
		dataIndex: "crate_c",
		key: "crate_c",
		editable: true,
	},
	{
		title: "Discharge Rate",
		dataIndex: "crate_d",
		key: "crate_d",
		editable: true,
	},
];

// cellIds={cellDataOnEdit} type={props.type} onCellEdit={refreshSideBarOnEdit}

const ViewMetadata = (props) => {
	const [cellMetadata, setCellMetadata] = useState([]);
	const [testMetadata, setTestMetadata] = useState([]);
	const [filteredCellMetadata, setFilteredCellMetadata] = useState([]);
	const [filteredTestMetadata, setFilteredTestMetadata] = useState([]);
	const [shallShowLoad, setShallShowLoad] = useState(false);

	const accessToken = useAuth0Token();
	const { state, action } = useDashboard();

	useEffect(() => {
		let checkedCellIds = state.checkedCellIds.map((c) => c.cell_id);
		if (cellMetadata.length) {
			setFilteredCellMetadata(cellMetadata.filter((obj) => checkedCellIds.includes(obj.cell_id)));
		}
		if (testMetadata.length) {
			setFilteredTestMetadata(testMetadata.filter((obj) => checkedCellIds.includes(obj.cell_id)));
		}
	  
	}, [state.checkedCellIds])
	
	const getSearchParams = (cellIds) => {
		let params = new URLSearchParams();
		cellIds.map((k) => {
			params.append("cell_id", k);
		});
		return params;
	};

	const getTestMetadata = (cellIds) => {
		let request = {
			params: getSearchParams(cellIds),
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};
		setTestMetadata([]);
		axios
			.get("/cells/tests/cycle/metaWithId", request)
			.then((response) => {
				let data = response.data.records[0];
				data = data.map((d, k) => {
					return { ...d, key: k };
				});
				setTestMetadata(data);
				setFilteredTestMetadata(data);
			})
			.catch((err) => {
				console.error("EditCell err", err);
			});
	};

	const getCellMetadata = (cellIds) => {
		let request = {
			params: getSearchParams(cellIds),
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};
		setCellMetadata([]);
		axios
			.get("/cells/cycle/metaWithId", request)
			.then((response) => {
				let data = response.data.records[0];
				data = data.map((d, k) => {
					return { ...d, key: k };
				});
				setCellMetadata(data);
				setFilteredCellMetadata(data);
			})
			.catch((err) => {
				console.error("EditCell err", err);
			});
	};

	const getData = () => {
		let cellIdsWithoutId = state.selectedCellIds.map((k) => k.split("_").slice(2).join("_"));
		getCellMetadata(cellIdsWithoutId);
		getTestMetadata(cellIdsWithoutId);
	};

	useEffect(() => {
		if (state.selectedCellIds && accessToken) getData();
	}, [state.selectedCellIds, accessToken]);

	const handleSaveChanges = (data, type) => {
		setShallShowLoad(true);
		let endpoint = type === "test" ? "/cells/tests/cycle/meta" : "/cells/cycle/meta";
		let newData = [];
		let cellIdUpdated = [];
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
			cellIdUpdated.push({
				cell_id: item.cell_id,
				index: item.index,
				type: item.type })
			delete item.key;
			if (item.type === "private") {
				delete item.type;
				newData.push(item);
			}
		}
		axios
			.patch(endpoint, newData, {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then((response) => {
				action.refreshSidebar(null, cellIdUpdated, null, "dashboardType2");
				getTestMetadata(newData.map((d) => d.cell_id));
				getCellMetadata(newData.map((d) => d.cell_id));
				setShallShowLoad(false);
				message.success("Updated Successfully!");
				message.success("Updated Successfully!");
			})
			.catch((err) => {
				console.error("edit api err", err);
				setShallShowLoad(false);
			});
	};

	return (
		<div className="m-2 p-2 card shadow">
			<Modal centered width="auto" visible={shallShowLoad} closable={false} footer={null} maskClosable={false}>
				<Spin size="large" />
			</Modal>
			<EditableTable
				onSave={(data) => handleSaveChanges(data, "cell")}
				columns={cellMetadataCol}
				dataSource={filteredCellMetadata}
				title="Cell Metadata"
				shallShowSaveBtn={!["public", "shared"].includes(props.type)}
			/>
			<EditableTable
				onSave={(data) => handleSaveChanges(data, "test")}
				columns={testMetadataCol}
				dataSource={filteredTestMetadata}
				title="Test Metadata"
				shallShowSaveBtn={!["public", "shared"].includes(props.type)}
			/>
		</div>
	);
};

export default ViewMetadata;
