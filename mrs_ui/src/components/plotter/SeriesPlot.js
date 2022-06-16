import axios from "axios";
import React, { useState } from "react";
import { usePlotter } from "../../context/PlotterContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import DashboardChart from "../chart/DashboardChart";
import PlotterInputForm from "./PlotterInputForm";

import { dummydata } from "./dummydata";

const SeriesPlot = (props) => {
	const [data, setData] = useState([]);
	const accessToken = useAuth0Token();
	const { state, action } = usePlotter();
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
		chartTitle: props.type === "timeseries" ? "Time-series plot" : "Cycle series plot",
		chartId: "plotter",
		code: false,
	});

	const handlePlot = (values) => {
		setChartLoadSpiner(true);
		setChartLoadingError(false);
		setChartConfigs({
			...chartConfigs,
			xAxis: {
				mapToId: values["x-axis"],
				title: values["x-axis"],
			},
			yAxis: {
				mapToId: values["y-axis"],
				title: values["y-axis"],
			},
		});
		let endpoint = props.type === "timeseries" ? "/echarts/timeseries" : "/echarts/stats";
		let data = JSON.stringify({
			cell_ids: state.checkedCellIds.map((c) => c.cell_id),
			columns: [values["x-axis"], values["y-axis"]],
			filters: values.filters?.map((f) => Object.values(f).join("")) || [],
		});
		console.log("data", data);
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
			})
			.catch(function (error) {
				setChartLoadSpiner(false);
				setChartLoadingError(true);
				setData([]);
				console.log(error);
			});
	};

	return (
		<div className="row">
			<div className="col-md-4">
				<PlotterInputForm type={props.type} onPlot={handlePlot} />
			</div>
			<div className="col-md-8">
				<div className="p-2 pt-0">
					<DashboardChart
						data={data}
						chartName={JSON.stringify(chartConfigs)}
						chartLoadingError={chartLoadingError}
						shallShowLoadSpinner={chartLoadSpiner}
						usage="plotter"
					/>
				</div>
			</div>
		</div>
	);
};

export default SeriesPlot;
