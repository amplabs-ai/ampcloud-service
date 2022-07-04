import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0Token } from "../utility/useAuth0Token";

const UserPlanContext = createContext();

export const UserPlanProvider = ({ children }) => {
	const [userPlan, setUserPlan] = useState("");
	const accessToken = useAuth0Token();

	useEffect(() => {
		// axios
		// 	.get("/getuserplan", {
		// 		headers: {
		// 			Authorization: `Bearer ${accessToken}`,
		// 		},
		// 	})
		// 	.then(function (response) {
		// 		console.log(response);
		// 	});
		setUserPlan("beta");
	}, [accessToken]);

	return <UserPlanContext.Provider value={userPlan}>{children}</UserPlanContext.Provider>;
};

export const useUserPlan = () => {
	return useContext(UserPlanContext);
};
