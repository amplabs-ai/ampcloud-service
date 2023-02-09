import Divider from "antd/es/divider";
import Table from "antd/es/table";
import React, { useEffect, useState } from "react";
import { FaDownload } from "react-icons/fa";
import Papa from "papaparse";
import AWS from "aws-sdk";
const S3_BUCKET = process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_DEV_UPLOAD_S3_BUCKET : process.env.REACT_APP_PROD_UPLOAD_S3_BUCKET;
const REGION = process.env.REACT_APP_AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY

const TutorialStep2 = () => {
		const [columns, setColumns] = useState([]);
    const [tableData, setTableData] = useState([]);
    const [csvData, setCsvData] = useState()

    useEffect(() => {
      // console.log(csvData)
    AWS.config.update({
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    });

    const myBucket = new AWS.S3({
        params: { Bucket: S3_BUCKET },
        region: REGION,
    });
    const params = {
        Bucket: S3_BUCKET,
        Key: `sample/sampleDataCsv.txt`,
    };

    myBucket.getObject(params, (err, data) => {
        if (err) {
          console.log(err, err.stack);
        } else {
          setCsvData(new TextDecoder().decode(data.Body))
          Papa.parse(new TextDecoder().decode(data.Body), {
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
