import { useState, createContext, useContext, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";

const AccessTokenContext = createContext();

export const AccessTokenContextProvider = ({ children }) => {
	const { getAccessTokenSilently } = useAuth0();
	const [accessToken, setAccessToken] = useState(null);

	useEffect(() => {
		(async () => {
			try {
				const token = await getAccessTokenSilently();
				console.log("token", token);
				setAccessToken(token);
			} catch (error) {
				console.log(error);
			}
		})();
	}, []);

	return <AccessTokenContext.Provider value={{ accessToken }}>{children}</AccessTokenContext.Provider>;
};

export const useAccessToken = () => {
	return useContext(AccessTokenContext);
};
