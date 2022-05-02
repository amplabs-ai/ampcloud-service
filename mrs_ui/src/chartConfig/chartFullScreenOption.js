const enterFullscreenOption = {
	grid: {
		left: window.screen.width < 600 ? "8%" : "5%",
		right: window.screen.width < 600 ? "5%" : "5%",
		bottom: window.screen.width < 600 ? "16%" : "10%",
	},
	toolbox: {
		top: "0%",
		emphasis: {
			iconStyle: {
				textPosition: "bottom",
			},
		},
	},
};

const exitFullscreenOption = {
	grid: {
		left: window.screen.width < 600 ? "8%" : "5%",
		right: window.screen.width < 600 ? "5%" : "5%",
		bottom: window.screen.width < 600 ? "16%" : "12%",
		containLabel: true,
	},
	toolbox: {
		top: window.screen.width < 600 ? "8%" : "5%",
		emphasis: {
			iconStyle: {
				textPosition: "top",
			},
		},
	},
};

export { enterFullscreenOption, exitFullscreenOption };
