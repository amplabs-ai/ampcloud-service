import React from "react";
import { useLocation } from "react-router-dom";
import Dashboard from "../components/dashboard/Dashboard";
import { DashboardProvider } from "../context/DashboardContext";

const DashboardPage = () => {
	const location = useLocation();
	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1.1rem" }}>
			<Dashboard type={location.pathname === "/dashboard/cycle" ? "cycle" : "abuse"} />
			</div>
		</DashboardProvider>
	);
};

export default DashboardPage;
