const initialChartOptions = {
	animation: false,
	// animation: false,
	grid: {
		left: "15%",
		right: "10%",
		bottom: "18%",
		// containLabel: true,
	},
	// grid: {
	// 	left: window.screen.width < 600 ? "8%" : "5%",
	// 	right: window.screen.width < 600 ? "5%" : "5%",
	// 	bottom: window.screen.width < 600 ? "16%" : "13%",
	// 	containLabel: true,
	// },
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
	"energyDensity",
	"capacity",
	"operatingPotential",
	"coulombicEfficiency"
];

const initialChartFilters = {
	capacityRetention: [{ column: null, operation: null, filterValue: null }],
	coulombicEfficiency: [{ column: null, operation: null, filterValue: null }],
	differentialCapacity: [
		{ column: "reduction_factor", operation: "=", filterValue: "15" },
		{ column: "cycle_index", operation: "%", filterValue: "1" },
	],
	galvanostaticPlot: [{ column: "cycle_index", operation: "%", filterValue: "1" }],
	voltageTime: [{ column: "test_datapoint_ordinal", operation: "%", filterValue: "100" }],
	currentTime: [{ column: "test_datapoint_ordinal", operation: "%", filterValue: "100" }],
	energyDensity: [{ column: null, operation: null, filterValue: null }],
	capacity: [{ column: null, operation: null, filterValue: null }],
	operatingPotential: [{ column: null, operation: null, filterValue: null }],
};
export { initialChartOptions, scatterPlotChartId, initialChartFilters };
