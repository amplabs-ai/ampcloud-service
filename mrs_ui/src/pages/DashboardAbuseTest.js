import React, { useState, useRef, useEffect, useCallback } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import { Result, Button, Alert, PageHeader } from "antd";
import sourceCode from "../chartConfig/chartSourceCode";
import axios from "axios";
import ViewCodeModal from "../components/ViewCodeModal";
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../chartConfig/initialConfigs";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { enterFullscreenOption, exitFullscreenOption } from "../chartConfig/chartFullScreenOption";
import { audit } from "../auditAction/audit";
import ShareButton from "../components/ShareButton";
import { useAuth0 } from "@auth0/auth0-react";
import { useAccessToken } from "../context/AccessTokenContext";

const DashboardAbuseTest = () => {
	const screen1 = useFullScreenHandle();
	const screen2 = useFullScreenHandle();
	const screen3 = useFullScreenHandle();

	const [noDataFound, setNoDataFound] = useState(false);
	const [internalServerError, setInternalServerError] = useState("");
	const [searchParams, setSearchParams] = useState("");
	const [codeContent, setCodeContent] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [chartLoadingError, setChartLoadingError] = useState({
		forceAndDisplacementChart: false,
		testTempraturesChart: false,
		voltageChart: false,
	});
	const [disableSelection, setDisableSelection] = useState(true);
	const [chartData, setChartData] = useState({});
	const [chartsLoaded, setChartsLoaded] = useState({
		forceAndDisplacement: false,
		testTempratures: false,
		voltage: false,
	});
	const [sampleFromFilter, setsampleFromFilter] = useState("");
	const [shareDisabled, setShareDisabled] = useState(true);

	const forceAndDisplacementChart = useRef();
	const testTempraturesChart = useRef();
	const voltageChart = useRef();
	const dashboardRef = useRef(null);

	const { accessToken } = useAccessToken();

	useEffect(() => {
		let check = true;
		Object.values(chartsLoaded).forEach((c) => {
			if (!c) {
				check = false;
			}
		});
		if (check) {
			setShareDisabled(false);
		}
	}, [chartsLoaded]);

	useEffect(() => {
		forceAndDisplacementChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, forceAndDisplacement: true }));
		});
		testTempraturesChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, testTempratures: true }));
		});
		voltageChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, voltage: true }));
		});

		// for auditing
		forceAndDisplacementChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`abuse_dash_chart_forceAndDisplacement_dataZoom`, accessToken);
		});
		testTempraturesChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`abuse_dash_chart_testTempratures_dataZoom`, accessToken);
		});
		voltageChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`abuse_dash_chart_voltage_dataZoom`, accessToken);
		});
	}, []);

	const reportChange = useCallback(
		(state, handle) => {
			console.log("fullscreen changed", state);
			let chartName = handle.node.current.children[0].dataset.id;
			console.log("chartName", chartName);
			switch (chartName) {
				case "forceAndDisplacementChart":
					if (state) {
						forceAndDisplacementChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						forceAndDisplacementChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						forceAndDisplacementChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						forceAndDisplacementChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						forceAndDisplacementChart.current.ele.style.marginTop = "0%";
						forceAndDisplacementChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				case "testTempraturesChart":
					if (state) {
						testTempraturesChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						testTempraturesChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						testTempraturesChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						testTempraturesChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						testTempraturesChart.current.ele.style.marginTop = "0%";
						testTempraturesChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				case "voltageChart":
					if (state) {
						voltageChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						voltageChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						voltageChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						voltageChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						voltageChart.current.ele.style.marginTop = "0%";
						voltageChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				default:
					break;
			}
		},
		[screen1, screen2, screen3]
	);

	const internalServerErrorFound = (errStatus) => {
		setInternalServerError(errStatus);
	};

	const _getParams = (cellIds, sample) => {
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("sample", sample);
		setsampleFromFilter(sample);
		setSearchParams(params.toString());
		return params;
	};

	const handleFilterChange = (cellIds, sample) => {
		console.log("handleFilterChange", cellIds, sample);
		if (!cellIds.length) {
			setNoDataFound(true);
			return;
		}
		let request = {
			params: _getParams(cellIds, sample),
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};
		fetchData(request, "forceAndDisplacement");
		fetchData(request, "testTempratures");
		fetchData(request, "voltage");
		return true;
	};

	const showChartLoadingError = (chartRef, show) => {
		setChartLoadingError((prevState) => {
			return { ...prevState, [chartRef]: show };
		});
	};

	const _createChartDataSeries = (data, xAxis, yAxis, chartId) => {
		let x = [];
		data.forEach((d) => {
			x.push({
				type: chartId === "testTempratures" ? "line" : "scatter",
				name: d.id,
				showSymbol: false,
				datasetId: d.id,
				encode: {
					x: xAxis,
					y: yAxis,
				},
			});
		});
		console.log("_createChartDataSeries", x);
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
				chartId === "testTempratures"
					? "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
					: "pin",
			pageTextStyle: {
				overflow: "truncate",
			},
			// backgroundColor: "#FFFFFF",
			textStyle: {
				fontSize: window.screen.width < 600 ? 12 : 16,
			},
		};
	};

	const formatCode = (code) => {
		setCodeContent(code);
		setModalVisible(true);
	};
	const fetchData = (request, chartType) => {
		let endpoint, ref, xAxis, yAxis, chartTitle, chartId, code;
		switch (chartType) {
			case "forceAndDisplacement":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/forceAndDisplacement`,
					forceAndDisplacementChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Force (N) / Displacement",
					},
					"Force and Displacement - Abuse Force and Displacement",
					"forceAndDisplacement",
					sourceCode.forceAndDisplacementChart,
				];
				break;
			case "testTempratures":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/testTempratures`,
					testTempraturesChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Temperature (T)",
					},
					"Abuse Test Temperatures",
					"testTempratures",
					sourceCode.testTempraturesChart,
				];
				break;
			case "voltage":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/voltage`,
					voltageChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Voltage (V)",
					},
					"Voltage Abuse Voltage",
					"voltage",
					sourceCode.voltageChart,
				];
				break;
			default:
				break;
		}
		showChartLoadingError(ref.current.ele, false); // remove previous error
		ref.current.getEchartsInstance().showLoading();
		axios
			.get(endpoint, request)
			.then((result) => {
				setDisableSelection(false);
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
							fontWeight: "normal",
							overflow: "break",
							width: window.screen.width < 600 ? 300 : 500,
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
							fontSize: window.screen.width < 600 ? 12 : 16,
							padding: [5, 0],
						},
						scale: true,
					},
					yAxis: {
						type: "value",
						name: yAxis.title,
						nameLocation: "middle",
						nameGap: 30,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 12 : 16,
						},
						scale: true,
						padding: [0, 5],
					},
					grid: {
						left: window.screen.width < 600 ? "8%" : "7%",
					},
					legend: _createChartLegend(result.records[0], chartId),
					toolbox: {
						zlevel: 30,
						top: window.screen.width < 600 ? "8%" : "5%",
						emphasis: {
							iconStyle: {
								textPosition: "top",
								color: "#FFFFFF",
								textBackgroundColor: "#000000",
								textPadding: 5,
								opacity: 1,
							},
						},
						feature: {
							myTool: {
								show: true,
								title: "View Code",
								icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
								onclick: function () {
									audit(`abuse_dash_chart_${chartType}_viewcode`, accessToken);
									formatCode(code);
								},
							},
							saveAsImage: {
								show: "true",
							},
							myTool2: {
								show: true,
								title: "Enter Fullscreen",
								icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
								onclick: function () {
									audit(`abuse_dash_chart_${chartType}_fullscreen`, accessToken);
									switch (chartType) {
										case "testTempratures":
											screen1.enter();
											break;
										case "forceAndDisplacement":
											screen2.enter();
											break;
										case "voltage":
											screen3.enter();
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
									switch (chartType) {
										case "testTempratures":
											screen1.exit();
											break;
										case "forceAndDisplacement":
											screen2.exit();
											break;
										case "voltage":
											screen3.exit();
											break;
										default:
											break;
									}
								},
							},
							dataZoom: {
								// yAxisIndex: "none",
								brushStyle: {
									borderWidth: 1,
									borderColor: "#000000",
								},
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
				setDisableSelection(false);
				ref.current.getEchartsInstance().showLoading();
				showChartLoadingError(ref.current.ele, true);
			});
	};

	const handleCellIdChange = async (selectedCellIds) => {
		let params = new URLSearchParams();
		selectedCellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("sample", sampleFromFilter);
		setSearchParams(params.toString());
		setDisableSelection(true);
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
		let promise1 = new Promise((resolve) =>
			resolve(_renderChartsAfterFilter(filteredChartData, "forceAndDisplacement"))
		);
		let promise2 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "testTempratures")));
		let promise3 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "voltage")));
		let responses = await Promise.all([promise1, promise2, promise3]);
		for (let response of responses) {
			console.log("promise all", response);
			setDisableSelection(false);
		}
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
			case "forceAndDisplacement":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/forceAndDisplacement`,
					forceAndDisplacementChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Force (N) / Displacement",
					},
					"Force and Displacement - Abuse Force and Displacement",
					"forceAndDisplacement",
					sourceCode.forceAndDisplacementChart,
				];
				break;
			case "testTempratures":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/testTempratures`,
					testTempraturesChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Temperature (T)",
					},
					"Abuse Test Temperatures",
					"testTempratures",
					sourceCode.testTempraturesChart,
				];
				break;
			case "voltage":
				[endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
					`/echarts/voltage`,
					voltageChart,
					{
						mapToId: "test_time",
						title: "Time (s)",
					},
					{
						mapToId: "value",
						title: "Voltage (V)",
					},
					"Voltage Abuse Voltage",
					"voltage",
					sourceCode.voltageChart,
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
					fontWeight: "normal",
					overflow: "break",
					width: window.screen.width < 600 ? 300 : 500,
				},
			},
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
				nameGap: 30,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 12 : 16,
				},
				scale: true,
				padding: [0, 5],
			},
			grid: {
				left: window.screen.width < 600 ? "8%" : "7%",
			},
			toolbox: {
				zlevel: 30,
				top: window.screen.width < 600 ? "8%" : "5%",
				emphasis: {
					iconStyle: {
						textPosition: "top",
						color: "#FFFFFF",
						textBackgroundColor: "#000000",
						textPadding: 5,
						opacity: 1,
					},
				},
				feature: {
					myTool: {
						show: true,
						title: "View Code",
						icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
						onclick: function () {
							audit(`abuse_dash_chart_${chartType}_viewcode`, accessToken);
							formatCode(code);
						},
					},
					saveAsImage: {
						show: "true",
					},
					myTool2: {
						show: true,
						title: "Enter Fullscreen",
						icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
						onclick: function () {
							audit(`abuse_dash_chart_${chartType}_fullscreen`, accessToken);
							switch (chartType) {
								case "forceAndDisplacement":
									screen1.enter();
									break;
								case "testTempratures":
									screen2.enter();
									break;
								case "voltage":
									screen3.enter();
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
							switch (chartType) {
								case "forceAndDisplacement":
									screen1.exit();
									break;
								case "testTempratures":
									screen2.exit();
									break;
								case "voltage":
									screen3.exit();
									break;
								default:
									break;
							}
						},
					},
					dataZoom: {
						// yAxisIndex: "none",
						brushStyle: {
							borderWidth: 1,
							borderColor: "#000000",
						},
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
					<PageHeader
						className="site-page-header mb-1 shadow"
						style={{ marginTop: "0.8em" }}
						ghost={true}
						title="Abuse Test Dashboard"
						extra={<ShareButton ref={dashboardRef} shareDisabled={shareDisabled} dashboard="abuse" />}
					></PageHeader>
					<DashboardFilterBar
						onCellIdChange={handleCellIdChange}
						testType="abuseTest"
						onFilterChange={handleFilterChange}
						internalServerErrorFound={internalServerErrorFound}
						disableSelection={disableSelection}
					/>
					<ViewCodeModal
						code={codeContent}
						modalVisible={modalVisible}
						setModalVisible={setModalVisible}
						searchParams={searchParams}
					/>
					<div ref={dashboardRef}>
						<div className="row pb-5">
							<div className="col-md-12 mt-2">
								<FullScreen handle={screen1} onChange={reportChange}>
									<div data-id="testTempraturesChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.testTempraturesChart && <Alert message="Error" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={testTempraturesChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
							<div className="col-md-6 mt-2">
								<FullScreen handle={screen2} onChange={reportChange}>
									<div
										data-id="forceAndDisplacementChart"
										className="card shadow"
										style={{ height: "100%", width: "100%" }}
									>
										<div className="card-body">
											{chartLoadingError.forceAndDisplacementChart && <Alert message="Error" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={forceAndDisplacementChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
							<div className="col-md-6 mt-2">
								<FullScreen handle={screen3} onChange={reportChange}>
									<div data-id="voltageChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.voltageChart && <Alert message="Error" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={voltageChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardAbuseTest;
