const axios = require("axios");
const MockAdapter = require("axios-mock-adapter");

// This sets the mock adapter on the default instance
const mock = new MockAdapter(axios);

// mock.restore();

// data endpoints
mock
	.onGet("/api/data/repo_hierarchy")
	.reply(200, require("./fixtures/repo_hierarchy.json"));
mock
	.onGet("/api/data/amount_of_repos")
	.reply(200, require("./fixtures/open_source_vs_ep_repos.json"));
mock
	.onGet("/api/data/device_percentage")
	.reply(200, require("./fixtures/device_percentage.json"));

// dashboard list endpoint
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
