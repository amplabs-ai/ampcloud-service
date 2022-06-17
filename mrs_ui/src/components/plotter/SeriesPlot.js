import axios from "axios";
import React, { useEffect, useState } from "react";
import { usePlotter } from "../../context/PlotterContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import DashboardChart from "../chart/DashboardChart";
import PlotlyExample from "./PlotlyExample";
import PlotterInputForm from "./PlotterInputForm";

const SeriesPlot = (props) => {
	const [data, setData] = useState([]);
	const [filteredData, setFilteredData] = useState([]);

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
		chartTitle: props.type === "timeseries" ? "TimeSeries plot" : "CycleSeries plot",
		chartId: "plotter",
		code: false,
	});

	useEffect(() => {
		if (data.length) {
			let checkedCellIds = state.checkedCellIds.map((c) => c.cell_id);
			setFilteredData(data.filter((d) => checkedCellIds.includes(d.id)));
		}
	}, [state.checkedCellIds]);

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
				setFilteredData(response.data?.records[0]);
			})
			.catch(function (error) {
				setChartLoadSpiner(false);
				setChartLoadingError(true);
				setData([]);
				setFilteredData([]);
				console.log(error);
			});
	};

	const handlePlotReset = () => {
		setData([]);
		setFilteredData([]);
		setChartLoadingError(false);
	};

	return (
		<div className="row">
			<div className="col-md-4">
				<PlotterInputForm type={props.type} onPlot={handlePlot} onPlotReset={handlePlotReset} />
			</div>
			<div className="col-md-8">
				<div className="p-2 pt-0">
					<DashboardChart
						data={filteredData}
						chartName={JSON.stringify(chartConfigs)}
						chartLoadingError={chartLoadingError}
						shallShowLoadSpinner={chartLoadSpiner}
						usage="plotter"
					/>
					{/* <PlotlyExample data={filteredData} /> */}
				</div>
			</div>
		</div>
	);
};

export default SeriesPlot;
