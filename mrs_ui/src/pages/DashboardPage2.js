import React from "react";
import Dashboard2 from "../components/dashboard/Dashboard2";
import { DashboardProvider } from "../context/DashboardContext";

const DashboardPage2 = () => {
	return (
		<DashboardProvider>
			<div style={{ paddingTop: "1.1rem" }}>
				<Dashboard2 />
			</div>
		</DashboardProvider>
	);
};

export default DashboardPage2;
