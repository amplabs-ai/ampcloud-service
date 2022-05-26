import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const RedirectRoute = ({ children }) => {
	const { user } = useAuth();
	if (user.isLoggedIn) {
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
