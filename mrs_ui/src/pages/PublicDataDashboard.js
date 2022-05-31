import React from "react";
import DashboardCycleTest from "./DashboardCycleTest";

const PublicDataDashboard = () => {
	// dashboard types: 1. private 2. public 3. shared
	return (
		<div style={{ paddingTop: "1rem" }}>
			<DashboardCycleTest type="public"/>
		</div>
	);
};

export default PublicDataDashboard;