import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import DashboardAbuseTest from "./DashboardAbuseTest";
import DashboardCycleTest from "./DashboardCycleTest";

const DashboardPage = () => {
	const location = useLocation();
	const [pageType, setPageType] = useState("");

	useEffect(() => {
		console.log("uploadsadasdasd", location);
		if (location.pathname === "/dashboard/abuse-test") {
			setPageType("abuse-test");
		} else if (location.pathname === "/dashboard/cycle-test" || location.pathname === "/dashboard") {
			setPageType("cycle-test");
		}
	}, [location.pathname]);

	return (
		<div style={{ paddingTop: "4rem" }}>
			{pageType === "cycle-test" ? <DashboardCycleTest /> : <DashboardAbuseTest />}
		</div>
	);
};

export default DashboardPage;
