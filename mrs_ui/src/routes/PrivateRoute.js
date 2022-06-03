import React, { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

const PrivateRoute = ({ children }) => {
	const { user } = useAuth0();
	const location = useLocation();

	if (!user.isLoggedIn) {
		return <Navigate to="/" replace state={{ from: location.pathname }} />;
	}
	return children;
};

export default PrivateRoute;
