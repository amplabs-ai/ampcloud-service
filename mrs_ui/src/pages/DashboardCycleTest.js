import React, { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
// ====== charts =======
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../chartConfig/initialConfigs";
import { enterFullscreenOption, exitFullscreenOption } from "../chartConfig/chartFullScreenOption";
import { audit } from "../auditAction/audit";
// ======= Components ==========
import DashboardFilterBar from "../components/DashboardFilterBar";
import ViewCodeModal from "../components/ViewCodeModal";
// ====== python code files ======
import sourceCode from "../chartConfig/chartSourceCode";
// ====== styling components, icons... ========
import { Result, Button, Alert, Modal, PageHeader, Card, Skeleton, message, Spin } from "antd";
import { FaLinkedin, FaEnvelope, FaLink, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { ShareAltOutlined } from "@ant-design/icons";
// ====== dependencies =======
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { toPng, toBlob } from "html-to-image";
import HelmetMetaData from "../components/HelmetMetaData";
import Cookies from "js-cookie";

import WorkerBuilder from "../worker/woker-builder";
import Worker from "../worker/fibo.worker";
import { useSearchParams } from "react-router-dom";
import Title from "antd/lib/typography/Title";
const instance = new WorkerBuilder(Worker);

const CLIENT_ID = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
const REDIRECT_URI = process.env.REACT_APP_LINKEDIN_REDIRECT_URI_DASH_CYCLE;

const DashboardCycleTest = () => {
	// =========states=========
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
	const [metaImageDash, setMetaImageDash] = useState(null);
	const [shallShowShareDashModal, setShallShowShareDashModal] = useState(false);
	const [chartsLoaded, setChartsLoaded] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
	});
	const [stepFromFilter, setStepFromFilter] = useState("");
	const [shareDisabled, setShareDisabled] = useState(true);
	const [shareLoadingMsg, setShareLoadingMsg] = useState("");

	// ======= Hooks ==========
	const screen1 = useFullScreenHandle();
	const screen2 = useFullScreenHandle();
	const screen3 = useFullScreenHandle();
	const screen4 = useFullScreenHandle();

	const [searchParamsForCode] = useSearchParams();

	useEffect(() => {
		if ([...searchParamsForCode].length) {
			let code = searchParamsForCode.get("code");
			if (code) {
				setShareLoadingMsg(
					<>
						<Title level={4}>Creating Post for you...</Title>
						<br></br>
						<Spin size="large" />
					</>
				);
				console.log("code", code);
				// send code to backend
				let shareText = `I just created a Cycle Test dashboard on AmpLabs! Check it out at https://www.amplabs.ai/dashboard/cycle-test?mail=${Cookies.get(
					"userId"
				)} #amplabs #batterytechnology #batterydata #materialsscience #researchers #voltafoundation #batterybits #batterybrunch`;
				let img = localStorage.getItem("dashImage");
				let parts = [b64toBlob(img?.split(",")[1], "image/png")];
				let file = new File(parts, "dashboard.png", {
					lastModified: new Date(0),
					type: "image/png",
				});

				const formData = new FormData();
				formData.append("code", code);
				formData.append("file", file);
				formData.append("shareText", shareText);
				formData.append("dashboard", "cycle");

				axios
					.post("/dashboard/share-linkedin", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
						},
					})
					.then((response) => {
						console.log("linkedin share success", response);
						// post shared successfully
						// get redirect url to post share and redirect
						window.open("https://www.linkedin.com/embed/feed/update/" + response.data.records.id);
						setShareLoadingMsg(
							<>
								<FaCheckCircle size={60} className="text-success" />
								<Title level={4}>Post Created successfully!</Title>
								<Title level={5}>
									Check it out at{" "}
									<a href={"https://www.linkedin.com/embed/feed/update/" + response.data.records.id}>Link</a>
								</Title>
							</>
						);
					})
					.catch((err) => {
						setShareLoadingMsg(
							<>
								<FaExclamationCircle size={60} className="text-danger" />
								<Title level={4}>"Something went wrong! Please refresh page & try again."</Title>
							</>
						);
						console.log("linkedin share failed", err);
					});
			}
		}
	}, []);

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
		cycleIndexChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, cycleIndex: true }));
		});
		timeSeriesChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, timeSeries: true }));
		});
		efficiencyChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, efficiency: true }));
		});
		cycleQtyByStepChart.current.getEchartsInstance().one("finished", () => {
			setChartsLoaded((prev) => ({ ...prev, cycleQtyByStep: true }));
		});

		// for auditing
		cycleIndexChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`cycle_dash_chart_cycleIndex_dataZoom`);
		});
		timeSeriesChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`cycle_dash_chart_timeSeries_dataZoom`);
		});
		efficiencyChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`cycle_dash_chart_efficiency_dataZoom`);
		});
		cycleQtyByStepChart.current.getEchartsInstance().on("dataZoom", () => {
			audit(`cycle_dash_chart_cycleQtyByStep_dataZoom`);
		});
	}, []);

	const reportChange = useCallback(
		(state, handle) => {
			console.log("fullscreen changed", state);
			let chartName = handle.node.current.children[0].dataset.id;
			console.log("chartName", chartName);
			switch (chartName) {
				case "cycleIndexChart":
					if (state) {
						cycleIndexChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						cycleIndexChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						cycleIndexChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						cycleIndexChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						cycleIndexChart.current.ele.style.marginTop = "0%";
						cycleIndexChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				case "timeSeriesChart":
					console.log("timeSeries");
					if (state) {
						timeSeriesChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						timeSeriesChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						timeSeriesChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						timeSeriesChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						timeSeriesChart.current.ele.style.marginTop = "0%";
						timeSeriesChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				case "efficiencyChart":
					console.log("effiency chart");
					if (state) {
						efficiencyChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						efficiencyChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						efficiencyChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						efficiencyChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						efficiencyChart.current.ele.style.marginTop = "0%";
						efficiencyChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				case "cycleQtyByStepChart":
					if (state) {
						cycleQtyByStepChart.current.getEchartsInstance().setOption(enterFullscreenOption);
						cycleQtyByStepChart.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
						cycleQtyByStepChart.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
					} else {
						cycleQtyByStepChart.current.getEchartsInstance().setOption(exitFullscreenOption);
						cycleQtyByStepChart.current.ele.style.marginTop = "0%";
						cycleQtyByStepChart.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
					}
					break;
				default:
					break;
			}
		},
		[screen1, screen2, screen3, screen4]
	);

	// ======== Refs ========
	const cycleIndexChart = useRef();
	const timeSeriesChart = useRef();
	const efficiencyChart = useRef();
	const cycleQtyByStepChart = useRef();
	const dashboardRef = useRef(null);

	// ========= handlers =========
	const internalServerErrorFound = (errStatus) => {
		setInternalServerError(errStatus);
	};

	const handleFilterChange = (cellIds, step) => {
		if (!cellIds.length) {
			setNoDataFound(true);
			return;
		}
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("step", step);
		let request = {
			params: params,
		};
		setStepFromFilter(step);
		setSearchParams(params.toString());
		_fetchData(request, "cycleIndex");
		_fetchData(request, "timeSeries");
		_fetchData(request, "efficiency");
		_fetchData(request, "cycleQtyByStep");
		return true;
	};

	const formatCode = (code) => {
		setCodeContent(code);
		setModalVisible(true);
	};

	const handleCellIdChange = async (selectedCellIds) => {
		// instance.postMessage({
		// 	chartData,
		// 	selectedCellIds,
		// });
		// console.log("navigator.hardwareConcurrency", navigator.hardwareConcurrency);
		console.log("selected cellIds", selectedCellIds);

		let params = new URLSearchParams();
		selectedCellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("step", stepFromFilter);
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

		let promise1 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "cycleIndex")));
		let promise2 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "timeSeries")));
		let promise3 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "efficiency")));
		let promise4 = new Promise((resolve) => resolve(_renderChartsAfterFilter(filteredChartData, "cycleQtyByStep")));
		let responses = await Promise.all([promise1, promise2, promise3, promise4]);
		for (let response of responses) {
			setDisableSelection(false);
		}
	};

	const b64toBlob = (b64Data, contentType = "", sliceSize = 512) => {
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
			const slice = byteCharacters.slice(offset, offset + sliceSize);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		const blob = new Blob(byteArrays, { type: contentType });
		return blob;
	};

	function copyToClipboard(textToCopy) {
		if (navigator.clipboard && window.isSecureContext) {
			return navigator.clipboard.writeText(textToCopy);
			// return navigator.clipboard.write([new window.ClipboardItem({ "image/png": textToCopy })]);
		} else {
			let textArea = document.createElement("textarea");
			textArea.value = textToCopy;
			textArea.style.position = "fixed";
			textArea.style.left = "-999999px";
			textArea.style.top = "-999999px";
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			return new Promise((res, rej) => {
				document.execCommand("copy") ? res() : rej();
				textArea.remove();
			});
		}
	}

	const shareOnLinkedIn = () => {
		window.open(
			`
			https://www.linkedin.com/oauth/v2/authorization?
			response_type=code&
			state=123456789&
			scope=r_emailaddress%20r_liteprofile%20w_member_social&
			client_id=${CLIENT_ID}
			&redirect_uri=${encodeURI(REDIRECT_URI)}
		`,
			"_self"
		);
	};

	const doShareDashboard = () => {
		audit("cycle_dash_share");
		console.log("share");
		setMetaImageDash(null);
		localStorage.setItem("dashImage", null);
		setShallShowShareDashModal(true);
		if (dashboardRef.current === null) {
			return;
		}
		toBlob(dashboardRef.current).then(function (blob) {
			let reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				let base64data = reader.result;
				setMetaImageDash(base64data);
				localStorage.setItem("dashImage", base64data);
				// copyToClipboard(b64toBlob(base64data.split(",")[1], "image/png"));
			};
		});
	};

	// ========= Helpers ==========

	const _fetchData = (request, chartType) => {
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
						nameGap: 25,
						nameTextStyle: {
							fontSize: window.screen.width < 600 ? 12 : 16,
						},
						scale: true,
						padding: [0, 5],
					},
					legend: _createChartLegend(result.records[0], chartId),
					toolbox: {
						zlevel: 30,
						top: window.screen.width < 600 ? "8%" : "5%",
						// showTitle: false,
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
									audit(`cycle_dash_chart_${chartType}_viewcode`);
									formatCode(code);
								},
							},
							myTool2: {
								show: true,
								title: "Enter Fullscreen",
								icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
								onclick: function () {
									audit(`cycle_dash_chart_${chartType}_fullscreen`);
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
				ref.current.getEchartsInstance().hideLoading();
				showChartLoadingError(chartType, true);
			});
	};

	const showChartLoadingError = (chartType, show) => {
		setChartLoadingError((prev) => {
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
				nameGap: 25,
				nameTextStyle: {
					fontSize: window.screen.width < 600 ? 12 : 16,
				},
				scale: true,
				padding: [0, 5],
			},
			toolbox: {
				zlevel: 30,
				top: window.screen.width < 600 ? "8%" : "5%",
				// showTitle: false,
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
							audit(`cycle_dash_chart_${chartType}_viewcode`);
							formatCode(code);
						},
					},
					myTool2: {
						show: true,
						title: "Enter Fullscreen",
						icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
						onclick: function () {
							audit(`cycle_dash_chart_${chartType}_fullscreen`);
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
					<Modal
						title="Share Dashboard"
						centered
						visible={shallShowShareDashModal || shareLoadingMsg}
						footer={false}
						onCancel={() => {
							setShallShowShareDashModal(false);
							setShareLoadingMsg("");
						}}
						style={{ maxHeight: "70%" }}
					>
						{shareLoadingMsg ? (
							<div className="text-center">{shareLoadingMsg}</div>
						) : (
							<div>
								<div style={{ display: "flex" }}>
									<div style={{ width: "50%" }} className="text-center">
										<a
											// title="LinkedIn"
											// href={`https://www.linkedin.com/sharing/share-offsite/?url=https://www.amplabs.ai/dashboard/cycle-test?mail=${Cookies.get(
											// 	"userId"
											// )}`}
											href="#"
											onClick={(e) => {
												e.preventDefault();
												shareOnLinkedIn();
											}}
											// target="_blank"
										>
											<FaLinkedin size={70} />
										</a>
									</div>
									<div style={{ width: "50%" }} className="text-center">
										<a
											title="Mail"
											href={`mailto:?subject=Amplabs.ai - Dashboared&body=I just created a Cycle Test dashboard on AmpLabs, check it out at amplabs.ai. https://www.amplabs.ai/dashboard/cycle-test?mail=${Cookies.get(
												"userId"
											)}`}
											target="_blank"
											rel="noreferrer"
										>
											<FaEnvelope size={70} />
										</a>
									</div>
									<div style={{ width: "50%" }} className="text-center">
										<div
											className="btn btn-link"
											title="Direct Link"
											onClick={(e) => {
												e.preventDefault();
												copyToClipboard(`https://www.amplabs.ai/dashboard/cycle-test?mail=${Cookies.get("userId")}`);
												message.success("Copied to clipboard!");
												message.success("Copied to clipboard!");
											}}
										>
											<FaLink size={60} />
										</div>
									</div>
								</div>
								<Card
									loading={!metaImageDash}
									cover={metaImageDash ? <img alt="dashboard screenshot" src={metaImageDash} /> : <Skeleton.Image />}
									style={{ width: "100%", marginTop: "10px", backgroundColor: "#f9f9f9" }}
								>
									{`I just created a Cycle Test dashboard on AmpLabs! Check it out at https://www.amplabs.ai/dashboard/cycle-test?mail=${Cookies.get(
										"userId"
									)} @materialscience #amplabs #batterytechnology #batterydata #materialsscience #researchers`}
								</Card>
							</div>
						)}
					</Modal>
					<HelmetMetaData image={metaImageDash}></HelmetMetaData>
					<PageHeader
						className="site-page-header mb-1 shadow"
						style={{ marginTop: "0.8em" }}
						ghost={true}
						title="Cycle Test Dashboard"
						extra={[
							<Button
								disabled={shareDisabled}
								key="1"
								size="large"
								type="primary"
								onClick={doShareDashboard}
								icon={<ShareAltOutlined />}
							>
								Share
							</Button>,
						]}
					></PageHeader>
					{/* <img src={metaImageDash} alt="Broken" /> */}
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
					<div ref={dashboardRef}>
						<div className="row pb-5">
							<div className="col-md-6 mt-2">
								{/* <input type="file" onChange={(e) => setMetaImageDash(e.target.files[0])} /> */}
								<FullScreen handle={screen1} onChange={reportChange}>
									<div data-id="cycleIndexChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.cycleIndex && <Alert message="Error loading chart!" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={cycleIndexChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
							<div className="col-md-6 mt-2">
								<FullScreen handle={screen3} onChange={reportChange}>
									<div data-id="efficiencyChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.efficiency && <Alert message="Error loading chart!" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={efficiencyChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
							<div className="col-md-6 mt-2">
								<FullScreen handle={screen2} onChange={reportChange}>
									<div data-id="timeSeriesChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.timeSeries && <Alert message="Error loading chart!" type="error" showIcon />}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
												showLoading
												ref={timeSeriesChart}
												option={initialChartOptions}
											/>
										</div>
									</div>
								</FullScreen>
							</div>
							<div className="col-md-6 mt-2">
								<FullScreen handle={screen4} onChange={reportChange}>
									<div data-id="cycleQtyByStepChart" className="card shadow" style={{ height: "100%", width: "100%" }}>
										<div className="card-body">
											{chartLoadingError.cycleQtyByStep && (
												<Alert message="Error loading chart!" type="error" showIcon />
											)}
											<ReactEcharts
												style={{
													width: "100%",
													height: window.screen.width < 600 ? "15rem" : "24em",
												}}
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
				</div>
			)}
		</div>
	);
};

export default DashboardCycleTest;
