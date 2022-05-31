import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/auth";

const PrivateRoute = ({ children }) => {
	const { user } = useAuth();
	const location = useLocation();

	if (!user.isLoggedIn) {
		return <Navigate to="/" replace state={{ from: location.pathname }} />;
	}
	return children;
};

export default PrivateRoute;
