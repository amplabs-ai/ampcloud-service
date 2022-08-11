const initialChartOptions = {
	tooltip: {
		trigger: "axis",
		axisPointer: { type: "cross" },
		// showContent: false,
	},
	// animation: false,
	// grid: {
	// 	width: "95%",
	// 	height: "70%",
	// 	left: "3%",
	// 	right: "4%",
	// 	bottom: "15%",
	// 	containLabel: true,
	// },
	grid: {
		left: window.screen.width < 600 ? "8%" : "5%",
		right: window.screen.width < 600 ? "5%" : "5%",
		bottom: window.screen.width < 600 ? "16%" : "13%",
		containLabel: true,
	},
	toolbox: {
		itemSize: window.screen.width < 600 ? 16 : 20,
		// itemGap: 15,
		// right: "20",
		// bottom: "84%",
		top: window.screen.width < 600 ? "6%" : "5%",
	},
	dataset: [],
};

const scatterPlotChartId = [
	"timeSeries",
	"plotter",
]

export { initialChartOptions, scatterPlotChartId };
