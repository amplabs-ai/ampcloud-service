// ====== python code files ======
import sourceCode from "../chartConfig/chartSourceCode";
import Gradient from "javascript-color-gradient";
import { scatterPlotChartId } from "./initialConfigs";

const colorTransitions = [
	['#e98d6b', '#e3685c', '#d14a61', '#b13c6c', '#8f3371', '#6c2b6d'],
	['#7dba91', '#59a590', '#40908e', '#287a8c', '#1c6488', '#254b7f'],
	["#ecaf80","#4a2262"],
	["#a4cc90", "#2c3071"],
	["#1f77b4", "#2193b0", "#6dd5ed"],
	["#ff7f0e", "#ff9966", "#ff5e62"],
	["#2ca02c", "#56ab2f", "#a8e063"],
	["#f953c6", "#b91d73"],
	["#f7b733", "#fc4a1a"],
	["#d62728", "#1f77b4"],
	["#c04848", "#480048"],
	["#0111F5", "#6F69E1"],
	["#570298", "#AD69E0"],
];

export const _createChartDataSeries = (data, xAxis, yAxis, displayColMapping = null, chartId) => {
	let x = [];
	if (chartId === "plotter") {
		data.forEach((d) => {
			yAxis.forEach((y) => {
				x.push({
					legendHoverLink: true,
					type: "line",
					symbolSize: 7,
					symbol: "circle",
					showSymbol: false,
					name: `${d.id}: ${displayColMapping[y]}`,
					datasetId: d.id,
					encode: {
						x: xAxis,
						y: y,
					},
				});
			});
		});
	} else {
		console.log("daatat", data);
		data.forEach((d) => {
			x.push({
				type: "line",
				showSymbol: scatterPlotChartId.indexOf(chartId) !== -1 ? true : false,
				symbolSize: scatterPlotChartId.indexOf(chartId) !== -1 ? 7 : 10,
				symbol: "circle",
				name: d.id,
				legendHoverLink: true,
				datasetId: d.id,
				encode: {
					x: xAxis,
					y: yAxis,
				},
			});
		});
	}
	return x;
};

export const _createChartLegend = (data, chartId, yAxis = null) => {
	let x = [];
	if (chartId === "plotter") {
		data.forEach((d) => {
			yAxis.mapToId.forEach((y) => {
				x.push(`${d.id}: ${yAxis.displayColMapping[y]}`);
			});
		});
	} else {
		data.forEach((d) => {
			x.push(d.id);
		});
	}
	return {
		data: x,
		type: "scroll",
		orient: "horizontal",
		// left: "right",
		// top: window.screen.width < 600 ? "auto" : "15%",
		padding: [10,0,0,0,0],
		bottom: "0%",
		// right: window.screen.width < 1200 ? "auto" : "0%",
		// top: window.screen.width < 1200 ? "auto" : "16%",
		// bottom: window.screen.width < 1200 ? "0" : "auto",
		icon:
			scatterPlotChartId.indexOf(chartId) !== -1
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
		tooltip: [
			{
				trigger: "axis",
				axisPointer: { type: "cross" },
				triggerOn: "click",
				formatter: function (params) {
					let tooltip_str = ""
					params.forEach((param) => {
						tooltip_str+=`${param.marker} <b>${param.seriesName}</b>(${parseFloat(param.value[xAxis.mapToId]).toPrecision(5)}<b>, </b>${parseFloat(param.value[yAxis.mapToId]).toPrecision(5)}) <br>`
					})
					return tooltip_str
				  }
			},
		],
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
		series: _createChartDataSeries(data, xAxis.mapToId, yAxis.mapToId, yAxis.displayColMapping, chartId),
		xAxis: {
			splitLine: {
				show: false
			 },
			type: "value",
			min: chartId === "galvanostaticPlot" ? -0.0005 :null,
			name: xAxis.title,
			nameLocation: "middle",
			nameGap: 25,
			nameTextStyle: {
				fontSize: window.screen.width < 600 ? 12 : 16,
				padding: [5, 0],
			},
			scale: true,
			axisLine: {
				lineStyle: {
				  color: "black"
				}
			  }
		},
		yAxis:
			chartId === "plotter"
				? { scale: true,
					axisLabel: {
						formatter: function (value, index){
							return parseFloat(value).toFixed(2);
						}
					  }, 
					  splitLine: {
						show: false
					 },
					  axisLine: {
						lineStyle: {
						  color: "black"
						}
					  }}
				: {
						type: "value",
						name: yAxis.title,
						nameLocation: "middle",
						nameGap: 60,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 12 : 16,
						},
						scale: true,
						padding: [0, 5],
						axisLabel: {
							formatter: function (value, index){
								return parseFloat(value).toPrecision(3);
							}
						  },
						  splitLine: {
							show: false
						 },
						  axisLine: {
							lineStyle: {
							  color: "black"
							}
						  }
				  },
		legend: _createChartLegend(data, chartId, yAxis),
		color: _createChartColors(data),
	};
};

export const _createChartColors = (data) => {
	let cellIdColorMap = {};
	data.forEach((element) => {
		if (element.cell_id in cellIdColorMap) {
			cellIdColorMap[element.cell_id]++;
		} else {
			cellIdColorMap[element.cell_id] = 1;
		}
	});
	let colorLen = colorTransitions.length;
	let colorArray = [];
	let i = 0;
	for (const [key, value] of Object.entries(cellIdColorMap)) {
		let gradient = new Gradient()
			.setColorGradient(...colorTransitions[i % colorLen])
			.setMidpoint(value)
			.getColors();
		i++;
		colorArray = colorArray.concat(gradient);
	}
	return colorArray;
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
		case "capacityRetention":
			result = {
				endpoint: `/echarts/capacityRetention`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "capacity_retention",
					title: "Disharge Capacity Retention (%)",
				},
				chartTitle: "Capacity Retention vs. Cycle Index",
				chartId: "capacityRetention",
				code: sourceCode.capacityRetention,
			};
			break;
		case "capacity":
			result = {
				endpoint: `/echarts/capacity`,
				xAxis: {
				mapToId: "cycle_index",
				title: "Cycle Index",
				},
				yAxis: {
				mapToId: "value",
				title: "Specific Capacity (mAh/g)",
				},
				chartTitle: "Specific Capacity  vs. Cycle Index",
				chartId: "capacity",
				code: sourceCode.capacity,
			};
			break;
		case "coulombicEfficiency":
			result = {
				endpoint: `/echarts/coulombicEfficiency`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "value",
					title: "Coulombic Efficiency (%)",
				},
				chartTitle: "Coulombic Efficiency vs Cyle Index",
				chartId: "coulombicEfficiency",
				code: sourceCode.coulombicEfficiency,
			};
			break;
		case "galvanostaticPlot":
			result = {
				endpoint: `/echarts/galvanostaticPlot`,
				xAxis: {
					mapToId: "specific_capacity",
					title: "Specific Capacity (mAh/g)",
				},
				yAxis: {
					mapToId: "v",
					title: "Voltage (V)",
				},
				chartTitle: "Voltage vs Specific Capacity ",
				chartId: "galvanostaticPlot",
				code: sourceCode.galvanostaticPlot,
			};
			break;
		case "voltageTime":
			result = {
				endpoint: `/echarts/voltageTime`,
				xAxis: {
					mapToId: "test_time",
					title: "Time (s)",
				},
				yAxis: {
					mapToId: "voltage",
					title: "Voltage (V)",
				},
				chartTitle: "Voltage vs Time",
				chartId: "voltageTime",
				code: sourceCode.voltageTime,
			};
			break;
		case "currentTime":
			result = {
				endpoint: `/echarts/currentTime`,
				xAxis: {
					mapToId: "test_time",
					title: "Time (s)",
				},
				yAxis: {
					mapToId: "current",
					title: "Current (A)",
				},
				chartTitle: "Current vs Time",
				chartId: "currentTime",
				code: sourceCode.currentTime,
			};
			break;
		case "energyDensity":
			result = {
				endpoint: `/echarts/energyDensity`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "energy_density",
					title: "Energy Density (Wh/Kg)",
				},
				chartTitle: "Energy Density vs Cyle Index",
				chartId: "energyDensity",
				code: sourceCode.energyDensity,
			};
			break;
		case "differentialCapacity":
			result = {
				endpoint: `/echarts/differentialCapacity`,
				xAxis: {
					mapToId: "voltage",
					title: "Voltage (V)",
				},
				yAxis: {
					mapToId: "dq_dv",
					title: "dQ/dV",
				},
				chartTitle: "dQ/dV vs Voltage",
				chartId: "differentialCapacity",
				code: sourceCode.differentialCapacity,
			};
			break;
		case "operatingPotential":
			result = {
				endpoint: `/echarts/operatingPotential`,
				xAxis: {
					mapToId: "cycle_index",
					title: "Cycle Index",
				},
				yAxis: {
					mapToId: "value",
					title: "Operating Potential",
				},
				chartTitle: "Operating Potential vs Cycle Index",
				chartId: "operatingPotential",
				code: sourceCode.operatingPotentialChart,
			};
			break;
		default:
			// for showing chart on plotter page
			return JSON.parse(chartName);
	}
	return result;
};
