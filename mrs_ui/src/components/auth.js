import { useState, createContext, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(Cookies.get("userId"));

	const login = (user) => {
		setUser(user);
	};

	const logout = () => {
		Cookies.remove("userId");
		axios.get("http://localhost:4000/logout").then((res) => {
			console.log("logout", res);
		});
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => {
	return useContext(AuthContext);
};
