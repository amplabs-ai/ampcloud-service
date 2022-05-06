import { useState, createContext, useContext } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import { useSearchParams } from "react-router-dom";

const AuthContext = createContext(null);

const validateEmail = (input) => {
	let validRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
	if (input.match(validRegex)) {
		return true;
	} else {
		return false;
	}
};

export const AuthProvider = ({ children }) => {
	const [searchParams] = useSearchParams();
	const [user, setUser] = useState(() => {
		if ([...searchParams].length) {
			let mail = searchParams.get("mail");
			if (mail && validateEmail(mail)) {
				Cookies.set("userId", mail);
				return mail;
			}
		}
		return Cookies.get("userId");
	});

	const login = (user) => {
		setUser(user);
	};

	const logout = () => {
		axios.get("/logout").then((res) => {
			console.log("logout", res);
		});
		Cookies.remove("userId");
		setUser(null);
	};

	return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
	return useContext(AuthContext);
};
