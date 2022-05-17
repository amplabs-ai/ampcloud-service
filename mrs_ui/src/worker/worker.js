//dashboardFilter.worker.js
// eslint-disable-next-line import/no-anonymous-default-export
export default () => {
	// eslint-disable-next-line no-restricted-globals
	self.onmessage = (message) => {
		console.log("message", message);
		let { chartData, selectedCellIds } = message.data;
		const _checkCellIdInSeries = (c, selectedCellIds) => {
			let flag = false;
			for (let i = 0; i < selectedCellIds.length; i++) {
				// flag = c.id.includes(selectedCellIds[i].cell_id);
				flag = c.cell_id === selectedCellIds[i].cell_id;
				if (flag) {
					return true;
				}
			}
			return flag;
		};
		let filteredChartData = {};
		for (const chartName in chartData) {
			if (Object.hasOwnProperty.call(chartData, chartName)) {
				let chart = chartData[chartName];
				let filteredChart = chart.filter((c) => {
					return _checkCellIdInSeries(c, selectedCellIds);
				});
				filteredChartData[chartName] = filteredChart;
				// filteredChartData = { ...filteredChartData, [chartName]: filteredChart };
			}
		}
		postMessage(filteredChartData);
	};
};
