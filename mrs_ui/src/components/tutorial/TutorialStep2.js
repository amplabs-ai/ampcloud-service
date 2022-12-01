import { Button, Card, Divider, Spin, Table } from "antd";
import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import Papa from "papaparse";
import { csvData } from "./sampleDataCsv";

const TutorialStep2 = () => {
	const [columns, setColumns] = useState([]);
	const [tableData, setTableData] = useState([]);

	useEffect(() => {
		Papa.parse(csvData, {
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
	}, []);

	return (
		<div>
			<h3 className="my-3">Step 1: Select Battery Data</h3>

			<div style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}>
				<div className="text-center">
					<p className="fw-light fs-4">Amplabs Sample Data</p>
					<button
						className="btn btn-dark btn-lg "
						onClick={() => {
							var a = document.createElement("a");
							var blob = new Blob([csvData], { type: "text/csv" });
							a.href = window.URL.createObjectURL(blob);
							a.download = "Amplabs_Sample_Data.csv";
							a.click();
						}}
					>
						Download <FaDownload className="ms-1 " />
					</button>
				</div>
				<div>
					<Divider type="vertical" className="mx-5" style={{ height: "400px" }} />
				</div>
				<div style={{ maxWidth: "50%" }}>
					<p className="fs-5 fw-light text-center">Data Preview</p>
					<Table
						scroll={{
							// x: true,
							y: "350px",
						}}
						size="small"
						sticky={true}
						columns={columns}
						dataSource={tableData}
					/>
				</div>
			</div>
		</div>
	);
};

export default TutorialStep2;
