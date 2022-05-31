import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

const RedirectRoute = ({ children }) => {
	const { user } = useAuth();
	const location = useLocation();

	if (user.isLoggedIn && !location.state?.from) {
		return (
			<>
				<Navigate to="/dashboard" replace />
			</>
		);
	} else {
		return <>{children}</>;
	}
};

export default RedirectRoute;
