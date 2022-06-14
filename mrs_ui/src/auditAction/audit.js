import axios from "axios";
export const audit = (action, token) => {
	axios
		.get(`/dashboard/audit?action=${action}`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		})
		.then(() => {})
		.catch((err) => console.err(err));
};
