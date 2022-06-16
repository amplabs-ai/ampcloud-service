import React from "react";
import Plotter from "../components/plotter/Plotter";
import { PlotterProvider } from "../context/PlotterContext";

const PlotterPage = () => {
	return (
		<div style={{ marginTop: "2.5rem", padding: "5px" }}>
			<PlotterProvider>
				<Plotter />
			</PlotterProvider>
		</div>
	);
};

export default PlotterPage;
