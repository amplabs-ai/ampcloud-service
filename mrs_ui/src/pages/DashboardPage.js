import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { CycleDashProvider } from "../context/CycleDashContext";
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
	}, [location]);

	return (
		<div style={{ paddingTop: "1rem" }}>
			{pageType === "cycle-test" ? (
				<CycleDashProvider>
					<DashboardCycleTest />
				</CycleDashProvider>
			) : pageType === "abuse-test" ? (
				<DashboardAbuseTest />
			) : (
				""
			)}
		</div>
	);
};

export default DashboardPage;
