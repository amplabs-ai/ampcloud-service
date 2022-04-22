const initialChartOptions = {
	tooltip: {
		trigger: "axis",
		axisPointer: { type: "cross" },
	},
	animation: false,
	grid: {
		width: "95%",
		height: "70%",
		left: "3%",
		right: "4%",
		bottom: "15%",
		containLabel: true,
	},
	// async loading...
	toolbox: {
		itemSize: 20,
		itemGap: 15,
		right: "20",
		bottom: "84%",
		// feature: {
		// saveAsImage: {},
		// myTool: {
		// 	show: true,
		// 	title: "View Code",
		// 	icon: "image://https://img.icons8.com/color-glass/48/000000/code.png",
		// 	onclick: function () {

		// 	},
		// },
		// viewCode: {
		// 	show: true,
		// 	title: "View Code",
		// 	icon: "image://https://img.icons8.com/color-glass/48/000000/code.png",
		// 	onclick: function () {
		// 		alert("myToolHandler2");
		// 	},
		// },
		// },
	},
	dataset: [],
};

export default initialChartOptions;
