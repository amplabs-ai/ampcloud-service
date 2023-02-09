import React from "react";
import { useParams } from "react-router-dom";
import { DashboardProvider } from "../context/DashboardContext";
import Dashboard from "./dashboard/Dashboard";

const SharedDashboard = (props) => {
	let { id, type } = useParams();
	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1rem" }}>
				<Dashboard dashboardId={id} type={`${type}_shared`} />
			</div>
		</DashboardProvider>
	);
};

export default SharedDashboard;
