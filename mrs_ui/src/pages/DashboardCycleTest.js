import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
// ======= Components ==========
import DashboardFilterBar from "../components/DashboardFilterBar";
import ViewCodeModal from "../components/ViewCodeModal";
import SideBar from "../components/SideBar";
// ====== styling components, icons... ========
import { Result, Button, PageHeader, Spin, Layout } from "antd";
// ====== dependencies =======
import WorkerBuilder from "../worker/woker-builder";
import Worker from "../worker/worker";
import EditCellData from "../components/EditCellData";
import ShareButton from "../components/ShareButton";
import DashboardChart from "../components/chart/DashboardChart";
import { useAuth } from "../context/auth";
// ====== utility ======
const instance = new WorkerBuilder(Worker);
const { Content } = Layout;

let CHART_API_ENDPOINTS = {
	energyAndDecay: "/echarts/energyAndCapacityDecay",
	efficiency: "/echarts/efficiency",
	cycleQtyByStep: "/echarts/cycleQuantitiesByStep",
};

const DashboardCycleTest = () => {
	// =========states=========
	const [searchParams, setSearchParams] = useState("");
	const [modalVisible, setModalVisible] = useState(false);
	const [codeContent, setCodeContent] = useState("");
	const [chartLoadingError, setChartLoadingError] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [chartData, setChartData] = useState({});
	const [filteredData, setFilteredData] = useState({});
	const [internalServerError, setInternalServerError] = useState("");
	const [disableSelection, setDisableSelection] = useState(true);
	const [chartsLoaded, setChartsLoaded] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [stepFromFilter, setStepFromFilter] = useState("");
	const [shareDisabled, setShareDisabled] = useState(true);
	const [cellDataOnLoad, setCellDataOnLoad] = useState([]);
	const [cellDataOnEdit, setCellDataOnEdit] = useState([]);
	const [shallRefreshSideBar, setShallRefreshSideBar] = useState(false);
	const [loading, setLoading] = useState(false);
	const [chartLoadSpiner, setChartLoadSpiner] = useState({
		cycleIndex: false,
		timeSeries: false,
		efficiency: false,
		cycleQtyByStep: false,
		cycleQtyByStepWithCapacity: false,
	});
	const [cancelReqToken, setCancelReqToken] = useState({});
	// ======= Hooks ==========
	useEffect(() => {
		let check = true;
		Object.values(chartsLoaded).forEach((c) => {
			if (!c) {
				check = false;
			}
		});
		if (check) {
			setShareDisabled(false);
			setDisableSelection(false);
		}
	}, [chartsLoaded]);

	useEffect(() => {
		return () => {
			for (const s in cancelReqToken) {
				console.log("first");
				cancelReqToken[s].cancel();
			}
		};
	}, []);

	const { user } = useAuth(); // auth context

	const handleLoadCellIds = (checkedCellIds) => {
		console.log("handleLoadCellIds", checkedCellIds);
		setCellDataOnEdit([]);
		setCellDataOnLoad([...checkedCellIds]);
		setChartData({});
		setFilteredData({});
	};

	const handleEditCellIds = (checkedCellIds) => {
		console.log("handleEditCellIds", checkedCellIds);
		setCellDataOnEdit([...checkedCellIds]);
	};
	// ======== Refs ========
	const dashboardRef = useRef(null);
	// ========= handlers =========
	const internalServerErrorFound = (errStatus) => {
		setInternalServerError(errStatus);
	};

	const handleCellDelete = (rec) => {
		console.log("del rec", rec.cell_id);
		setShallRefreshSideBar((prev) => !prev);
	};

	const formatCode = (code) => {
		setCodeContent(code);
		setModalVisible(true);
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

	const getSearchParams = (cellIds, step) => {
		let params = new URLSearchParams();
		cellIds.forEach((cellId) => {
			params.append("cell_id", cellId.cell_id);
		});
		params.append("step", step);
		setStepFromFilter(step);
		setSearchParams(params.toString());
		return params;
	};

	// runs when api call is needed / gets cellIds from filter bar
	const handleFilterChange = (cellIds, step) => {
		if (!cellIds.length) {
			return;
		}
		let request = {
			params: getSearchParams(cellIds, step),
			headers: {
				Authorization: `Bearer ${user.iss}`,
			},
		};
		_fetchData("energyAndDecay", request);
		_fetchData("efficiency", request);
		_fetchData("cycleQtyByStep", request);
		return true;
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

	const _fetchData = (apiType, request) => {
		handleChartLoadingError(apiType, false);
		handleChartLoadSpinner(apiType, true);
		setDisableSelection(true);
		setShareDisabled(true);
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

	return (
		<div>
			{internalServerError ? (
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
						title="Cycle Test Dashboard"
						extra={<ShareButton ref={dashboardRef} shareDisabled={shareDisabled} dashboard="cycle" />}
					></PageHeader>
					<Layout hasSider>
						<SideBar
							testType="cycle-test"
							onLoadCellIds={handleLoadCellIds}
							onEditCellIds={handleEditCellIds}
							refresh={shallRefreshSideBar}
						/>
						<Layout className="site-layout" style={{ marginLeft: "auto" }}>
							<Content>
								{cellDataOnEdit && cellDataOnEdit.length ? (
									<div>
										<EditCellData cellIds={cellDataOnEdit} />
									</div>
								) : (
									<>
										<ViewCodeModal
											code={codeContent}
											modalVisible={modalVisible}
											setModalVisible={setModalVisible}
											searchParams={searchParams}
										/>
										<DashboardFilterBar
											testType="cycleTest"
											onFilterChange={handleFilterChange}
											onCellIdChange={handleCellIdChange}
											onCellDelete={handleCellDelete}
											internalServerErrorFound={internalServerErrorFound}
											disableSelection={disableSelection}
											cellData={cellDataOnLoad}
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
									</>
								)}
							</Content>
						</Layout>
					</Layout>
				</div>
			)}
		</div>
	);
};

export default DashboardCycleTest;
