import React, { useState, useRef, useEffect } from "react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import { Result, Button, Alert, Typography, Badge } from "antd";
import sourceCode from "../chartConfig/chartSourceCode";
import axios from "axios";
import ViewCodeModal from "../components/ViewCodeModal";
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../chartConfig/initialConfigs";
import { FaCloudUploadAlt } from "react-icons/fa";

const DashboardAbuseTest = () => {
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

	const forceAndDisplacementChart = useRef();
	const testTempraturesChart = useRef();
	const voltageChart = useRef();

	const { Title } = Typography;

	useEffect(() => {
		window.addEventListener("resize", function () {
			forceAndDisplacementChart.current.resize();
			testTempraturesChart.current.resize();
			voltageChart.current.resize();
		});
	}, []);

	const internalServerErrorFound = (errStatus) => {
		setInternalServerError(errStatus);
	};

	const _getParams = (cellIds, sample) => {
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("sample", sample);
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
			left: "0",
			bottom: "0",
			icon:
				chartId === "testTempratures"
					? "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
					: "pin",
			pageTextStyle: {
				overflow: "truncate",
			},
			backgroundColor: "#FFFFFF",
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
							fontSize: 14,
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
						nameGap: 20,
					},
					yAxis: {
						type: "value",
						name: yAxis.title,
						nameLocation: "middle",
						nameGap: 30,
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
				setDisableSelection(false);
				ref.current.getEchartsInstance().showLoading();
				showChartLoadingError(ref.current.ele, true);
			});
	};

	const handleCellIdChange = async (selectedCellIds) => {
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
					<Title level={3}>Abuse Test Dashboard</Title>
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

					<div className="row pb-5">
						<div className="col-md-12 mt-2">
							<div className="card shadow-sm">
								<div className="card-body">
									{chartLoadingError.testTempraturesChart && <Alert message="Error" type="error" showIcon />}
									<ReactEcharts showLoading ref={testTempraturesChart} option={initialChartOptions} />
								</div>
							</div>
						</div>
						<div className="col-md-6 mt-2">
							<div className="card shadow-sm">
								<div className="card-body">
									{chartLoadingError.forceAndDisplacementChart && <Alert message="Error" type="error" showIcon />}
									<ReactEcharts showLoading ref={forceAndDisplacementChart} option={initialChartOptions} />
								</div>
							</div>
						</div>
						<div className="col-md-6 mt-2">
							<div className="card shadow-sm">
								<div className="card-body">
									{chartLoadingError.voltageChart && <Alert message="Error" type="error" showIcon />}
									<ReactEcharts showLoading ref={voltageChart} option={initialChartOptions} />
								</div>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardAbuseTest;
