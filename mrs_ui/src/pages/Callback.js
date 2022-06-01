import React from "react";
import LandingPage from "./LandingPage";
import RedirectRoute from "../routes/RedirectRoute";
import { Navigate, useParams } from "react-router-dom";

const Callback = () => {
	let { redirectstate } = useParams();
	console.log("callback redirectstate", redirectstate);

	if (redirectstate) {
		return <Navigate to={redirectstate} replace />;
	}

	return (
		<RedirectRoute>
			<LandingPage />
		</RedirectRoute>
	);
};

export default Callback;
