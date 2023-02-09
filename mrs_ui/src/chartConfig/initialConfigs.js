const initialChartOptions = {
	animation: false,
	grid: {
		left: "15%",
		right: "10%",
		bottom: "18%",
	},
	toolbox: {
		itemSize: window.screen.width < 600 ? 16 : 20,
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
	forceDisplacement: [{ column: null, operation: null, filterValue: null }],
	testTemperature: [{ column: null, operation: null, filterValue: null }],
	testVoltage: [{ column: null, operation: null, filterValue: null }],
};
export { initialChartOptions, scatterPlotChartId, initialChartFilters };
