import React, { useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../../chartConfig/initialConfigs";
import { Button, message, Spin } from "antd";
import ProcessUpload from "../upload/ProcessUpload";
import axios from "axios";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { response } from "./sampleTestData"; // remove later
import { _createChartDataSeries, _createChartLegend } from "../../chartConfig/dashboardChartConfig";

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
			dataset: response.records[0],
			series: _createChartDataSeries(response.records[0], 'voltage', ['cycle_discharge_capacity'], { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" }, 'plotter'),
			xAxis: {
				type: "value",
				name: "Voltage (V)",
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 12 : 16,
					padding: [5, 0],
				},
				scale: true,
			},
			yAxis: {
				name: 'Cycle Discharge Capacity (Ah)',
				scale: true,
			},
			legend: _createChartLegend(response.records[0], "plotter", { mapToId: ["cycle_discharge_capacity"], displayColMapping: { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" } }),
			color: [
				"#1f77b4", // muted blue
				"#ff7f0e", // safety orange
				"#2ca02c", // cooked asparagus green
				"#d62728", // brick red
				"#9467bd", // muted purple
				"#8c564b", // chestnut brown
				"#e377c2", // raspberry yogurt pink
				"#7f7f7f", // middle gray
				"#bcbd22", // curry yellow-green
				"#17becf", // blue-teal
			],
		});
	}
	const getChartData = (cellId) => {
		let data = {
			cell_ids: [cellId],
			columns: ["voltage", "cycle_discharge_capacity"],
			filters: [],
		};
		axios({
			method: "post",
			url: "/echarts/timeseries",
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
			data: JSON.stringify(data),
		})
			.then(function (response) {
				chartRef.current.getEchartsInstance().setOption({
					dataset: response.data.records[0],
					series: _createChartDataSeries(response.data.records[0], 'voltage', ['cycle_discharge_capacity'], { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" }, 'plotter'),
					xAxis: {
						type: "value",
						name: "Voltage (V)",
						nameLocation: "middle",
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 12 : 16,
							padding: [5, 0],
						},
						scale: true,
					},
					yAxis: {
						name: 'Cycle Discharge Capacity (Ah)',
						scale: true,
					},
					legend: _createChartLegend(response.data.records[0], "plotter", { mapToId: ["cycle_discharge_capacity"], displayColMapping: { cycle_discharge_capacity: "Cycle Discharge Capacity (Ah)" } }),
					color: [
						"#1f77b4", // muted blue
						"#ff7f0e", // safety orange
						"#2ca02c", // cooked asparagus green
						"#d62728", // brick red
						"#9467bd", // muted purple
						"#8c564b", // chestnut brown
						"#e377c2", // raspberry yogurt pink
						"#7f7f7f", // middle gray
						"#bcbd22", // curry yellow-green
						"#17becf", // blue-teal
					],
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
