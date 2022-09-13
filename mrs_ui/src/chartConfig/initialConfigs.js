const initialChartOptions = {
	animation: false,
	tooltip: [{
		trigger: "axis",
		axisPointer: { type: "cross" },
		triggerOn: "click",
		valueFormatter: (value) => value.toExponential(4),
		// showContent: false,
	}],
	// animation: false,
	// grid: {
	// 	width: "95%",
	// 	height: "70%",
	// 	left: "3%",
	// 	right: "4%",
	// 	bottom: "15%",
	// 	containLabel: true,
	// },
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
	"timeSeries",
	"plotter",
	"capacityRetention",
	"coulombicEfficiency",
	"differentialCapacity",
	"galvanostaticPlot",
]

const initialChartFilters = {
	capacityRetention: [{ column: null, operation: null, filterValue: null }],
	coulombicEfficiency: [{ column: null, operation: null, filterValue: null }],
	differentialCapacity: [{ column: 'reduction_factor', operation: '=', filterValue: '10' },{ column: 'test_datapoint_ordinal', operation: '%', filterValue: '10' }, { column: 'cycle_index', operation: '%', filterValue: '100' }],
	galvanostaticPlot: [{ column: 'cycle_index', operation: '%', filterValue: '100' }],
	voltageTime: [{ column: 'test_datapoint_ordinal', operation: '%', filterValue: '100' }],
	currentTime: [{ column: 'test_datapoint_ordinal', operation: '%', filterValue: '100' }],
	energyDensity: [{ column: 'cycle_index', operation: '%', filterValue: '100' }]
}
export { initialChartOptions, scatterPlotChartId, initialChartFilters };
