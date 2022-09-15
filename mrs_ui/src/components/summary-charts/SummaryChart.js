import React from "react";
import ReactEcharts from "echarts-for-react";

const SummaryChart = ({ title, type, data }) => {
	return (
		<div>
			<ReactEcharts
				option={{
					title: {
						text: title,
					},
					xAxis: {
						type: "category",
					},
					grid: { containLabel: true },
					yAxis: {
						type: "value",
					},
					series: [
						{
							type: "bar",
							encode: {
								x: type,
								y: "count",
							},
						},
					],
					dataset: {
						source: data,
					},
				}}
			/>
		</div>
	);
};

export default SummaryChart;
