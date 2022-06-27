import { Divider, Empty, Layout, Tabs } from "antd";
import React from "react";
import PlotterFilterbar from "./PlotterFilterbar";
import SeriesPlot from "./SeriesPlot";
import { useDashboard } from "../../../context/DashboardContext";

const { Content } = Layout;
const { TabPane } = Tabs;

const Plotter = () => {
	const { state, action } = useDashboard();

	const handleCellIdChange = (cellIds) => {
		action.setCheckedCellIds(cellIds);
	};

	return (
		<>
			<div className="m-2 p-2 card shadow">

				<Content>
					{state.selectedCellIds.length ? (
						<>
							<PlotterFilterbar onCellIdChange={handleCellIdChange} />
							<div className="card shadow p-3">
								<SeriesPlot type="timeseries" />
								<SeriesPlot type="cycleseries" />
							</div>
						</>
					) : (
						<div className="d-flex justify-content-center align-items-center" style={{ height: "85vh" }}>
							<Empty description={<span>No Data Loaded</span>} />
						</div>
					)}
				</Content>
			</div>
		</>
	);
};

export default Plotter;
