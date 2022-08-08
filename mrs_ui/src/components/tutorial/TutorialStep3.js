import { Button, Divider, Table, Upload, Spin } from "antd";
import React, { useState } from "react";
import Papa from "papaparse";
import { InboxOutlined, FileTextOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

const TutorialStep3 = (props) => {
	const [columns, setColumns] = useState([]);
	const [tableData, setTableData] = useState([]);

	const fileUploadHandler = (info) => {
		props.onUserDataUpload(info.file.originFileObj);
		if (info.fileList.length) {
			Papa.parse(info.file.originFileObj, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				complete: function (results) {
					let headers = Object.keys(results.data[0]);
					setColumns(
						headers.map((h) => ({
							title: h,
							dataIndex: h,
							key: h,
						}))
					);
					setTableData(results.data);
				},
			});
		}
	};

	const removeFile = () => {
		setColumns([]);
		setTableData([]);
	};

	return (
		<div>
			<h3 className="my-3">Step 1: Select Battery Data</h3>
			{props.loading ? (
				<div className="d-flex justify-content-center align-items-center" style={{ height: "50vh" }}>
					<Spin size="large" />
				</div>
			) : (
				<div>
					<p className="text-muted">
						Upload your own custom data or try
						<Button className="ms-0 ps-0" type="link" onClick={() => props.goToNamedStep("amplabs_sample_data")}>
							&nbsp;amplabs sample data
						</Button>
					</p>
					<div style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
						<div className="text-center">
							<Dragger
								multiple={false}
								maxCount={1}
								name="file"
								showUploadList={false}
								onChange={(info) => fileUploadHandler(info)}
								customRequest={() => { }}
								iconRender={() => <FileTextOutlined />}
								accept=".csv, text/csv, text/plain"
								onRemove={removeFile}
								style={{ padding: "60px" }}
							>
								<p className="ant-upload-drag-icon">
									<InboxOutlined />
								</p>
								<p className="ant-upload-text">Click or drag file to this area to upload</p>
							</Dragger>
						</div>
						<div>
							<Divider type="vertical" className="mx-5" style={{ height: "400px" }} />
						</div>
						<div style={{ maxWidth: "50%" }}>
							<p className="fs-5 fw-light text-center">Data Preview</p>
							<Table
								scroll={{
									scrollToFirstRowOnChange: true,
									x: columns.length * 150,
									y: "300px",
								}}
								size="small"
								sticky={true}
								columns={columns}
								dataSource={tableData}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default TutorialStep3;
