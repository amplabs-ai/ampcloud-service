import React from "react";
import Dashboard from "../components/dashboard/Dashboard";
import { DashboardProvider } from "../context/DashboardContext";

const DashboardPage = () => {
	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1.1rem" }}>
				<Dashboard />
			</div>
		</DashboardProvider>
	);
};

export default DashboardPage;
