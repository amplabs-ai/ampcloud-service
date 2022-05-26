import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/auth";

const PrivateRoute = ({ children }) => {
	const { user } = useAuth();
	if (!user.isLoggedIn) {
		return <Navigate to="/" />;
	}
	return children;
};

export default PrivateRoute;
