import axios from "axios";
export const audit = (action, token) => {
	console.log("audit", action);
	axios
		.get(`/dashboard/audit?action=${action}`)
		.then((r) => console.log(r))
		.catch((err) => console.log(err));
};
