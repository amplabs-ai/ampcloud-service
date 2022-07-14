import { useState, createContext, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { Spin } from "antd";
import { useLocation } from "react-router-dom";

const AccessTokenContext = createContext();

export const AccessTokenContextProvider = ({ children }) => {
	const { getAccessTokenSilently, isLoading, isAuthenticated } = useAuth0();
	const [accessToken, setAccessToken] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				const token = await getAccessTokenSilently();
				setAccessToken(token);
			} catch (error) {
				console.error(error);
			}
		})();
	}, [getAccessTokenSilently]);

	return <AccessTokenContext.Provider value={{ accessToken }}>{children}</AccessTokenContext.Provider>;
};

export const useAccessToken = () => {
	return useContext(AccessTokenContext);
};
