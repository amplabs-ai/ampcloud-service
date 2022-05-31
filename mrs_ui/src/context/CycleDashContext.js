import { useState, createContext, useContext } from "react";
const CycleDashContext = createContext();

export const CycleDashProvider = ({ children }) => {
	const [test, setTest] = useState(null);
	return <CycleDashContext.Provider value={{ test, setTest }}>{children}</CycleDashContext.Provider>;
};

export const useDash = () => {
	return useContext(CycleDashContext);
};
