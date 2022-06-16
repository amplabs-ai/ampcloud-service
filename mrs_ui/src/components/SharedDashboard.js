import React from "react";
import { useParams } from "react-router-dom";
import { DashboardProvider } from "../context/DashboardContext";
import Dashboard from "./dashboard/Dashboard";

const SharedDashboard = (props) => {
	let { id } = useParams();

	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1rem" }}>
				<Dashboard dashboardId={id} type="shared" />
			</div>
		</DashboardProvider>
	);
};

export default SharedDashboard;
