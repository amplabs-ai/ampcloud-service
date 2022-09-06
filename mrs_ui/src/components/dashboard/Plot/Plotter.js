import { Button, Divider, Empty, Layout, Tabs } from "antd";
import React, { useState } from "react";
import PlotterFilterbar from "./PlotterFilterbar";
import SeriesPlot from "./SeriesPlot";
import { useDashboard } from "../../../context/DashboardContext";
import DefaultDashboard from "../DefaultDashboard";

const { Content } = Layout;
const { TabPane } = Tabs;

const Plotter = () => {
	const { state, action } = useDashboard();
	const [timeSeriesPlot, setTimeSeriesPlot] = useState([{}]);
	const [cycleSeriesPlot, setCycleSeriesPlot] = useState([{}]);

	const handleCellIdChange = (cellIds) => {
		action.setCheckedCellIds(cellIds);
	};
	const handleAddTimeSeries = () => {
		const values = [...timeSeriesPlot];
		values.push({});
		setTimeSeriesPlot(values);
	};
	const handleRemoveTimeSeries = index => {
		const values = [...timeSeriesPlot];
		values.splice(index, 1);
		setTimeSeriesPlot(values);
	};
	const handleAddCycleSeries = () => {
		const values = [...cycleSeriesPlot];
		values.push({});
		setCycleSeriesPlot(values);
	};
	const handleRemoveCycleSeries = index => {
		const values = [...cycleSeriesPlot];
		values.splice(index, 1);
		setCycleSeriesPlot(values);
	};
	return (
		<>
			<div className="m-2 p-2 card shadow">

				<Content>
					{state.selectedCellIds.length ? (
						<>

							{/* <PlotterFilterbar onCellIdChange={handleCellIdChange} /> */}
							<div className="card shadow p-3 col-md-12">

								<div className="col-12 ">

									<Button type="primary" className="me-4" style={{ float: "right" }} onClick={() => handleAddTimeSeries()}>Add</Button>
									{timeSeriesPlot.map((timeSeries, index) => (
										<>
											<Button type="primary" className="me-4" style={{ float: "right" }} disabled={index === 0} onClick={() => handleRemoveTimeSeries(index)} danger>{index === 0 ? null : "Close"}</Button>
											<div className="col-md-12 row pt-2">
												<SeriesPlot type="timeseries" value={timeSeries} />
											</div>
										</>
									))}
								</div>
							</div>
							<div className="card shadow p-4 col-md-12">
								<div className="col-12 ">
									<Button type="primary" className="me-4 " style={{ float: "right" }} onClick={() => handleAddCycleSeries()}>Add</Button>
									{cycleSeriesPlot.map((cycleSeries, index) => (
										<>
											<Button type="primary" className="me-4" style={{ float: "right" }} disabled={index === 0} onClick={() => handleRemoveCycleSeries(index)} danger>{index === 0 ? null : "Close"}</Button>
											<div className="col-md-12 row pt-2">
												<SeriesPlot type="cycleseries" value={cycleSeries} />
											</div>
										</>
									))}
								</div>
							</div>
						</>
					) : (
						<DefaultDashboard />
					)}
				</Content>
			</div>
		</>
	);
};

export default Plotter;
