import { Divider, Empty, Layout, Tabs } from "antd";
import React from "react";
import PlotterFilterbar from "./PlotterFilterbar";
import PlotterSidebar from "./PlotterSidebar";
import { PlotterProvider, usePlotter } from "../../context/PlotterContext";
import SeriesPlot from "./SeriesPlot";

const { Content } = Layout;
const { TabPane } = Tabs;

const Plotter = () => {
	const { state, action } = usePlotter();

	const handleFilterChange = (cellIds) => {
		console.log("handleFilterChange", cellIds);
	};

	const handleCellIdChange = (cellIds) => {
		console.log(cellIds);
	};

	return (
		<>
			<Layout hasSider>
				<PlotterSidebar page="plotter" />
				<Layout className="site-layout" style={{ marginLeft: "auto" }}>
					<Content>
						{state.selectedCellIds.length ? (
							<>
								<PlotterFilterbar />
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
				</Layout>
			</Layout>
		</>
	);
};

export default Plotter;
