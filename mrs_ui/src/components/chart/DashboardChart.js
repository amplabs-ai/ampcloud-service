import { Alert } from "antd";
import React, { useCallback, useEffect, useRef } from "react";
import ReactEcharts from "echarts-for-react";
import initialChartOptions from "../../chartConfig/initialConfigs";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { chartConfig, getChartMetadata } from "../../chartConfig/dashboardChartConfig";
import { audit } from "../../auditAction/audit";
import { enterFullscreenOption, exitFullscreenOption } from "../../chartConfig/chartFullScreenOption";
import { useAuth0 } from "@auth0/auth0-react";

const DashboardChart = (props) => {
	const screen = useFullScreenHandle();
	const chartRef = useRef();
	const { user } = useAuth0(); // auth context

	const reportChange = useCallback((state) => {
		if (state) {
			chartRef.current.getEchartsInstance().setOption(enterFullscreenOption);
			chartRef.current.ele.style.height = window.screen.width < 600 ? "50%" : "80%";
			chartRef.current.ele.style.marginTop = window.screen.width < 600 ? "10%" : "5%";
		} else {
			chartRef.current.getEchartsInstance().setOption(exitFullscreenOption);
			chartRef.current.ele.style.marginTop = "0%";
			chartRef.current.ele.style.height = window.screen.width < 600 ? "15rem" : "24rem";
		}
	}, []);

	useEffect(() => {
		chartRef.current.getEchartsInstance().dispatchAction({
			type: "restore",
		});
		console.log("asdw", chartConfig(props.chartName, props.data));
		// if (props.data && props.data.length) {
		// chartRef.current.getEchartsInstance().showLoading();
		chartRef.current.getEchartsInstance().setOption({
			...chartConfig(props.chartName, props.data),
			toolbox: {
				zlevel: 30,
				top: window.screen.width < 600 ? "8%" : "5%",
				emphasis: {
					iconStyle: {
						textPosition: "top",
						color: "#FFFFFF",
						textBackgroundColor: "#000000",
						textPadding: 5,
						opacity: 1,
					},
				},
				feature: {
					myTool: {
						show: true,
						title: "View Code",
						icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
						onclick: function () {
							audit(`cycle_dash_chart_${props.chartName}_viewcode`, user.iss);
							let { code } = getChartMetadata(props.chartName);
							props.formatCode(code);
						},
					},
					myTool2: {
						show: true,
						title: "Enter Fullscreen",
						icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
						onclick: function () {
							audit(`cycle_dash_chart_${props.chartName}_fullscreen`, user.iss);
							screen.enter();
						},
					},
					myTool3: {
						show: true,
						title: "Exit Fullscreen",
						icon: `path://M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
              S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
              c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z,M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
              c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
              s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z`,
						onclick: function () {
							screen.exit();
						},
					},
					saveAsImage: {
						show: "true",
					},
					dataZoom: {
						brushStyle: {
							borderWidth: 1,
							borderColor: "#000000",
						},
					},
				},
			},
		});
		if (props.data?.length) {
			chartRef.current.getEchartsInstance().hideLoading();
		}
		// }
	}, [props.data]);

	useEffect(() => {
		// chartRef.current.getEchartsInstance().one("finished", () => {
		// 	// setChartsLoaded((prev) => ({ ...prev, cycleIndex: true }));
		// 	props.chartLoaded(props.chartName);
		// });
		// for auditing
		chartRef.current.getEchartsInstance().on("dataZoom", () => {
			audit(`cycle_dash_chart_${props.chartName}_dataZoom`, user.iss);
		});
	}, []);

	return (
		<FullScreen handle={screen} onChange={reportChange}>
			<div className="card shadow" style={{ height: "100%", width: "100%" }}>
				<div className="card-body">
					{props.chartLoadingError && <Alert message="Error loading chart!" type="error" showIcon />}
					<ReactEcharts
						style={{
							width: "100%",
							height: window.screen.width < 600 ? "15rem" : "24em",
						}}
						ref={chartRef}
						option={initialChartOptions}
						showLoading={props.shallShowLoadSpinner}
					/>
				</div>
			</div>
		</FullScreen>
	);
};

export default DashboardChart;
