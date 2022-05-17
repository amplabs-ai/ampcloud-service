import { Table } from "antd";
import React from "react";

const dataSource = [
	{
		key: "1",
		cell_id: "Mike",
		anode: 32,
		cathod: "10 Downing Street",
	},
	{
		key: "2",
		cell_id: "John",
		anode: 42,
		cathod: "10 Downing Street",
	},
];

const columns = [
	{
		title: "Cell Metadata",
		children: [
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
				dataIndex: "cathod",
				key: "cathod",
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
				dataIndex: "Ah",
				key: "Ah",
				editable: true,
			},
			{
				title: "Form Factor",
				dataIndex: "Ah",
				key: "Ah",
				editable: true,
			},
		],
	},
	{
		title: "Test Metadata",
		children: [
			{
				title: "Form Factor",
				dataIndex: "Ah",
				key: "Ah",
			},
			{
				title: "Form Factor",
				dataIndex: "Ah",
				key: "Ah",
			},
		],
	},
];

const EditCellData = () => {
	const handleSave = (row) => {
		const newData = [...this.state.dataSource];
		const index = newData.findIndex((item) => row.key === item.key);
		const item = newData[index];
		newData.splice(index, 1, { ...item, ...row });
		this.setState({
			dataSource: newData,
		});
	};

	return (
		<div className="m-2 p-2 card shadow">
			<Table
				rowClassName={() => "editable-row"}
				sticky={true}
				pagination={false}
				dataSource={dataSource}
				columns={columns}
			/>
		</div>
	);
};

export default EditCellData;
