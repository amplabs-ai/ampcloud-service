import React, { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../../chartConfig/initialConfigs";
import { Button, message, Spin } from "antd";
import ProcessUpload from "../upload/ProcessUpload";
import axios from "axios";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { response } from "./sampleTestData"; // remove later
import { _createChartDataSeries, _createChartLegend, _createChartColors } from "../../chartConfig/dashboardChartConfig";

const TutorialStep4 = (props) => {
	const chartRef = useRef();
	const accessToken = useAuth0Token();
	useEffect(() => {
		if (props.isActive) {
			if (props.chartData === response.records[0]) {
				getSampleChartData();

			} else {
				getChartData(props.cellId);
			}

		}
	}, [props.isActive]);

	const getSampleChartData = () => {

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
			.then(function (response) {
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
			})
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
					/>
				</div>
			</div>
		</div>
	);
};

export default TutorialStep4;
