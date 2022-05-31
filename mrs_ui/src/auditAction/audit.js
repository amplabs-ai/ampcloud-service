import axios from "axios";
export const audit = (action, token) => {
	console.log("audit", action);
	axios
		.get(`/dashboard/audit?action=${action}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then((r) => console.log(r))
		.catch((err) => console.log(err));
};
