const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");
const mock = new MockAdapter(axios);
mock.onGet("/api/dashboard-list").reply(200, [
	{
		path: "repo_dash_config",
		title: "Org Repository Insights",
		description:
			"The org repository insights dashboard contains data about the organization's current branch hierarchy, a stacked line graph comparison of open-source vs enterprise repositories, and a radial line graph comparing total devices to enterprise managed devices that contain codebase from the organization.",
	},
]);

// upload file progress test
const sleep = (value) => new Promise((resolve) => setTimeout(resolve, value));
mock.onPost("/upload").reply(async (config) => {
	const total = 1024; // mocked file size
	for (const progress of [0, 0.2, 0.4, 0.6, 0.8, 1]) {
		await sleep(500);
		if (config.onUploadProgress) {
			config.onUploadProgress({
				0: { loaded: total * progress, total },
				1: { loaded: total * progress, total },
				2: { loaded: total * progress, total },
			});
		}
	}
	return [200, null];
});

// dashboard endpoints
mock
	.onGet("/api/dashboard/repo_dash_config")
	.reply(200, require("./fixtures/dashboard_data.json"));
