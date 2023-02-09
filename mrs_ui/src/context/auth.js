import { useState, createContext, useContext, useEffect } from "react";
import Spin from "antd/es/spin";
import { Magic } from "magic-sdk";
import { OAuthExtension } from "@magic-ext/oauth";
import { useLocation } from "react-router-dom";

const magic = new Magic(process.env.REACT_APP_PK_KEY, {
	testMode: false, //process.env.REACT_APP_ENV === "production" ? false : true,
	extensions: [new OAuthExtension()],
});
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState({ isLoggedIn: null });
	const [loading, setLoading] = useState(true);
	const [avatar, setAvatar] = useState(null);
	const location = useLocation();

	useEffect(() => {
		const validateUser = async () => {
			try {
				if (location.pathname.includes(`/callback`)) {
					try {
						const result = await magic.oauth.getRedirectResult();
						setAvatar(result.oauth.userInfo.profile ? result.oauth.userInfo.profile : result.oauth.userInfo.picture);
					} catch (error) {
						console.error(error);
					}
				}
				await checkUser(setUser);
				setLoading(false);
			} catch (error) {
				console.error(error);
			}
		};
		validateUser();
	}, []);

	const checkUser = async (cb) => {
		const isLoggedIn = await magic.user.isLoggedIn();
		if (isLoggedIn) {
			const user = await magic.user.getMetadata();
			return cb({
				isLoggedIn: true,
				email: user.email,
				iss: user.issuer,
				// process.env.REACT_APP_ENV === "production"
				// 	? user.issuer
				// 	: "did:ethr:0x272BDa85e8323e85644ceDFB08D1344206B85e1E",
			}); // replace with user.issuer
		}
		return cb({ isLoggedIn: false });
	};

	const login = async (email) => {
		await magic.auth.loginWithMagicLink({
			email: email, //process.env.REACT_APP_ENV === "production" ? email : "test+success@magic.link",
			redirectURI: "http://localhost:3000",
		});
		await checkUser(setUser);
	};

	const loginWithSocial = async (redirectRoute, platform) => {
		const didToken = await magic.oauth.loginWithRedirect({
			provider: platform,
			redirectURI: `${window.location.origin}/callback/${redirectRoute ? encodeURIComponent(redirectRoute) : ""}`,
		});
	};

	const logout = async () => {
		await magic.user.logout();
		await checkUser(setUser);
	};

	if (loading) {
		return (
			<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
				<Spin size="large" />
			</div>
		);
	}

	return (
		<AuthContext.Provider value={{ user, avatar, login, logout, loginWithSocial }}>{children}</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
