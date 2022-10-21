import React from "react";
import { Popconfirm, Space, Table } from "antd";
import { Button } from "antd";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useFileUpload } from "../../context/FileUploadContext";

const UploadPageTable = (props) => {
	const {
		state: { tableData },
		action: { setTableData, editFile },
	} = useFileUpload();

	const uploadBtnHandler = () => {
		props.onUpload();
	};

	const handleDeleteFile = ({ key: fileKey }) => {
		const newTableData = tableData.filter((d) => d.key !== fileKey);
		setTableData(newTableData);
	};

	const tableColumns = [
		{
			title: "S.No",
			dataIndex: "index",
			key: "index",
			width: 50,
			fixed: "left",
			align: "center",
			render(_, __, index) {
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
			title: "Size",
			dataIndex: "size",
			key: "size",
			width: 100,
			align: "center",
		},
		{
			title: "Cell Id",
			dataIndex: "cellId",
			key: "cellId",
			width: 100,
			align: "center",
		},
		{
			title: "Template",
			dataIndex: "",
			render: (_, record) => {
				let template = Object.values(record.template);
				return template
			},
			key: "template",
			width: 100,
			align: "center",
		},
		{
			title: "Public?",
			key: "is_public",
			align: "center",
			render: (_, record) => <div className="filter-bar-delete-column">{record.isPublic ? "Yes" : "No"}</div>,
			width: 100,
		},
		{
			title: "Action",
			key: "action",
			dataIndex: "delete",
			fixed: "right",
			align: "center",
			width: 90,
			render: (text, record) => (
				<div className="filter-bar-delete-column">
					<Popconfirm title="Sure to delete?" onConfirm={() => handleDeleteFile(record)}>
						<Space size="middle">
							<Button type="link">Delete</Button>
						</Space>
					</Popconfirm>
					<Button type="link" onClick={() => editFile(record.key)}>
						Edit
					</Button>
				</div>
			),
		},
	];

	return (
		<>
			{tableData && tableData.length ? (
				<div className="m-3">
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
						columns={tableColumns}
						dataSource={tableData}
						bordered
						pagination={false}
						scroll={{
							x: 600,
							y: "500px",
						}}
					/>
				</div>
			) : null}
		</>
	);
};

export default UploadPageTable;
