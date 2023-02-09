import axios from "axios";
import message from "antd/es/message";
import React, { useEffect, useState } from "react";
import sourceCode from "../../../chartConfig/chartSourceCode";
import { useDashboard } from "../../../context/DashboardContext";
import { useAuth0Token } from "../../../utility/useAuth0Token";
import DashboardChart from "../../chart/DashboardChart";
import PlotterInputForm from "./PlotterInputForm";
import ViewCode from "./ViewCode";
import pako from "pako";


const SeriesPlot = (props) => {
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [reqData, setReqData] = useState({})
	const [replaceInCode, setReplaceInCode] = useState(null);

	const accessToken = useAuth0Token();
	const { state} = useDashboard();
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
			props.type === "cycle_timeseries" ? "Complete Cycle" : props.type === "abuse_timeseries" ? "Abuse Timeseries" : "Cycle Summary",
		chartId: "plotter",
		code:
			props.type.includes("timeseries")
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
			},
		});
		let endpoint =
			props.type === "cycle_timeseries" ? "/echarts/cycle/timeseries" : props.type === "abuse_timeseries" ? "/echarts/abuse/timeseries" : "/echarts/stats";
		let data = {
			cell_ids: state.checkedCellIds.map((c) => c.cell_id),
			columns: [values["x-axis"], ...values["y-axis"]],
			filters: values.filters || [],
		};
		axios({
			method: "post",
			url: endpoint,
			headers: {
				Authorization: "Bearer " + accessToken,
				"Content-Type": "application/json",
			},
			data: JSON.stringify(data),
		})
		.then((result) => {
			axios({
				method: "get",
				url: result.data.response_url,
				responseType:"arraybuffer",
				headers: {
					"Content-Type": "application/json",
			},
			})
	  .then((result) => {
		let response = pako.inflate(result.data)
		response = new TextDecoder().decode(response);
		response = JSON.parse(response.replace(/\bNaN|Infinity|-Infinity\b/g, "null"))
				setReqData(data)
				// response.data = typeof response.data == "string" ? JSON.parse(response.data.replace(/\bNaN\b/g, "null")) : response.data;
				setChartLoadSpiner(false);
				setData(response?.records[0]);
				setFilteredData(response?.records[0]);
				let replaceInCode = {
					__accesstoken__: accessToken,
					__req_data__: JSON.stringify(data),
					__xlabel__: xAxisLabel,
					__mapping__: JSON.stringify(displayColMap),
					__endpoint__: endpoint,
				};
				setReplaceInCode(replaceInCode);
			})})
			.catch(function (error) {
				if (error.response.data.status === 400) {
					message.error(error.response.detail);
					message.error(error.response.detail);
				}
				setChartLoadSpiner(false);
				setChartLoadingError(true);
				setData([]);
				setFilteredData([]);
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
		<>
			<div className="row" >
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
							reqData={reqData}
						/>
					</div>
				</div>
			</div>
		</>
	);
};

export default SeriesPlot;
