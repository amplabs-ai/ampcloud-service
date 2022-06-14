import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { DashboardProvider } from "../context/DashboardContext";
import DashboardCycleTest from "../pages/DashboardCycleTest";
import Dashboard2 from "./dashboard/Dashboard2";

const SharedDashboard = (props) => {
	let { id } = useParams();

	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1rem" }}>
				{/* <DashboardCycleTest dashboardId={id} type="shared" /> */}
				<Dashboard2 dashboardId={id} type="shared" />
			</div>
		</DashboardProvider>
	);
};

export default SharedDashboard;
