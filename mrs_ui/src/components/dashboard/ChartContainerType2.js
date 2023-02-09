import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import WorkerBuilder from "../../worker/woker-builder";
import Worker from "../../worker/worker";
import ViewCodeModal from "../ViewCodeModal";
import DashboardChart from "../chart/DashboardChart";
import message from "antd/es/message";
import Spin from "antd/es/spin";
import { initialChartFilters } from "../../chartConfig/initialConfigs";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useUserPlan } from "../../context/UserPlanContext";
import pako from "pako";


let CHART_API_ENDPOINTS = {
	coulombicEfficiency: "/echarts/coulombicEfficiency",
	differentialCapacity: "/echarts/differentialCapacity",
	galvanostaticPlot: "/echarts/galvanostaticPlot",
	voltageTime: "/echarts/voltageTime",
	currentTime: "/echarts/currentTime",
	energyDensity: "/echarts/energyDensity",
	capacity: "/echarts/capacity",
	operatingPotential: "/echarts/operatingPotential",
	forceDisplacement: "/echarts/forceDisplacement",
	testTemperature: "/echarts/testTemperature",
	testVoltage: "/echarts/testVoltage"
};

const instance = new WorkerBuilder(Worker);

const ChartContainerType2 = (props) => {
	const { state, action, dashboardRef } = useDashboard();
	const [chartLoadSpiner, setChartLoadSpiner] = useState({
		cycle: {
			coulombicEfficiency: false,
			differentialCapacity: false,
			galvanostaticPlot: false,
			voltageTime: false,
			currentTime: false,
			energyDensity: false,
			capacity: false,
			operatingPotential: false,
		},
		abuse: {
			forceDisplacement: false,
			testTemperature: false,
			testVoltage: false
		}
	});
	const [chartLoadingError, setChartLoadingError] = useState({
		cycle: {
			coulombicEfficiency: false,
			differentialCapacity: false,
			galvanostaticPlot: false,
			voltageTime: false,
			currentTime: false,
			energyDensity: false,
			capacity: false,
			operatingPotential: false,
		},
		abuse: {
			forceDisplacement: false,
			testTemperature: false,
			testVoltage: false
		}
	});
	const [chartData, setChartData] = useState({});
	const [cancelReqToken] = useState({
		cycle: {
			coulombicEfficiency: axios.CancelToken.source(),
			differentialCapacity: axios.CancelToken.source(),
			galvanostaticPlot: axios.CancelToken.source(),
			voltageTime: axios.CancelToken.source(),
			currentTime: axios.CancelToken.source(),
			energyDensity: axios.CancelToken.source(),
			capacity: axios.CancelToken.source(),
			operatingPotential: axios.CancelToken.source(),
		},
		abuse: {
			forceDisplacement: axios.CancelToken.source(),
			testTemperature: axios.CancelToken.source(),
			testVoltage: axios.CancelToken.source(),
		}
	});
	const [filteredData, setFilteredData] = useState({});
	const [chartsLoaded, setChartsLoaded] = useState({
		cycle: {
			coulombicEfficiency: false,
			differentialCapacity: false,
			galvanostaticPlot: false,
			voltageTime: false,
			currentTime: false,
			energyDensity: false,
			capacity: false,
			operatingPotential: false,
		},
		abuse: {
			forceDisplacement: false,
			testTemperature: false,
			testVoltage: false
		}
	});
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const [displayNames, setDisplayNames] = useState({})
	const accessToken = useAuth0Token();
	const userPlan = useUserPlan();

	useEffect(() => {
		setChartLoadingError((prev) => {
			return {
				...prev,
				cycle: {
					coulombicEfficiency: false,
					differentialCapacity: false,
					galvanostaticPlot: false,
					voltageTime: false,
					currentTime: false,
					energyDensity: false,
					capacity: false,
					operatingPotential: false,
				},
				abuse: {
					forceDisplacement: false,
					testTemperature: false,
					testVoltage: false
				}
			};
		});
		let check = true;
		Object.values(chartsLoaded[props.type]).forEach((c) => {
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
				cancelReqToken[props.type][s].cancel();
			}
			action.setShareDisabled(true);
		};
	}, []);

	useEffect(() => {
		if (state.dashboardId || (accessToken && state.checkedCellIds?.length && userPlan)) {
			getDisplayNames()
			handleFilterChange(state.checkedCellIds, accessToken);
		}
	}, [state.selectedCellIds, accessToken, userPlan]);

	const getCancelReqToken = () => {
		return cancelReqToken;
	};

	const getDisplayNames = () => {
		const timeseries = axios.get(`/displayname/${props.type}/timeseries`);
		const cycle = axios.get("/displayname/cycle");
		axios
			.all(props.type === "cycle" ? [timeseries, cycle] : [timeseries])
			.then(
				axios.spread((...responses) => {
					setDisplayNames({
						timeseries: responses[0].data?.records,
						...(props.type === "cycle") && { cycle: responses[1].data?.records },
					});
				})
			)
			.catch((err) => {
				console.log("error fetching displaynames")
			});
	};
	// runs when api call is needed / gets cellIds from filter bar
	const handleFilterChange = (cellIds, accessToken) => {
		let params = new URLSearchParams();
		if (state.dashboardId) {
			params.append("dashboard_id", state.dashboardId);
		}
		let data = {
			cell_ids: cellIds.map((c) => c.cell_id),
		};
		let request = {
			params: params,
			method: "post",
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
		};
		request.data = data;
		data.filters = [];
		if (props.type === "cycle") {
			_fetchData("coulombicEfficiency", request);

			_fetchData("capacity", request);
			_fetchData("operatingPotential", request);

			data.filters = initialChartFilters["voltageTime"];
			_fetchData("voltageTime", request);
			data.filters = initialChartFilters["currentTime"];
			_fetchData("currentTime", request);

			data.filters = initialChartFilters["galvanostaticPlot"];
			_fetchData("galvanostaticPlot", request);
			data.filters = initialChartFilters["differentialCapacity"];
			_fetchData("differentialCapacity", request);

			data.filters = [];
			_fetchData("energyDensity", request);
		}
		else {
			_fetchData("forceDisplacement", request);

			_fetchData("testTemperature", request);
			_fetchData("testVoltage", request);
		}


		return true;
	};

	const handleChartLoadingError = (apiType, show) => {
		switch (apiType) {
			case "coulombicEfficiency":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, coulombicEfficiency: show } };
				});
				break;
			case "differentialCapacity":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, differentialCapacity: show } };
				});
				break;
			case "galvanostaticPlot":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, galvanostaticPlot: show } };
				});
				break;
			case "voltageTime":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, voltageTime: show } };
				});
				break;
			case "currentTIme":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, currentTime: show } };
				});
				break;
			case "energyDensity":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, energyDensity: show } };
				});
				break;
			case "capacity":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, capacity: show } };
				});
				break;
			case "operatingPotential":
				setChartLoadingError((prev) => {
					return { ...prev, cycle: { ...prev.cycle, operatingPotential: show } };
				});
				break;
			case "forceDisplacement":
				setChartLoadingError((prev) => {
					return { ...prev, abuse: { ...prev.abuse, forceDisplacement: show } };
				});
				break;
			case "testTemperature":
				setChartLoadingError((prev) => {
					return { ...prev, abuse: { ...prev.abuse, testTemperature: show } };
				});
				break;
			case "testVoltage":
				setChartLoadingError((prev) => {
					return { ...prev, abuse: { ...prev.abuse, testVoltage: show } };
				});
				break;
			default:
				break;
		}
	};

	const handleChartLoaded = (apiType, show) => {
		switch (apiType) {
			case "coulombicEfficiency":
				setChartsLoaded((prev) => {
					return { ...prev, coulombicEfficiency: show };
				});
				break;
			case "differentialCapacity":
				setChartsLoaded((prev) => {
					return { ...prev, differentialCapacity: show };
				});
				break;
			case "galvanostaticPlot":
				setChartsLoaded((prev) => {
					return { ...prev, galvanostaticPlot: show };
				});
				break;
			case "voltageTime":
				setChartsLoaded((prev) => {
					return { ...prev, voltageTime: show };
				});
				break;
			case "currentTime":
				setChartsLoaded((prev) => {
					return { ...prev, currentTime: show };
				});
				break;
			case "energyDensity":
				setChartsLoaded((prev) => {
					return { ...prev, energyDensity: show };
				});
				break;
			case "capacity":
				setChartsLoaded((prev) => {
					return { ...prev, capacity: show };
				});
				break;
			case "operatingPotential":
				setChartsLoaded((prev) => {
					return { ...prev, operatingPotential: show };
				});
				break;
			default:
				break;
		}
	};

	const handleChartLoadSpinner = (apiType, show) => {
		switch (apiType) {
			case "coulombicEfficiency":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, coulombicEfficiency: show } };
				});
				break;
			case "differentialCapacity":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, differentialCapacity: show } };
				});
				break;
			case "galvanostaticPlot":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, galvanostaticPlot: show } };
				});
				break;
			case "voltageTime":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, voltageTime: show } };
				});
				break;
			case "currentTime":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, currentTime: show } };
				});
				break;
			case "energyDensity":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, energyDensity: show } };
				});
				break;
			case "capacity":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, capacity: show } };
				});
				break;
			case "operatingPotential":
				setChartLoadSpiner((prev) => {
					return { ...prev, cycle: { ...prev.cycle, operatingPotential: show } };
				});
				break;
			case "forceDisplacement":
				setChartLoadSpiner((prev) => {
					return { ...prev, abuse: { ...prev.abuse, forceDisplacement: show } };
				});
				break;
			case "testTemperature":
				setChartLoadSpiner((prev) => {
					return { ...prev, abuse: { ...prev.abuse, testTemperature: show } };
				});
				break;
			case "testVoltage":
				setChartLoadSpiner((prev) => {
					return { ...prev, abuse: { ...prev.abuse, testVoltage: show } };
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
		axios({
			...request,
			url: CHART_API_ENDPOINTS[apiType],
			cancelToken: cancelReqToken[props.type][apiType].token,
		})
			.then((result) => {
				axios({
					method: "get",
					url: result.data.response_url,
					responseType: "arraybuffer",
					headers: {
						"Content-Type": "application/json",
					},
				})
					.then((result) => {
						let response = pako.inflate(result.data)
						response = new TextDecoder().decode(response);
						response = JSON.parse(response.replace(/\bNaN\b/g, "null"))
						// result = typeof result.data == "string" ? JSON.parse(result.data.replace(/\bNaN\b/g, "null")) : result.data;
						switch (apiType) {
							case "capacity":
								setChartData((prev) => {
									return { ...prev, capacity: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, capacity: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, capacity: true } };
								});
								break;
							case "coulombicEfficiency":
								setChartData((prev) => {
									return { ...prev, coulombicEfficiency: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, coulombicEfficiency: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, coulombicEfficiency: true } };
								});
								break;
							case "differentialCapacity":
								setChartData((prev) => {
									return { ...prev, differentialCapacity: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, differentialCapacity: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, differentialCapacity: true } };
								});
								break;
							case "galvanostaticPlot":
								setChartData((prev) => {
									return { ...prev, galvanostaticPlot: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, galvanostaticPlot: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, galvanostaticPlot: true } };
								});
								break;
							case "voltageTime":
								setChartData((prev) => {
									return { ...prev, voltageTime: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, voltageTime: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, voltageTime: true } };
								});
								break;
							case "currentTime":
								setChartData((prev) => {
									return { ...prev, currentTime: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, currentTime: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, currentTime: true } };
								});
								break;
							case "energyDensity":
								setChartData((prev) => {
									return { ...prev, energyDensity: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, energyDensity: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, energyDensity: true } };
								});
								break;
							case "operatingPotential":
								setChartData((prev) => {
									return { ...prev, operatingPotential: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, operatingPotential: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, cycle: { ...prev.cycle, operatingPotential: true } };
								});
								break;
							case "forceDisplacement":
								setChartData((prev) => {
									return { ...prev, forceDisplacement: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, forceDisplacement: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, abuse: { ...prev.abuse, forceDisplacement: true } };
								});
								break;
							case "testTemperature":
								setChartData((prev) => {
									return { ...prev, testTemperature: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, testTemperature: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, abuse: { ...prev.abuse, testTemperature: true } };
								});
								break;
							case "testVoltage":
								setChartData((prev) => {
									return { ...prev, testVoltage: response.records[0] };
								});
								setFilteredData((prev) => {
									return { ...prev, testVoltage: response.records[0] };
								});
								setChartsLoaded((prev) => {
									return { ...prev, abuse: { ...prev.abuse, testVoltage: true } };
								});
								break;
							default:
								break;
						}
						handleChartLoadSpinner(apiType, false);
					})
					.catch((err) => {
						handleChartLoadingError(apiType, true);
					});
			})
			.catch((err) => {
				console.log(err);
				if (err.response.data.status === 400) {
					message.error(err.response.data.detail);
					message.error(err.response.data.detail);
				}
				handleChartLoadingError(apiType, true);
			});
	};

	useEffect(() => {
		setChartLoadingError((prev) => {
			return {
				...prev,
				cycle: {
					coulombicEfficiency: false,
					differentialCapacity: false,
					galvanostaticPlot: false,
					voltageTime: false,
					currentTime: false,
					energyDensity: false,
					capacity: false,
					operatingPotential: false,
				},
				abuse: {
					forceDisplacement: false,
					testTemperature: false,
					testVoltage: false
				}
			};
		});
		let check = true;
		Object.values(chartsLoaded[props.type]).forEach((c) => {
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
		setLoading(true);
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
					{props.type === "cycle" ?
						<div className="row pb-5">
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["galvanostaticPlot"] || []}
									chartName="galvanostaticPlot"
									chartLoadingError={chartLoadingError[props.type]["galvanostaticPlot"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["galvanostaticPlot"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}

								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["energyDensity"] || []}
									chartName="energyDensity"
									chartLoadingError={chartLoadingError[props.type]["energyDensity"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["energyDensity"]}
									fetchData={_fetchData}
									displayNames={displayNames.cycle}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["capacity"] || []}
									chartName="capacity"
									chartLoadingError={chartLoadingError[props.type]["capacity"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["capacity"]}
									fetchData={_fetchData}
									displayNames={displayNames.cycle}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["operatingPotential"] || []}
									chartName="operatingPotential"
									chartLoadingError={chartLoadingError[props.type]["operatingPotential"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["operatingPotential"]}
									fetchData={_fetchData}
									displayNames={displayNames.cycle}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["coulombicEfficiency"] || []}
									chartName="coulombicEfficiency"
									chartLoadingError={chartLoadingError[props.type]["coulombicEfficiency"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["coulombicEfficiency"]}
									fetchData={_fetchData}
									displayNames={displayNames.cycle}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["differentialCapacity"] || []}
									chartName="differentialCapacity"
									chartLoadingError={chartLoadingError[props.type]["differentialCapacity"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["differentialCapacity"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["voltageTime"] || []}
									chartName="voltageTime"
									chartLoadingError={chartLoadingError[props.type]["voltageTime"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["voltageTime"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["currentTime"] || []}
									chartName="currentTime"
									chartLoadingError={chartLoadingError[props.type]["currentTime"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["currentTime"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
						</div> : <div className="row pb-5">
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["forceDisplacement"] || []}
									chartName="forceDisplacement"
									chartLoadingError={chartLoadingError[props.type]["forceDisplacement"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["forceDisplacement"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
							<div className="col-md-6 mt-2">
								<DashboardChart
									data={filteredData["testVoltage"] || []}
									chartName="testVoltage"
									chartLoadingError={chartLoadingError[props.type]["testVoltage"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["testVoltage"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
							<div className="col-md-12 mt-2">
								<DashboardChart
									data={filteredData["testTemperature"] || []}
									chartName="testTemperature"
									chartLoadingError={chartLoadingError[props.type]["testTemperature"]}
									formatCode={formatCode}
									shallShowLoadSpinner={chartLoadSpiner[props.type]["testTemperature"]}
									fetchData={_fetchData}
									displayNames={displayNames.timeseries}
								/>
							</div>
							</div>}
				</div>
			)}
		</div>
	);
};

export default ChartContainerType2;
