import { useAuth0 } from "@auth0/auth0-react";
import { Spin } from "antd";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0Token } from "../utility/useAuth0Token";

const UserPlanContext = createContext();

export const UserPlanProvider = ({ children }) => {
	const [userPlan, setUserPlan] = useState("");
	const accessToken = useAuth0Token();

	const auth0 = useAuth0();

	useEffect(() => {
		if (!accessToken) return;
		axios
			.get("/user/get_user_plan", {
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then(function (response) {
				let res = response?.data?.records[0][0];
				if (res) {
					setUserPlan(res.plan_type);
				}
			})
			.catch((err) => {});
	}, [accessToken]);

	return <UserPlanContext.Provider value={userPlan}>{children}</UserPlanContext.Provider>;
};

export const useUserPlan = () => {
	return useContext(UserPlanContext);
};
