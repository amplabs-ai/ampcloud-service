import { useState, createContext, useContext, useEffect } from "react";
import { Spin } from "antd";
import { Magic } from "magic-sdk";

const magic = new Magic(process.env.REACT_APP_PK_KEY);
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState({ isLoggedIn: null });
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const validateUser = async () => {
			try {
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
			console.log("user magic", user);
			return cb({ isLoggedIn: true, email: user.email, iss: user.issuer });
		}
		return cb({ isLoggedIn: false });
	};

	const login = async (email) => {
		await magic.auth.loginWithMagicLink({ email });
		await checkUser(setUser);
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

	return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};
