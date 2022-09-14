import React from "react";
import ReactEcharts from "echarts-for-react";

const summaryData = [
	{
		name: "type1",
		count: 1300000000000090,
	},
	{
		name: "type2",
		count: 1000,
	},
	{
		name: "type3",
		count: 1400,
	},
	{
		name: "type4",
		count: 800,
	},
	{
		name: "type5",
		count: 12,
	},
	{
		name: "type6",
		count: 1000,
	},
	{
		name: "type7",
		count: 12,
	},
	{
		name: "type8",
		count: 1000,
	},
];

const SummaryChart = ({ title }) => {
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
						},
					],
					dataset: {
						source: summaryData,
					},
				}}
			/>
		</div>
	);
};

export default SummaryChart;
