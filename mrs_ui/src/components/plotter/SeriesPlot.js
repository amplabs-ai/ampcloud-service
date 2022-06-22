import axios from "axios";
import React, { useEffect, useState } from "react";
import sourceCode from "../../chartConfig/chartSourceCode";
import { usePlotter } from "../../context/PlotterContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import DashboardChart from "../chart/DashboardChart";
import ViewCodeModal from "../ViewCodeModal";
import PlotlyExample from "./PlotlyExample";
import PlotterInputForm from "./PlotterInputForm";
import ViewCode from "./ViewCode";

const SeriesPlot = (props) => {
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);

	const [replaceInCode, setReplaceInCode] = useState(null);

	const accessToken = useAuth0Token();
	const { state, action } = usePlotter();
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
			title: "",
		},
		chartTitle: props.type === "timeseries" ? "TimeSeries plot" : "CycleSeries plot",
		chartId: "plotter",
		code: props.type === "timeseries" ? sourceCode.plotterChart_timeSeries : sourceCode.plotterChart_cycleSeries,
	});

	useEffect(() => {
		if (data.length) {
			let checkedCellIds = state.checkedCellIds.map((c) => c.cell_id);
			setFilteredData(data.filter((d) => checkedCellIds.includes(d.id)));
		}
	}, [state.checkedCellIds]);

	const getLabelForAxis = (axisName, colDisplayNames) => {
		for (const key in colDisplayNames) {
			if (axisName === colDisplayNames[key]) {
				return key;
			}
		}
		return null;
	};

	const handlePlot = (values, colDisplayNames) => {
		let [xAxisLabel, yAxisLabel] = [
			getLabelForAxis(values["x-axis"], colDisplayNames),
			getLabelForAxis(values["y-axis"], colDisplayNames),
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
				title: yAxisLabel,
			},
		});
		let endpoint = props.type === "timeseries" ? "/echarts/timeseries" : "/echarts/stats";
		let data = JSON.stringify({
			cell_ids: state.checkedCellIds.map((c) => c.cell_id),
			columns: [values["x-axis"], values["y-axis"]],
			filters: values.filters?.map((f) => Object.values(f).join("")) || [],
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
					__req_data__: data,
					__col_labels__: {},
				};
				replaceInCode.__col_labels__[values["x-axis"]] = xAxisLabel;
				replaceInCode.__col_labels__[values["y-axis"]] = yAxisLabel;
				replaceInCode.__col_labels__ = JSON.stringify(replaceInCode.__col_labels__);
				replaceInCode.__accessToken__ = accessToken;
				setReplaceInCode(replaceInCode);
			})
			.catch(function (error) {
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
				<PlotterInputForm type={props.type} onPlot={handlePlot} onPlotReset={handlePlotReset} />
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
