import { message, Modal, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useAuth0Token } from "../utility/useAuth0Token";
import EditableTable from "./EditableTable";

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

const EditCellData = (props) => {
	const [cellMetadata, setCellMetadata] = useState([]);
	const [testMetadata, setTestMetadata] = useState([]);
	const [shallShowLoad, setShallShowLoad] = useState(false);

	const accessToken = useAuth0Token();

	const getData = () => {
		let params = new URLSearchParams();
		props.cellIds.map((k) => {
			// if (k.split("_")[0] === "private") {
			// }
			params.append("cell_id", k.substring(k.indexOf("_") + 1));
		});
		let request = {
			params: params,
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
			})
			.catch((err) => {
				console.error("EditCell err", err);
			});
		setTestMetadata([]);
		axios
			.get("/cells/tests/cycle/metaWithId", request)
			.then((response) => {
				let data = response.data.records[0];
				data = data.map((d, k) => {
					return { ...d, key: k };
				});
				setTestMetadata(data);
			})
			.catch((err) => {
				console.error("EditCell err", err);
			});
	};

	useEffect(() => {
		getData();
	}, [props.cellIds]);

	const handleSaveChanges = (data, type) => {
		setShallShowLoad(true);
		let endpoint = type === "test" ? "/cells/tests/cycle/meta" : "/cells/cycle/meta";
		let newData = [];
		for (let i = 0; i < data.length; i++) {
			const item = data[i];
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
			.then(() => {
				props.onCellEdit();
				// getData();
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
				dataSource={cellMetadata}
				title="Cell Metadata"
				shallShowSaveBtn={!["public", "shared"].includes(props.type)}
			/>
			<EditableTable
				onSave={(data) => handleSaveChanges(data, "test")}
				columns={testMetadataCol}
				dataSource={testMetadata}
				title="Test Metadata"
				shallShowSaveBtn={!["public", "shared"].includes(props.type)}
			/>
		</div>
	);
};

export default EditCellData;
