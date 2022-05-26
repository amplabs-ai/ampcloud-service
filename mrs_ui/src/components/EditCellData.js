import { message, Modal, Spin } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import EditableTable from "./EditableTable";
import { useAuth } from "../context/auth";

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
	const { user } = useAuth(); // auth context

	useEffect(() => {
		let params = new URLSearchParams();
		props.cellIds.map((k) => {
			// if (k.split("_")[0] === "private") {
			// }
			params.append("cell_id", k.substring(k.indexOf("_") + 1));
		});
		let request = {
			params: params,
			headers: {
				Authorization: `Bearer ${user.iss}`,
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
				console.log("EditCell cell data", data);
				setCellMetadata(data);
			})
			.catch((err) => {
				console.log("EditCell err", err);
			});
		setTestMetadata([]);
		axios
			.get("/cells/tests/cycle/metaWithId", request)
			.then((response) => {
				let data = response.data.records[0];
				data = data.map((d, k) => {
					return { ...d, key: k };
				});
				console.log("EditCell test data", data);
				setTestMetadata(data);
			})
			.catch((err) => {
				console.log("EditCell err", err);
			});
	}, [props.cellIds]);

	const handleSaveChanges = (data, type) => {
		setShallShowLoad(true);
		let endpoint = type === "test" ? "/cells/tests/cycle/meta" : "/cells/cycle/meta";
		console.log("data", data);

		let newData = [];
		// newData = newData.map((d) => {
		// 	delete d.key;
		// 	if (d.type === "private") {
		// 		delete d.type;
		// 		return d;
		// 	}
		// });
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
					Authorization: `Bearer ${user.iss}`,
				},
			})
			.then((response) => {
				let data = response; // .data.records[0]
				console.log("edit api", data);
				setShallShowLoad(false);
				message.success("Updated Successfully!");
				message.success("Updated Successfully!");
			})
			.catch((err) => {
				console.log("edit api err", err);
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
			/>
			<EditableTable
				onSave={(data) => handleSaveChanges(data, "test")}
				columns={testMetadataCol}
				dataSource={testMetadata}
				title="Test Metadata"
			/>
		</div>
	);
};

export default EditCellData;
