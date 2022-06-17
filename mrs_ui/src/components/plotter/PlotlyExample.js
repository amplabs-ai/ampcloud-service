import React, { useEffect, useState } from "react";
import Plot from "react-plotly.js";

const PlotlyExample = (props) => {
	const [xAxis, setXAxis] = useState([]);
	const [yAxis, setYAxis] = useState([]);

	useEffect(() => {
		if (props.data?.length) {
			console.log(props.data);
			let xAxis = [];
			props.data.map((cell) => {
				cell.source.map((r) => {
					xAxis.push(r.test_time);
					yAxis.push(r.voltage);
				});
			});
			setXAxis(xAxis);
			setYAxis(yAxis);
		}
	}, [props.data]);

	return (
		<div style={{ display: "flex", justifyContent: "center" }}>
			<Plot
				onInitialized={(...rest) => console.log(rest)}
				data={[
					{
						x: xAxis,
						y: yAxis,
						type: "scatter",
						mode: "lines+markers",
						marker: { color: "red" },
						visible: true,
						name: "Blue Trace",
					},
					{
						x: xAxis,
						y: yAxis,
						type: "scatter",
						mode: "lines+markers",
						marker: { color: "red" },
						visible: true,

						name: "Blue Trace 2",
					},
				]}
				layout={{ width: "800", height: "533", title: "CycleSeries", showlegend: true }}
				config={{
					displayModeBar: true,
					displaylogo: false,
					responsive: true,
				}}
			/>
		</div>
	);
};

export default PlotlyExample;
