import React, { useEffect, useRef, useState} from "react";
import ReactEcharts from "echarts-for-react";
import message from "antd/es/message";
import axios from "axios";
import { useAuth0Token } from "../../utility/useAuth0Token";
import AWS from "aws-sdk";
import { _createChartDataSeries, _createChartLegend, _createChartColors } from "../../chartConfig/dashboardChartConfig";

const S3_BUCKET = process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_DEV_UPLOAD_S3_BUCKET : process.env.REACT_APP_PROD_UPLOAD_S3_BUCKET;
const REGION = process.env.REACT_APP_AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY

const TutorialStep4 = (props) => {

	const [loading, setLoading] = useState(true);
	const chartRef = useRef();
	const accessToken = useAuth0Token();
	useEffect(() => {
		if (props.isActive) {
			if (!props.cellId) {
				getSampleChartData();

			} else {
				getChartData(props.cellId);
			}

		}
	}, [props.isActive]);

	const getSampleChartData = () => {
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
			Key: `sample/sampleResponseData.json`,
		};
	
		myBucket.getObject(params, (err, data) => {
			if (err) {
			  console.log(err, err.stack);
			} else {
				let response = JSON.parse(data.Body)
		chartRef.current.getEchartsInstance().setOption({
			animation: false,
			dataset: response.records[0],
			series: _createChartDataSeries(response.records[0], 'specific_capacity', 'v', { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" }, "galvanostaticPlot"),
			xAxis: {
				type: "value",
				name: "Capacity",
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 12 : 16,
					padding: [5, 0],
				},
				scale: true,
				splitLine: {
					show: false
				 },
				 axisLine: {
					lineStyle: {
					  color: "black"
					}
				  }
			},
			yAxis: {
				name: 'Voltage',
				scale: true,
				splitLine: {
					show: false
				 },
				 axisLine: {
					lineStyle: {
					  color: "black"
					}
				  }
			},
			legend: _createChartLegend(response.records[0], "galvanostaticPlot", { mapToId: ["cycle_discharge_capacity"], displayColMapping: { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" } }),
			color: _createChartColors(response.records[0])
		});
		setLoading(false)
			}})
	}
	const getChartData = (cellId) => {
		let data = {
			cell_ids: [cellId],
		};
		axios({
			method: "post",
			url: "echarts/galvanostaticPlot",
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
			data: JSON.stringify(data),
		})
			.then(function (result) {
				axios({
					method: "get",
					url: result.data.response_url,
					headers: {
						"Content-Type": "application/json",
				},
				})
          .then((response) => {
				chartRef.current.getEchartsInstance().setOption({
					dataset: response.data.records[0],
					series: _createChartDataSeries(response.data.records[0], 'specific_capacity', 'v', { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" }, 'galvanostaticPlot'),
					xAxis: {
						type: "value",
						name: "Capacity",
						nameLocation: "middle",
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 12 : 16,
							padding: [5, 0],
						},
						scale: true,
						splitLine: {
							show: false
						 },
						 axisLine: {
							lineStyle: {
							  color: "black"
							}
						  }
					},
					yAxis: {
						name: 'Voltage',
						scale: true,
						splitLine: {
							show: false
						 },
						 axisLine: {
							lineStyle: {
							  color: "black"
							}
						  }
					},
					legend: _createChartLegend(response.data.records[0], "galvanostaticPlot", { mapToId: ["cycle_discharge_capacity"], displayColMapping: { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" } }),
					color: _createChartColors(response.data.records[0])
				});
				setLoading(false)
			})})
			.catch(function (error) {
				if (error.response.data.status === 400) {
					message.error(error.response.data.detail);
					message.error(error.response.data.detail);
				}
			});
	};
	return (
		<div className="mt-3">
			<h3 className="mt-1">Step 2: Plot</h3>
			<p className="text-muted"></p>
			<div className="card shadow" style={{ height: "100%", width: "100%" }}>
				<div className="card-body">
					<ReactEcharts
						style={{
							width: "100%",
							height: "34em",
						}}
						ref={chartRef}
						option={{}}
						lazyUpdate={true}
						showLoading={loading}
					/>
				</div>
			</div>
		</div>
	);
};

export default TutorialStep4;
