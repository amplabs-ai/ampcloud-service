//fibo.worker.js
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
	// eslint-disable-next-line no-restricted-globals
	self.onmessage = (message) => {
		console.time("worker performance");
		// const { chartData, selectedCellIds } = message.data;

		// let filteredChartData = {};
		// for (const chartName in chartData) {
		// 	if (Object.hasOwnProperty.call(chartData, chartName)) {
		// 		let chart = chartData[chartName];
		// 		let filteredChart = chart.filter((c) => {
		// 			let flag = false;
		// 			for (let i = 0; i < selectedCellIds.length; i++) {
		// 				flag = c.id.includes(selectedCellIds[i].cell_id);
		// 				if (flag) {
		// 					return true;
		// 				}
		// 			}
		// 			return flag;
		// 		});
		// 		filteredChartData = { ...filteredChartData, [chartName]: filteredChart };
		// 	}
		// }

		for (let i = 0; i < 10000000000; i++) {}
		console.timeEnd("worker performance");

		postMessage("filteredChartData");
	};
};
