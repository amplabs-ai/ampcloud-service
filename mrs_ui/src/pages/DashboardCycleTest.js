import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import ReactEcharts from "echarts-for-react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import ViewCodeModal from "../components/ViewCodeModal";
import initialChartOptions from "../chartConfig/initialConfigs";
import sourceCode from "../chartConfig/chartSourceCode";
import { Result, Button, Alert, Typography, Modal, Spin } from "antd";

import { FullScreen, useFullScreenHandle } from "react-full-screen";

import WorkerBuilder from "../worker/woker-builder";
import Worker from "../worker/fibo.worker";
const instance = new WorkerBuilder(Worker);

const { Title } = Typography;

const DashboardCycleTest = () => {
	const screen1 = useFullScreenHandle();
	const screen2 = useFullScreenHandle();
	const screen3 = useFullScreenHandle();
	const screen4 = useFullScreenHandle();

	// const reportChange = useCallback(
	// 	(state, handle) => {
	// 		// if (handle === screen1) {
	// 		// 	console.log("Screen 1 went to", state, handle);
	// 		// }
	// 		// if (handle === screen2) {
	// 		// 	console.log("Screen 2 went to", state, handle);
	// 		// }
	// 	},
	// 	[screen1]
	// );

	useEffect(() => {
		// instance.onmessage = (message) => {
		// 	if (message) {
		// 		console.log("Message from worker", message.data);
		// 	}
		// };

		// window.addEventListener("load", function () {
		// 	cycleIndexChart.current.getEchartsInstance().resize();
		// 	timeSeriesChart.current.getEchartsInstance().resize();
		// 	efficiencyChart.current.getEchartsInstance().resize();
		// 	cycleQtyByStepChart.current.getEchartsInstance().resize();
		// 	console.log("asdw", window.screen.width);
		// 	if (window.screen.width < 1200) {
		// 		cycleIndexChart.current.getEchartsInstance().setOption({
		// 			legend: {
		// 				bottom: "0",
		// 				right: "auto",
		// 				top: "auto",
		// 				orient: "horizontal",
		// 			},
		// 		});
		// 	}
		// });
	}, []);

	const cycleIndexChart = useRef();
	const timeSeriesChart = useRef();
	const efficiencyChart = useRef();
	const cycleQtyByStepChart = useRef();

	const [searchParams, setSearchParams] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const [noDataFound, setNoDataFound] = useState(false);
	const [chartLoadingError, setChartLoadingError] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
	});
	const [chartData, setChartData] = useState({});
	const [internalServerError, setInternalServerError] = useState("");
	const [disableSelection, setDisableSelection] = useState(true);

	const internalServerErrorFound = (errStatus) => {
		setInternalServerError(errStatus);
	};

	const handleFilterChange = (cellIds, step) => {
		console.log("cellIds->filterbar", cellIds);
		if (!cellIds.length) {
			setNoDataFound(true);
			return;
		}
		console.log("cellIds", cellIds);
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("step", step);
		console.log("params", params);
		let request = {
			params: params,
		};
		setSearchParams(params.toString());
		fetchData(request, "cycleIndex");
		fetchData(request, "timeSeries");
		fetchData(request, "efficiency");
		fetchData(request, "cycleQtyByStep");
		return true;
	};

	const fetchData = (request, chartType) => {
		let endpoint, ref, xAxis, yAxis, chartTitle, chartId, code;
		switch (chartType) {
			case "cycleIndex":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/energyAndCapacityDecay`,
					cycleIndexChart,
					{
						mapToId: "cycle_index",
						title: "Cycle Index",
					},
					{
						mapToId: "value",
						title: "Ah/Wh",
					},
					"Cycle Index Data - Energy and Capacity Decay",
					"cycleIndex",
					sourceCode.cycleIndexChart,
				];
				break;
			case "timeSeries":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/energyAndCapacityDecay`,
					timeSeriesChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Wh/Ah",
					},
					"Time Series Data - Energy and Capacity Decay",
					"timeSeries",
					sourceCode.timeSeriesChart,
				];
				break;
			case "efficiency":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/efficiency`,
					efficiencyChart,
					{
						mapToId: "cycle_index",
						title: "Cycle Index",
					},
					{
						mapToId: "value",
						title: "Enery and Coulombic Efficiencies",
					},
					"Efficiencies",
					"efficiency",
					sourceCode.efficiencyChart,
				];
				break;
			case "cycleQtyByStep":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/cycleQuantitiesByStep`,
					cycleQtyByStepChart,
					{
						mapToId: "cycle_time",
						title: "Cycle Time (s)",
					},
					{
						mapToId: "v",
						title: "Voltage (V)",
					},
					"Cycle Quantities by Step",
					"cycleQtyByStep",
					sourceCode.cycleQtyByStepChart,
				];
				break;
			default:
				break;
		}
		showChartLoadingError(chartType, false); // removes previous error
		ref.current.getEchartsInstance().showLoading();
		axios
			.get(endpoint, request)
			.then((result) => {
				if (chartType === "cycleQtyByStep") {
					setDisableSelection(false);
				}
				if (typeof result.data == "string") {
					result = JSON.parse(result.data.replace(/\bNaN\b/g, "null"));
				} else {
					result = result.data;
				}
				setChartData((prev) => {
					return { ...prev, [chartId]: result.records[0] };
				});
				ref.current.getEchartsInstance().dispatchAction({
					type: "restore",
				});
				ref.current.getEchartsInstance().setOption({
					title: {
						show: true,
						id: chartId,
						text: chartTitle,
						textStyle: {
							fontSize: window.screen.width < 600 ? 15 : 20,
							overflow: "break",
							width: window.screen.width < 600 ? 300 : "auto",
						},
					},
					dataset: result.records[0],
					series: _createChartDataSeries(
						result.records[0], // replace with actual data
						xAxis.mapToId,
						yAxis.mapToId,
						chartId
					),
					xAxis: {
						type: "value",
						name: xAxis.title,
						nameLocation: "middle",
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 14 : 18,
						},
					},
					yAxis: {
						type: "value",
						name: yAxis.title,
						nameLocation: "middle",
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 14 : 18,
						},
					},
					legend: _createChartLegend(result.records[0], chartId),
					toolbox: {
						top: window.screen.width < 600 ? "6%" : "3%",
						feature: {
							myTool: {
								show: true,
								title: "View Code",
								icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
								onclick: function () {
									formatCode(code);
								},
							},
							myTool2: {
								show: true,
								title: "Enter Fullscreen",
								icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
								onclick: function () {
									ref.current.getEchartsInstance().setOption({
										grid: {
											left: window.screen.width < 600 ? "8%" : "5%",
											right: window.screen.width < 600 ? "5%" : "25%",
											bottom: window.screen.width < 600 ? "16%" : "5%",
										},
									});
									ref.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
									ref.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
									switch (chartType) {
										case "cycleIndex":
											screen1.enter();
											break;
										case "timeSeries":
											screen2.enter();
											break;
										case "efficiency":
											screen3.enter();
											break;
										case "cycleQtyByStep":
											screen4.enter();
											break;
										default:
											break;
									}
								},
							},
							myTool3: {
								show: true,
								title: "Exit Fullscreen",
								icon: `path://M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
								S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
								c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z,M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
								c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
								s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z`,
								onclick: function () {
									ref.current.getEchartsInstance().setOption({
										grid: {
											left: window.screen.width < 600 ? "8%" : "5%",
											right: window.screen.width < 600 ? "5%" : "40%",
											bottom: window.screen.width < 600 ? "16%" : "11%",
											containLabel: true,
										},
									});
									ref.current.ele.style.marginTop = "0%";
									ref.current.ele.style.height = window.screen.width < 600 ? "15rem" : "18rem";
									switch (chartType) {
										case "cycleIndex":
											screen1.exit();
											break;
										case "timeSeries":
											screen2.exit();
											break;
										case "efficiency":
											screen3.exit();
											break;
										case "cycleQtyByStep":
											screen4.exit();
											break;
										default:
											break;
									}
								},
							},
							saveAsImage: {
								show: "true",
							},
							dataZoom: {
								yAxisIndex: "none",
							},
						},
					},
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
				ref.current.getEchartsInstance().hideLoading();
			})
			.catch((err) => {
				console.log("err", err);
				ref.current.getEchartsInstance().hideLoading();
				showChartLoadingError(chartType, true);
			});
	};

	const formatCode = (code) => {
		setCodeContent(code);
		setModalVisible(true);
	};

	const showChartLoadingError = (chartType, show) => {
		console.log("chartType", chartType);
		setChartLoadingError((prev) => {
			console.log({ ...prev, [chartType]: show });
			return { ...prev, [chartType]: show };
		});
	};

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
			orient: window.screen.width < 600 ? "horizontal" : "vertical",
			left: "right",
			top: window.screen.width < 600 ? "auto" : "15%",
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
		// return {
		// 	data: x,
		// 	type: "scroll",
		// 	orient: "horizontal",
		// 	left: "0",
		// 	bottom: "0",
		// 	icon:
		// 		chartId === "timeSeries"
		// 			? "pin"
		// 			: "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z",
		// 	pageTextStyle: {
		// 		overflow: "truncate",
		// 	},
		// 	backgroundColor: "#FFFFFF",
		// };
	};

	const handleCellIdChange = async (selectedCellIds) => {
		// instance.postMessage({
		// 	chartData,
		// 	selectedCellIds,
		// });
		// console.log("navigator.hardwareConcurrency", navigator.hardwareConcurrency);

		setDisableSelection(true);
		console.log("selectedCellIds", selectedCellIds);
		console.log("chartData", chartData);

		let filteredChartData = {};
		for (const chartName in chartData) {
			if (Object.hasOwnProperty.call(chartData, chartName)) {
				let chart = chartData[chartName];
				let filteredChart = chart.filter((c) => {
					return _checkCellIdInSeries(c, selectedCellIds);
				});
				filteredChartData = { ...filteredChartData, [chartName]: filteredChart };
			}
		}

		console.log("filteredChartData", filteredChartData);
		let promise1 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "cycleIndex")));
		let promise2 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "timeSeries")));
		let promise3 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "efficiency")));
		let promise4 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "cycleQtyByStep")));
		let responses = await Promise.all([promise1, promise2, promise3, promise4]);
		for (let response of responses) {
			console.log("promise all", response);
			setDisableSelection(false);
		}
		// _renderChartsAfterFilter(filteredChartData, "cycleQtyByStep");
		// _renderChartsAfterFilter(filteredChartData, "cycleIndex");
		// _renderChartsAfterFilter(filteredChartData, "timeSeries");
		// _renderChartsAfterFilter(filteredChartData, "efficiency");
	};

	const _checkCellIdInSeries = (c, selectedCellIds) => {
		let flag = false;
		for (let i = 0; i < selectedCellIds.length; i++) {
			flag = c.id.includes(selectedCellIds[i].cell_id);
			if (flag) {
				return true;
			}
		}
		return flag;
	};

	const _renderChartsAfterFilter = (filteredChartData, chartType) => {
		let endpoint, ref, xAxis, yAxis, chartTitle, chartId, code;
		switch (chartType) {
			case "cycleIndex":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/energyAndCapacityDecay`,
					cycleIndexChart,
					{
						mapToId: "cycle_index",
						title: "Cycle Index",
					},
					{
						mapToId: "value",
						title: "Ah/Wh",
					},
					"Cycle Index Data - Energy and Capacity Decay",
					"cycleIndex",
					sourceCode.cycleIndexChart,
				];
				break;
			case "timeSeries":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/energyAndCapacityDecay`,
					timeSeriesChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Wh/Ah",
					},
					"Time Series Data - Energy and Capacity Decay",
					"timeSeries",
					sourceCode.timeSeriesChart,
				];
				break;
			case "efficiency":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/efficiency`,
					efficiencyChart,
					{
						mapToId: "cycle_index",
						title: "Cycle Index",
					},
					{
						mapToId: "value",
						title: "Enery and Coulombic Efficiencies",
					},
					"Efficiencies",
					"efficiency",
					sourceCode.efficiencyChart,
				];
				break;
			case "cycleQtyByStep":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/cycleQuantitiesByStep`,
					cycleQtyByStepChart,
					{
						mapToId: "cycle_time",
						title: "Cycle Time (s)",
					},
					{
						mapToId: "v",
						title: "Voltage (V)",
					},
					"Cycle Quantities by Step",
					"cycleQtyByStep",
					sourceCode.cycleQtyByStepChart,
				];
				break;
			default:
				break;
		}
		ref.current.getEchartsInstance().dispatchAction({
			type: "restore",
		});
		ref.current.getEchartsInstance().setOption({
			title: {
				show: true,
				id: chartId,
				text: chartTitle,
				textStyle: {
					fontSize: window.screen.width < 600 ? 15 : 20,
					overflow: "break",
					width: window.screen.width < 600 ? 300 : "auto",
				},
			},
			xAxis: {
				type: "value",
				name: xAxis.title,
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 14 : 18,
				},
			},
			yAxis: {
				type: "value",
				name: yAxis.title,
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 14 : 18,
				},
			},
			toolbox: {
				top: window.screen.width < 600 ? "6%" : "3%",
				feature: {
					myTool: {
						show: true,
						title: "View Code",
						icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
						onclick: function () {
							formatCode(code);
						},
					},
					myTool2: {
						show: true,
						title: "Enter Fullscreen",
						icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
						onclick: function () {
							ref.current.getEchartsInstance().setOption({
								grid: {
									left: window.screen.width < 600 ? "8%" : "5%",
									right: window.screen.width < 600 ? "5%" : "25%",
									bottom: window.screen.width < 600 ? "16%" : "5%",
								},
							});
							ref.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
							ref.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
							switch (chartType) {
								case "cycleIndex":
									screen1.enter();
									break;
								case "timeSeries":
									screen2.enter();
									break;
								case "efficiency":
									screen3.enter();
									break;
								case "cycleQtyByStep":
									screen4.enter();
									break;
								default:
									break;
							}
						},
					},
					myTool3: {
						show: true,
						title: "Exit Fullscreen",
						icon: `path://M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
						S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
						c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z,M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
						c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
						s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z`,
						onclick: function () {
							ref.current.getEchartsInstance().setOption({
								grid: {
									left: window.screen.width < 600 ? "8%" : "5%",
									right: window.screen.width < 600 ? "5%" : "40%",
									bottom: window.screen.width < 600 ? "16%" : "11%",
									containLabel: true,
								},
							});
							ref.current.ele.style.marginTop = "0%";
							ref.current.ele.style.height = window.screen.width < 600 ? "15rem" : "18rem";
							switch (chartType) {
								case "cycleIndex":
									screen1.exit();
									break;
								case "timeSeries":
									screen2.exit();
									break;
								case "efficiency":
									screen3.exit();
									break;
								case "cycleQtyByStep":
									screen4.exit();
									break;
								default:
									break;
							}
						},
					},
					saveAsImage: {
						show: "true",
					},
					dataZoom: {
						yAxisIndex: "none",
					},
				},
			},
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

			dataset: filteredChartData[chartId],
			series: _createChartDataSeries(
				filteredChartData[chartId], // replace with actual data
				xAxis.mapToId,
				yAxis.mapToId,
				chartId
			),
			legend: _createChartLegend(filteredChartData[chartId], chartId),
		});
	};

	return (
		<div>
			{noDataFound ? (
				<Result
					title="No Data was found! Please upload files."
					extra={
						<Button type="primary" key="console" href="/upload">
							Go to Upload
						</Button>
					}
				/>
			) : internalServerError ? (
				<Result
					status="500"
					title="500"
					subTitle="Sorry, something went wrong."
					extra={
						<Button type="primary" href="/dashboard">
							Reload
						</Button>
					}
				/>
			) : (
				<div style={{ margin: "0.6rem" }}>
					<Title level={3}>Cycle Test Dashboard</Title>
					<DashboardFilterBar
						testType="cycleTest"
						onFilterChange={handleFilterChange}
						onCellIdChange={handleCellIdChange}
						internalServerErrorFound={internalServerErrorFound}
						disableSelection={disableSelection}
					/>
					<ViewCodeModal
						code={codeContent}
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						searchParams={searchParams}
					/>
					<div className="row pb-5">
						<div className="col-md-6 mt-2">
							<FullScreen handle={screen1}>
								<div className="card shadow" style={{ height: "100%", width: "100%" }}>
									<div className="card-body">
										{chartLoadingError.cycleIndex && <Alert message="Error loading chart!" type="error" showIcon />}
										<ReactEcharts
											style={{
												width: "100%",
												height: window.screen.width < 600 ? "15rem" : "18rem",
											}}
											lazyUpdate={true}
											showLoading
											ref={cycleIndexChart}
											option={initialChartOptions}
										/>
									</div>
								</div>
							</FullScreen>
						</div>
						<div className="col-md-6 mt-2">
							<FullScreen handle={screen2}>
								<div className="card shadow" style={{ height: "100%", width: "100%" }}>
									<div className="card-body">
										{chartLoadingError.timeSeries && <Alert message="Error loading chart!" type="error" showIcon />}
										<ReactEcharts
											style={{
												width: "100%",
												height: window.screen.width < 600 ? "15rem" : "18rem",
											}}
											lazyUpdate={true}
											showLoading
											ref={timeSeriesChart}
											option={initialChartOptions}
										/>
									</div>
								</div>
							</FullScreen>
						</div>
						<div className="col-md-6 mt-2">
							<FullScreen handle={screen3}>
								<div className="card shadow" style={{ height: "100%", width: "100%" }}>
									<div className="card-body">
										{chartLoadingError.efficiency && <Alert message="Error loading chart!" type="error" showIcon />}
										<ReactEcharts
											style={{
												width: "100%",
												height: window.screen.width < 600 ? "15rem" : "18rem",
											}}
											lazyUpdate={true}
											showLoading
											ref={efficiencyChart}
											option={initialChartOptions}
										/>
									</div>
								</div>
							</FullScreen>
						</div>
						<div className="col-md-6 mt-2">
							<FullScreen handle={screen4}>
								<div className="card shadow" style={{ height: "100%", width: "100%" }}>
									<div className="card-body">
										{chartLoadingError.cycleQtyByStep && <Alert message="Error loading chart!" type="error" showIcon />}
										<ReactEcharts
											style={{
												width: "100%",
												height: window.screen.width < 600 ? "15rem" : "18rem",
											}}
											lazyUpdate={true}
											showLoading
											ref={cycleQtyByStepChart}
											option={initialChartOptions}
										/>
									</div>
								</div>
							</FullScreen>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardCycleTest;
