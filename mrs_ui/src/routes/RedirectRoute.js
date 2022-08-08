import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { Spin } from "antd";

const RedirectRoute = ({ children }) => {
	const { isAuthenticated, isLoading } = useAuth0();

	if (isLoading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
				<Spin size="large" />
			</div>
		);
	}
	if (isAuthenticated) {
		localStorage.removeItem('pop_status')
		return (
			<>
				<Navigate to="/dashboard" replace />
			</>
		);
	}
	return <>{children}</>;
};

export default RedirectRoute;
