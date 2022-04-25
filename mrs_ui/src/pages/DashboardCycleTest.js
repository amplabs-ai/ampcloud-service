import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactEcharts from "echarts-for-react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import ViewCodeModal from "../components/ViewCodeModal";
import initialChartOptions from "../chartConfig/initialConfigs";
import sourceCode from "../chartConfig/chartSourceCode";
import { Result, Button, Alert, Typography, Modal, Spin } from "antd";

import WorkerBuilder from "../worker/woker-builder";
import Worker from "../worker/fibo.worker";
const instance = new WorkerBuilder(Worker);

const { Title } = Typography;

const DashboardCycleTest = () => {
	useEffect(() => {
		instance.onmessage = (message) => {
			if (message) {
				console.log("Message from worker", message.data);
			}
		};

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
						title: "Volateg (V)",
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
							overflow: "breakAll",
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
							fontSize: window.screen.width < 600 ? 14 : 20,
						},
					},
					yAxis: {
						type: "value",
						name: yAxis.title,
						nameLocation: "middle",
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 14 : 20,
						},
					},
					legend: _createChartLegend(result.records[0], chartId),
					toolbox: {
						feature: {
							myTool: {
								show: true,
								title: "View Code",
								icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
								onclick: function () {
									formatCode(code);
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
						title: "Volateg (V)",
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
					fontSize: 14,
					overflow: "breakAll",
				},
			},
			animation: false,
			dataset: filteredChartData[chartId],
			series: _createChartDataSeries(
				filteredChartData[chartId], // replace with actual data
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
					fontSize: 14,
				},
			},
			yAxis: {
				type: "value",
				name: yAxis.title,
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: 14,
				},
			},
			legend: _createChartLegend(filteredChartData[chartId], chartId),
			toolbox: {
				feature: {
					myTool: {
						show: true,
						title: "View Code",
						icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
						onclick: function () {
							formatCode(code);
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
						<div className="col-md-12 mt-2">
							<div className="card shadow">
								<div className="card-body">
									{chartLoadingError.cycleIndex && <Alert message="Error loading chart!" type="error" showIcon />}
									<ReactEcharts
										style={{
											width: "100%",
											height: window.screen.width < 600 ? "18rem" : "25rem",
										}}
										lazyUpdate={true}
										showLoading
										ref={cycleIndexChart}
										option={initialChartOptions}
									/>
								</div>
							</div>
						</div>
						<div className="col-md-12 mt-2">
							<div className="card shadow">
								<div className="card-body">
									{chartLoadingError.efficiency && <Alert message="Error loading chart!" type="error" showIcon />}
									<ReactEcharts
										style={{
											width: "100%",
											height: window.screen.width < 600 ? "18rem" : "25rem",
										}}
										lazyUpdate={true}
										showLoading
										ref={efficiencyChart}
										option={initialChartOptions}
									/>
								</div>
							</div>
						</div>
						<div className="col-md-12 mt-2">
							<div className="card shadow">
								<div className="card-body">
									{chartLoadingError.timeSeries && <Alert message="Error loading chart!" type="error" showIcon />}
									<ReactEcharts
										style={{
											width: "100%",
											height: window.screen.width < 600 ? "18rem" : "25rem",
										}}
										lazyUpdate={true}
										showLoading
										ref={timeSeriesChart}
										option={initialChartOptions}
									/>
								</div>
							</div>
						</div>
						<div className="col-md-12 mt-2">
							<div className="card shadow">
								<div className="card-body">
									{chartLoadingError.cycleQtyByStep && <Alert message="Error loading chart!" type="error" showIcon />}
									<ReactEcharts
										style={{
											width: "100%",
											height: window.screen.width < 600 ? "18rem" : "25rem",
										}}
										lazyUpdate={true}
										showLoading
										ref={cycleQtyByStepChart}
										option={initialChartOptions}
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardCycleTest;
