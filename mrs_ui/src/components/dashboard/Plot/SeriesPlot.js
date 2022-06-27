import axios from "axios";
import { message } from "antd";
import React, { useEffect, useState } from "react";
import sourceCode from "../../../chartConfig/chartSourceCode";
import { useDebugValue } from "react/cjs/react.production.min";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth0Token } from "../../../utility/useAuth0Token";
import DashboardChart from "../../chart/DashboardChart";
import ViewCodeModal from "../../ViewCodeModal";
import PlotterInputForm from "./PlotterInputForm";
import ViewCode from "./ViewCode";

const SeriesPlot = (props) => {
const [data, setData] = useState([]);
const [filteredData, setFilteredData] = useState([]);
const [modalVisible, setModalVisible] = useState(false);

const [replaceInCode, setReplaceInCode] = useState(null);

const accessToken = useAuth0Token();
const { state, action } = useDashboard();
const [codeContent, setCodeContent] = useState("");

const [chartLoadingError, setChartLoadingError] = useState(false);
const [chartLoadSpiner, setChartLoadSpiner] = useState(false);
const [chartConfigs, setChartConfigs] = useState({
	xAxis: {
	mapToId: "",
	title: "",
	},
	yAxis: {
	mapToId: "",
	displayColMapping: {},
	},
	chartTitle:
	props.type === "timeseries" ? "TimeSeries plot" : "CycleSeries plot",
	chartId: "plotter",
	code:
	props.type === "timeseries"
		? sourceCode.plotterChart_timeSeries
		: sourceCode.plotterChart_cycleSeries,
});

useEffect(() => {
	if (data.length) {
	let checkedCellIds = state.checkedCellIds.map((c) => c.cell_id);
	setFilteredData(data.filter((d) => checkedCellIds.includes(d.id)));
	}
}, [state.checkedCellIds]);

const getLabelForXAxis = (axisName, colDisplayNames) => {
	for (const key in colDisplayNames) {
	if (axisName === colDisplayNames[key]) {
		return key;
	}
	}
	return null;
};

const getLabelForYAxis = (axisName, colDisplayNames) => {
	let displayColMap = {};
	axisName.forEach((axis) => {
	for (const key in colDisplayNames) {
		if (axis === colDisplayNames[key]) {
		displayColMap[axis] = key;
		}
	}
	});
	return displayColMap;
};

const handlePlot = (values, colDisplayNames) => {
	let [xAxisLabel, displayColMap] = [
	getLabelForXAxis(values["x-axis"], colDisplayNames),
	getLabelForYAxis(values["y-axis"], colDisplayNames),
	];
	setChartLoadSpiner(true);
	setChartLoadingError(false);
	setChartConfigs({
	...chartConfigs,
	xAxis: {
		mapToId: values["x-axis"],
		title: xAxisLabel,
	},
	yAxis: {
		mapToId: values["y-axis"],
		displayColMapping: displayColMap,
		// title: yAxisLabel,
	},
	});
	let endpoint =
	props.type === "timeseries" ? "/echarts/timeseries" : "/echarts/stats";
	let data = JSON.stringify({
	cell_ids: state.checkedCellIds.map((c) => c.cell_id),
	columns: [values["x-axis"], ...values["y-axis"]],
	filters: values.filters || [],
	});

	axios({
	method: "post",
	url: endpoint,
	headers: {
		Authorization: "Bearer " + accessToken,
		"Content-Type": "application/json",
	},
	data: data,
	})
	.then(function (response) {
		setChartLoadSpiner(false);
		console.log(response.data?.records);
		setData(response.data?.records[0]);
		setFilteredData(response.data?.records[0]);
		let replaceInCode = {
		__accesstoken__: accessToken,
		__req_data__: data,
		__xlabel__: xAxisLabel,
		__mapping__: JSON.stringify(displayColMap),
		};
		setReplaceInCode(replaceInCode);
	})
	.catch(function (error) {
		if (error.response.data.status === 400) {
		message.error(error.response.data.detail);
		message.error(error.response.data.detail);
		}
		setChartLoadSpiner(false);
		setChartLoadingError(true);
		setData([]);
		setFilteredData([]);
		console.log(error);
		setReplaceInCode(null);
		setCodeContent("");
	});
};

const handlePlotReset = () => {
	setData([]);
	setFilteredData([]);
	setChartLoadingError(false);
};

const doShowCode = (code) => {
	setCodeContent(filteredData.length ? code : "");
	setModalVisible(true);
};

return (
	<div className="row">
	<div className="col-md-3" style={{ overflow: "auto" }}>
		<PlotterInputForm
		type={props.type}
		onPlot={handlePlot}
		onPlotReset={handlePlotReset}
		/>
	</div>
	<div className="col-md-9">
		<div className="p-2 pt-0">
		<ViewCode
			code={codeContent}
			toReplace={replaceInCode}
			modalVisible={modalVisible}
			setModalVisible={setModalVisible}
		/>
		<DashboardChart
			data={filteredData}
			chartName={JSON.stringify(chartConfigs)}
			chartLoadingError={chartLoadingError}
			shallShowLoadSpinner={chartLoadSpiner}
			formatCode={doShowCode}
			usage="plotter"
		/>
		{/* <PlotlyExample data={filteredData} /> */}
		</div>
	</div>
	</div>
);
};

export default SeriesPlot;
