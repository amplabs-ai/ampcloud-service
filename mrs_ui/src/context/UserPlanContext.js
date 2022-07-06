import { Spin } from "antd";
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth0Token } from "../utility/useAuth0Token";

const UserPlanContext = createContext();

export const UserPlanProvider = ({ children }) => {
	const [userPlan, setUserPlan] = useState("");
	const accessToken = useAuth0Token();

	useEffect(() => {
		if (accessToken) {
			axios
				.get("/user/get_user_plan", {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				})
				.then(function (response) {
					let res = response?.data?.records[0][0]
					if (res) {
						setUserPlan(res.plan_type);
					}
				})
				.catch((err) => {
					console.log('get user plan err', err)
				});
		}
	}, [accessToken]);

	// if (!userPlan) {
	// 	return (<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
	// 		<Spin size="large" />
	// 	</div>)
	// }

	return <UserPlanContext.Provider value={userPlan}>{children}</UserPlanContext.Provider>;
};

export const useUserPlan = () => {
	return useContext(UserPlanContext);
};
