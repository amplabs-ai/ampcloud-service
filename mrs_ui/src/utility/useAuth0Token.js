import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";

export const useAuth0Token = () => {
	const { getAccessTokenSilently } = useAuth0();
	const [token, setToken] = useState(null);
	useEffect(() => {
		(async () => {
			try {
				const accessToken = await getAccessTokenSilently();
				setToken(accessToken);
			} catch (error) {
				console.error(error);
				setToken(undefined);
			}
		})();
	}, []);

	return token;
};
