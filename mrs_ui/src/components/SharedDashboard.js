import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import DashboardAbuseTest from "../pages/DashboardAbuseTest";
import DashboardCycleTest from "../pages/DashboardCycleTest";

const SharedDashboard = (props) => {
	let { id, test } = useParams();

	useEffect(() => {
		console.log("/share", id, test);
	}, []);

	return (
		<div style={{ paddingTop: "1rem" }}>
			{test === "cycle" ? (
				<DashboardCycleTest dashboardId={id} type="shared" />
			) : test === "abuse" ? (
				<DashboardAbuseTest />
			) : (
				""
			)}
		</div>
	);
};

export default SharedDashboard;
