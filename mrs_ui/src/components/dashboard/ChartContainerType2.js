import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import DashboardFilterBar2 from "./DashboardFilterBar";
import WorkerBuilder from "../../worker/woker-builder";
import Worker from "../../worker/worker";
import ViewCodeModal from "../ViewCodeModal";
import DashboardChart from "../chart/DashboardChart";
import { message, Spin } from "antd";
import DashboardFilterBar from "./DashboardFilterBar";
import { initialChartFilters } from "../../chartConfig/initialConfigs";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useUserPlan } from "../../context/UserPlanContext";

let CHART_API_ENDPOINTS = {
	capacityRetention: "/echarts/capacityRetention",
	coulombicEfficiency: "/echarts/coulombicEfficiency",
	differentialCapacity: "/echarts/differentialCapacity",
	galvanostaticPlot: "/echarts/galvanostaticPlot",
	voltageTime: "/echarts/voltageTime",
	currentTime: "/echarts/currentTime",
	energyDensity: "/echarts/energyDensity"
};

const instance = new WorkerBuilder(Worker);

const ChartContainerType2 = () => {
	const { state, action, dashboardRef } = useDashboard();
	// const [disableSelection, setDisableSelection] = useState(true);
	// const [reductionFactorFilter, setReductionFactorFilter] = useState("");
	// const [searchParams, setSearchParams] = useState("");
	const [chartLoadSpiner, setChartLoadSpiner] = useState({
		capacityRetention: false,
		coulombicEfficiency: false,
		differentialCapacity: false,
		galvanostaticPlot: false,
		voltageTime: false,
		currentTime: false,
		energyDensity: false,
	});
	const [chartLoadingError, setChartLoadingError] = useState({
		capacityRetention: false,
		coulombicEfficiency: false,
		differentialCapacity: false,
		galvanostaticPlot: false,
		voltageTime: false,
		currentTime: false,
		energyDensity: false,
	});
	const [chartData, setChartData] = useState({});
	const [cancelReqToken, setCancelReqToken] = useState({});
	const [filteredData, setFilteredData] = useState({});
	const [chartsLoaded, setChartsLoaded] = useState({
		capacityRetention: false,
		coulombicEfficiency: false,
		differentialCapacity: false,
		galvanostaticPlot: false,
		voltageTime: false,
		currentTime: false,
	});
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const accessToken = useAuth0Token();
	const userPlan = useUserPlan();

	useEffect(() => {
		setChartLoadingError((prev)=> {
			return {...prev,
				capacityRetention: false,
				coulombicEfficiency: false,
				differentialCapacity: false,
				galvanostaticPlot: false,
				voltageTime: false,
				currentTime: false,
				energyDensity: false,
			}
		})
		let check = true;
		Object.values(chartsLoaded).forEach((c) => {
			if (!c) {
				check = false;
			}
		});
		if (check) {
			action.setShareDisabled(true);
			action.setDisableSelection(false);
		}
	}, [chartsLoaded]);

	useEffect(() => {
		return () => {
			for (const s in getCancelReqToken()) {
				cancelReqToken[s].cancel();
			}
			action.setShareDisabled(true);
		};
	}, []);

	useEffect(() => {
		if (accessToken && state.checkedCellIds.length && userPlan) {
			handleFilterChange(state.checkedCellIds, accessToken)
		}
	}, [state.selectedCellIds, accessToken, userPlan]);

	const getCancelReqToken = () => {
		return cancelReqToken;
	};

	// const getSearchParams = (cellIds, step, modStep, reductionFactor) => {
	// 	let params = new URLSearchParams();
	// 	cellIds.forEach((cellId) => {
	// 		params.append("cell_id", cellId.cell_id);
	// 	});
	// 	params.append("reduction_factor", reductionFactor);
	// 	params.append("step", step);
	// 	params.append("mod_step", modStep)
	// 	// if (state.dashboardId) {
	// 	// 	params.append("dashboard_id", state.dashboardId);
	// 	// }
	// 	setReductionFactorFilter(reductionFactor)
	// 	// action.setAppliedStep(step);
	// 	return params;
	// };

	// runs when api call is needed / gets cellIds from filter bar
	const handleFilterChange = (cellIds, accessToken) => {
		if (!cellIds.length) {
			return;
		}
		let data = {
			cell_ids: cellIds.map((c) => c.cell_id)
		  };
		let request = {
		method: "post",
		headers: {
			Authorization: "Bearer " + accessToken,
			"Content-Type": "application/json",
		},
		}
		request.data = data
		data.filters = initialChartFilters["differentialCapacity"]
		_fetchData("differentialCapacity", request);
		data.filters = initialChartFilters["galvanostaticPlot"]
		_fetchData("galvanostaticPlot", request);
		data.filters = initialChartFilters["voltageTime"]
		_fetchData("voltageTime", request);
		data.filters = initialChartFilters["currentTime"]
		_fetchData("currentTime", request);

		data.filters = []
		_fetchData("coulombicEfficiency", request);
		_fetchData("capacityRetention", request);
		_fetchData("energyDensity", request);
		
		return true;
	};

	const handleChartLoadingError = (apiType, show) => {
		switch (apiType) {
			case "capacityRetention":
				setChartLoadingError((prev) => {
					return { ...prev, capacityRetention: show};
				});
				break;
			case "coulombicEfficiency":
				setChartLoadingError((prev) => {
					return { ...prev, coulombicEfficiency: show };
				});
				break;
			case "differentialCapacity":
				setChartLoadingError((prev) => {
					return { ...prev, differentialCapacity: show };
				});
				break;
			case "galvanostaticPlot":
				setChartLoadingError((prev) => {
					return { ...prev, galvanostaticPlot: show };
				});
				break;
			case "voltageTime":
				setChartLoadingError((prev) => {
					return { ...prev, voltageTime: show };
				});
				break;
			case "currentTIme":
				setChartLoadingError((prev) => {
					return { ...prev, currentTime: show };
				});
				break;
			case "energyDensity":
				setChartLoadingError((prev) => {
					return { ...prev, energyDensity: show };
				});
				break;
			default:
				break;
		}
	};

	const handleChartLoadSpinner = (apiType, show) => {
		switch (apiType) {
			case "capacityRetention":
				setChartLoadSpiner((prev) => {
					return { ...prev, capacityRetention: show};
				});
				break;
			case "coulombicEfficiency":
				setChartLoadSpiner((prev) => {
					return { ...prev, coulombicEfficiency: show };
				});
				break;
			case "differentialCapacity":
				setChartLoadSpiner((prev) => {
					return { ...prev, differentialCapacity: show };
				});
				break;
			case "galvanostaticPlot":
				setChartLoadSpiner((prev) => {
					return { ...prev, galvanostaticPlot: show };
				});
				break;
			case "voltageTime":
				setChartLoadSpiner((prev) => {
					return { ...prev, voltageTime: show };
				});
				break;
			case "currentTime":
				setChartLoadSpiner((prev) => {
					return { ...prev, currentTime: show };
				});
				break;
			case "energyDensity":
				setChartLoadSpiner((prev) => {
					return { ...prev, energyDensity: show };
				});
				break;
			default:
				break;
		}
	};

	const _fetchData = (apiType, request) => {
		handleChartLoadingError(apiType, false);
		handleChartLoadSpinner(apiType, true);
		action.setDisableSelection(true);
		action.setShareDisabled(true);
		const tokenSource = axios.CancelToken.source();
		setCancelReqToken((prev) => {
			return { ...prev, [apiType]: tokenSource };
		});

		axios({
			...request,
			url: CHART_API_ENDPOINTS[apiType],
			cancelToken: tokenSource.token,
		  })
			.then((result) => {
				handleChartLoadSpinner(apiType, false);
				result = typeof result.data == "string" ? JSON.parse(result.data.replace(/\bNaN\b/g, "null")) : result.data;
				switch (apiType) {
					case "capacityRetention":
						setChartData((prev) => {
							return { ...prev, capacityRetention: result.records[0]};
						});
						setFilteredData((prev) => {
							return { ...prev, capacityRetention: result.records[0]};
						});
						setChartsLoaded((prev) => {
							return { ...prev, capacityRetention: true};
						});
						break;
					case "coulombicEfficiency":
						setChartData((prev) => {
							return { ...prev, coulombicEfficiency: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, coulombicEfficiency: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, coulombicEfficiency: true };
						});
						break;
					case "differentialCapacity":
						setChartData((prev) => {
							return { ...prev, differentialCapacity: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, differentialCapacity: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, differentialCapacity: true };
						});
						break;
					case "galvanostaticPlot":
						setChartData((prev) => {
							return { ...prev, galvanostaticPlot: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, galvanostaticPlot: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, galvanostaticPlot: true };
						});
						break;
					case "voltageTime":
						setChartData((prev) => {
							return { ...prev, voltageTime: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, voltageTime: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, voltageTime: true };
						});
						break;
					case "currentTime":
						setChartData((prev) => {
							return { ...prev, currentTime: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, currentTime: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, currentTime: true };
						});
						break;
					case "energyDensity":
						setChartData((prev) => {
							return { ...prev, energyDensity: result.records[0] };
						});
						setFilteredData((prev) => {
							return { ...prev, energyDensity: result.records[0] };
						});
						setChartsLoaded((prev) => {
							return { ...prev, energyDensity: true };
						});
						break;
					default:
						break;
				}
			})
			.catch((err) => {
				if (err.response.data.status === 400) {
					message.error(err.response.data.detail);
					message.error(err.response.data.detail);
				}
				handleChartLoadingError(apiType, true);
			});
	};

	useEffect(() => {
		setChartLoadingError((prev)=> {
			return {...prev,
				capacityRetention: false,
				coulombicEfficiency: false,
				differentialCapacity: false,
				galvanostaticPlot: false,
				voltageTime: false,
				currentTime: false,
				energyDensity: false,
			}
		})
		let check = true;
		Object.values(chartsLoaded).forEach((c) => {
			if (!c) {
				check = false;
			}
		});
		if (check) {
			action.setShareDisabled(true);
			action.setDisableSelection(false);
		}
	}, [chartsLoaded]);

	useEffect(() => {
		// action.setCheckedCellIds(state.checkedCellIds)
		setLoading(true);
		// getSearchParams(state.checkedCellIds, reductionFactorFilter);
		action.setDisableSelection(true);
		instance.postMessage({ chartData, selectedCellIds: state.checkedCellIds });
		instance.onmessage = (message) => {
			if (message) {
				// action.setCheckedCellIds(state.checkedCellIds)
				setFilteredData(message.data);
				setLoading(false);
				action.setDisableSelection(false);
			}
		};
	}, [state.checkedCellIds]);
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
								data={filteredData["capacityRetention"] || []}
								chartName="capacityRetention"
								chartLoadingError={chartLoadingError["capacityRetention"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["capacityRetention"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["coulombicEfficiency"] || []}
								chartName="coulombicEfficiency"
								chartLoadingError={chartLoadingError["coulombicEfficiency"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["coulombicEfficiency"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["voltageTime"] || []}
								chartName="voltageTime"
								chartLoadingError={chartLoadingError["voltageTime"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["voltageTime"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["currentTime"] || []}
								chartName="currentTime"
								chartLoadingError={chartLoadingError["currentTime"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["currentTime"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["galvanostaticPlot"] || []}
								chartName="galvanostaticPlot"
								chartLoadingError={chartLoadingError["galvanostaticPlot"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["galvanostaticPlot"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-6 mt-2">
							<DashboardChart
								data={filteredData["energyDensity"] || []}
								chartName="energyDensity"
								chartLoadingError={chartLoadingError["energyDensity"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["energyDensity"]}
								fetchData={_fetchData}
							/>
						</div>
						<div className="col-md-12 mt-2">
							<DashboardChart
								data={filteredData["differentialCapacity"] || []}
								chartName="differentialCapacity"
								chartLoadingError={chartLoadingError["differentialCapacity"]}
								formatCode={formatCode}
								shallShowLoadSpinner={chartLoadSpiner["differentialCapacity"]}
								fetchData={_fetchData}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default ChartContainerType2;
