// ====== python code files ====== 
import sourceCode from "../chartConfig/chartSourceCode";

const _createChartDataSeries = (data, xAxis, yAxis, chartId) => {
	let x = [];
	data.forEach((d) => {
		x.push({
			type: chartId === "timeSeries" ? "scatter" : "line",
			symbolSize: chartId === "timeSeries" ? 5 : 10,
			name: d.id,
			showSymbol: false,
			datasetId: d.id,
			encode: {
				x: xAxis,
				y: yAxis,
			},
		});
	});
	return x;
};

const _createChartLegend = (data, chartId) => {
	let x = [];
	data.forEach((d) => {
		x.push(d.id);
	});
	return {
		data: x,
		type: "scroll",
		orient: "horizontal",
		// left: "right",
		// top: window.screen.width < 600 ? "auto" : "15%",
		bottom: "0%",
		// right: window.screen.width < 1200 ? "auto" : "0%",
		// top: window.screen.width < 1200 ? "auto" : "16%",
		// bottom: window.screen.width < 1200 ? "0" : "auto",
		icon:
			chartId === "timeSeries"
				? "pin"
				: "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z",
		pageTextStyle: {
			overflow: "truncate",
		},
		// backgroundColor: "#FFFFFF",
		textStyle: {
			fontSize: window.screen.width < 600 ? 12 : 16,
		},
	};
};

export const chartConfig = (chartName, data) => {
	let { xAxis, yAxis, chartId, chartTitle } = getChartMetadata(chartName);
	return {
		title: {
			show: true,
			id: chartId,
			text: chartTitle,
			textStyle: {
				fontSize: window.screen.width < 600 ? 15 : 20,
				fontWeight: "normal",
				overflow: "break",
				width: window.screen.width < 600 ? 300 : 500,
			},
		},
		dataset: data,
		series: _createChartDataSeries(data, xAxis.mapToId, yAxis.mapToId, chartId),
		xAxis: {
			type: "value",
			name: xAxis.title,
			nameLocation: "middle",
			nameGap: 25,
			nameTextStyle: {
				fontSize: window.screen.width < 600 ? 12 : 16,
				padding: [5, 0],
			},
			scale: true,
		},
		yAxis: {
			type: "value",
			name: yAxis.title,
			nameLocation: "middle",
			nameGap: 25,
			nameTextStyle: {
				fontSize: window.screen.width < 600 ? 12 : 16,
			},
			scale: true,
			padding: [0, 5],
		},
		legend: _createChartLegend(data, chartId),
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
	};
};

export const getChartMetadata = (chartName) => {
	let result = {};
	switch (chartName) {
		case "cycleIndex":
			result = {
				endpoint: `/echarts/energyAndCapacityDecay`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "value",
					title: "Ah/Wh",
				},
				chartTitle: "Cycle Index Data - Energy and Capacity Decay",
				chartId: "cycleIndex",
				code: sourceCode.cycleIndexChart,
			};
			break;
		case "timeSeries":
			result = {
				endpoint: `/echarts/energyAndCapacityDecay`,
				xAxis: {
					mapToId: "test_time",
					title: "Time (s)",
				},
				yAxis: {
					mapToId: "value",
					title: "Wh/Ah",
				},
				chartTitle: "Time Series Data - Energy and Capacity Decay",
				chartId: "timeSeries",
				code: sourceCode.timeSeriesChart,
			};
			break;
		case "efficiency":
			result = {
				endpoint: `/echarts/efficiency`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "value",
					title: "Enery and Coulombic Efficiencies",
				},
				chartTitle: "Efficiencies",
				chartId: "efficiency",
				code: sourceCode.efficiencyChart,
			};
			break;
		case "cycleQtyByStep":
			result = {
				endpoint: `/echarts/cycleQuantitiesByStep`,
				xAxis: {
					mapToId: "cycle_time",
					title: "Cycle Time (s)",
				},
				yAxis: {
					mapToId: "v",
					title: "Voltage (V)",
				},
				chartTitle: "Cycle Quantities by Step",
				chartId: "cycleQtyByStep",
				code: sourceCode.cycleQtyByStepChart,
			};
			break;
		case "cycleQtyByStepWithCapacity":
			result = {
				endpoint: `/echarts/cycleQuantitiesByStep`,
				xAxis: {
					mapToId: "ah",
					title: "Capacity (Ah)",
				},
				yAxis: {
					mapToId: "v",
					title: "Voltage (V)",
				},
				chartTitle: "Cycle Quantities by Step - Capacity",
				chartId: "cycleQtyByStepWithCapacity",
				code: sourceCode.cycleQtyByStepWithCapacityChart,
			};
			break;
		default:
			break;
	}
	return result;
};