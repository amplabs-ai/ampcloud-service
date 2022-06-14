import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import DashboardFilterBar2 from "./DashboardFilterBar2";
import WorkerBuilder from "../../worker/woker-builder";
import Worker from "../../worker/worker";
import ViewCodeModal from "../ViewCodeModal";
import DashboardChart from "../chart/DashboardChart";
import { Spin } from "antd";

let CHART_API_ENDPOINTS = {
	energyAndDecay: "/echarts/energyAndCapacityDecay",
	efficiency: "/echarts/efficiency",
	cycleQtyByStep: "/echarts/cycleQuantitiesByStep",
};

const instance = new WorkerBuilder(Worker);

const ChartContainer2 = () => {
	const { state, action, dashboardRef } = useDashboard();
	const [disableSelection, setDisableSelection] = useState(true);
	const [stepFromFilter, setStepFromFilter] = useState("");
	const [searchParams, setSearchParams] = useState("");
	const [chartLoadSpiner, setChartLoadSpiner] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [chartLoadingError, setChartLoadingError] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [chartData, setChartData] = useState({});
	const [cancelReqToken, setCancelReqToken] = useState({});
	const [filteredData, setFilteredData] = useState({});
	const [chartsLoaded, setChartsLoaded] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [codeContent, setCodeContent] = useState("");

	useEffect(() => {
		let check = true;
		Object.values(chartsLoaded).forEach((c) => {
			if (!c) {
				check = false;
			}
		});
		if (check) {
			action.setShareDisabled(false);
			setDisableSelection(false);
		}
	}, [chartsLoaded]);

	useEffect(() => {
		return () => {
			for (const s in getCancelReqToken()) {
				console.log("first");
				cancelReqToken[s].cancel();
			}
		};
	}, []);

	const getCancelReqToken = () => {
		return cancelReqToken;
	};

	const getSearchParams = (cellIds, step) => {
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("step", step);
		if (state.dashboardId) {
			params.append("dashboard_id", state.dashboardId);
		}
		setStepFromFilter(step);
		action.setAppliedStep(step);
		setSearchParams(params.toString());
		return params;
	};

	// runs when api call is needed / gets cellIds from filter bar
	const handleFilterChange = (cellIds, step, accessToken) => {
		if (!cellIds.length) {
			return;
		}
		let request = {
			params: getSearchParams(cellIds, step),
			headers: {
				Authorization: `Bearer ${accessToken}`,
			},
		};
		_fetchData("energyAndDecay", request);
		_fetchData("efficiency", request);
		_fetchData("cycleQtyByStep", request);
		return true;
	};

	const handleChartLoadingError = (apiType, show) => {
		switch (apiType) {
			case "energyAndDecay":
				setChartLoadingError((prev) => {
					return { ...prev, cycleIndex: show, timeSeries: show };
				});
				break;
			case "efficiency":
				setChartLoadingError((prev) => {
					return { ...prev, efficiency: show };
				});
				break;
			case "cycleQtyByStep":
				setChartLoadingError((prev) => {
					return { ...prev, cycleQtyByStep: show, cycleQtyByStepWithCapacity: show };
				});
				break;
			default:
				break;
		}
	};

	const handleChartLoadSpinner = (apiType, show) => {
		switch (apiType) {
			case "energyAndDecay":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycleIndex: show, timeSeries: show };
				});
				break;
			case "efficiency":
				setChartLoadSpiner((prev) => {
					return { ...prev, efficiency: show };
				});
				break;
			case "cycleQtyByStep":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycleQtyByStep: show, cycleQtyByStepWithCapacity: show };
				});
				break;
			default:
				break;
		}
	};

	const _fetchData = (apiType, request) => {
		handleChartLoadingError(apiType, false);
		handleChartLoadSpinner(apiType, true);
		setDisableSelection(true);
		action.setShareDisabled(true);
		const tokenSource = axios.CancelToken.source();
		setCancelReqToken((prev) => {
			return { ...prev, [apiType]: tokenSource };
		});
		axios
			.get(CHART_API_ENDPOINTS[apiType], { ...request, cancelToken: tokenSource.token })
			.then((result) => {
				handleChartLoadSpinner(apiType, false);
				result = typeof result.data == "string" ? JSON.parse(result.data.replace(/\bNaN\b/g, "null")) : result.data;
				console.log(`${apiType} data`, result.records[0]);
				switch (apiType) {
					case "energyAndDecay":
						setChartData((prev) => {
							return { ...prev, cycleIndex: result.records[0], timeSeries: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, cycleIndex: result.records[0], timeSeries: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, cycleIndex: true, timeSeries: true };
						});
						break;
					case "efficiency":
						setChartData((prev) => {
							return { ...prev, efficiency: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, efficiency: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, efficiency: true };
						});
						break;
					case "cycleQtyByStep":
						setChartData((prev) => {
							return { ...prev, cycleQtyByStep: result.records[0], cycleQtyByStepWithCapacity: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, cycleQtyByStep: result.records[0], cycleQtyByStepWithCapacity: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, cycleQtyByStep: true, cycleQtyByStepWithCapacity: true };
						});
						break;
					default:
						break;
				}
			})
			.catch((err) => {
				console.log(`${apiType} err`, err);
				handleChartLoadingError(apiType, true);
			});
	};

	const handleCellIdChange = async (selectedCellIds) => {
		console.log("selected cellIds", selectedCellIds);

		setLoading(true);
		getSearchParams(selectedCellIds, stepFromFilter);
		setDisableSelection(true);
		instance.postMessage({ chartData, selectedCellIds });
		instance.onmessage = (message) => {
			if (message) {
				console.log("Message from worker", message.data);
				setFilteredData(message.data);
				setLoading(false);
				setDisableSelection(false);
			}
		};
	};

	const formatCode = (code) => {
		setCodeContent(code);
		setModalVisible(true);
	};

	return (
		<div>
			<ViewCodeModal
				code={codeContent}
				modalVisible={modalVisible}
				setModalVisible={setModalVisible}
				searchParams={searchParams}
			/>
			<DashboardFilterBar2
				onFilterChange={handleFilterChange}
				onCellIdChange={handleCellIdChange}
				disableSelection={disableSelection}
			/>
			{loading ? (
				<div className="text-center mt-5">
					<Spin size="large" />
				</div>
			) : (
				<div ref={dashboardRef}>
					<div className="row pb-5">
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["cycleIndex"] || []}
								chartName="cycleIndex"
								chartLoadingError={chartLoadingError["cycleIndex"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["cycleIndex"]}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["efficiency"] || []}
								chartName="efficiency"
								chartLoadingError={chartLoadingError["efficiency"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["efficiency"]}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["timeSeries"] || []}
								chartName="timeSeries"
								chartLoadingError={chartLoadingError["timeSeries"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["timeSeries"]}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["cycleQtyByStep"] || []}
								chartName="cycleQtyByStep"
								chartLoadingError={chartLoadingError["cycleQtyByStep"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["cycleQtyByStep"]}
							/>
						</div>
						<div className="col-md-12 mt-2">
							<DashboardChart
								data={filteredData["cycleQtyByStepWithCapacity"] || []}
								chartName="cycleQtyByStepWithCapacity"
								chartLoadingError={chartLoadingError["cycleQtyByStepWithCapacity"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["cycleQtyByStepWithCapacity"]}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChartContainer2;
