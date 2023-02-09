import Alert from "antd/es/alert";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactEcharts from "echarts-for-react";
import { scatterPlotChartId, initialChartOptions } from "../../chartConfig/initialConfigs";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { chartConfig, getChartMetadata } from "../../chartConfig/dashboardChartConfig";
import { audit } from "../../auditAction/audit";
import { enterFullscreenOption, exitFullscreenOption } from "../../chartConfig/chartFullScreenOption";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth0 } from "@auth0/auth0-react";
import { useUserPlan } from "../../context/UserPlanContext";
import ChartFilter from "../dashboard/ChartFilter";

const DashboardChart = (props) => {
	const screen = useFullScreenHandle();
	const chartFilterRef = useRef();
	const chartRef = useRef();
	const accessToken = useAuth0Token(); // auth context
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { state } = useDashboard();
	const { user } = useAuth0();
	const userPlan = useUserPlan();

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

	const FilterModal = () => {
		setIsModalVisible(true);
	  };

	  const formatText = (str, mapObj) => {
		if (str && mapObj) {
			var re = new RegExp(Object.keys(mapObj).join("|"), "gi");
	
			return str.replace(re, function (matched) {
				return mapObj[matched.toLowerCase()];
			});
		}
	};
	useEffect(() => {
		chartRef.current.getEchartsInstance().dispatchAction({
			type: "restore",
		});
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
					myTool6: {
						show: props.usage === "plotter" ? false : true,
						title: "Add Filters",
						icon: `path://M19.71,8l-4.77,4.77a1.5,1.5,0,0,0-.44,1.06V18a.479.479,0,0,1-.2.4l-4,3a.472.472,0,0,1-.3.1.545.545,0,0,1-.22-.05A.512.512,0,0,1,9.5,21V13.83a1.5,1.5,0,0,0-.44-1.06L4.29,8ZM18.5,2.5H5.5a2.006,2.006,0,0,0-2,2V6h17V4.5A2.006,2.006,0,0,0,18.5,2.5Z`,
						onclick: function () {
						  FilterModal();
						},
					},
					dataZoom: {
						// title: "Zoom in",
						// icon: "path://M30.9,53.2C16.8,53.2,5.3,41.7,5.3,27.6S16.8,2,30.9,2C45,2,56.4,13.5,56.4,27.6S45,53.2,30.9,53.2z M30.9,3.5C17.6,3.5,6.8,14.4,6.8,27.6c0,13.3,10.8,24.1,24.101,24.1C44.2,51.7,55,40.9,55,27.6C54.9,14.4,44.1,3.5,30.9,3.5z M36.9,35.8c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H36c0.5,0,0.9,0.4,0.9,1V35.8z M27.8,35.8 c0,0.601-0.4,1-0.9,1h-1.3c-0.5,0-0.9-0.399-0.9-1V19.5c0-0.6,0.4-1,0.9-1H27c0.5,0,0.9,0.4,0.9,1L27.8,35.8L27.8,35.8z",
						brushStyle: {
							borderWidth: 1,
							borderColor: "#000000",
						},
					},
					myTool5: {
						show: props.data?.length,
						title: scatterPlotChartId.indexOf(props.chartName) === -1 ? "Scatter Plot" : "Line Chart",
						icon: scatterPlotChartId.indexOf(props.chartName) === -1 ? "path://M2 2h2v18h18v2H2V2m7 8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m4-8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5 10a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3Z" : "path://m4.67 28l6.39-12l7.3 6.49a2 2 0 0 0 1.7.47a2 2 0 0 0 1.42-1.07L27 10.9l-1.82-.9l-5.49 11l-7.3-6.49a2 2 0 0 0-1.68-.51a2 2 0 0 0-1.42 1L4 25V2H2v26a2 2 0 0 0 2 2h26v-2Z",
						onclick: function () {
							let chartOptions = chartRef.current.getEchartsInstance().getOption()
							if(chartOptions.toolbox[0].feature.myTool5.title === "Line Chart"){
								chartOptions.series.forEach((element) => {
									element.type = "line"
									element.symbolSize = 7
									element.showSymbol = false
								});
								chartOptions.legend[0].icon = "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z"
								chartOptions.toolbox[0].feature.myTool5.title = "Scatter"
								chartOptions.toolbox[0].feature.myTool5.icon = "path://M2 2h2v18h18v2H2V2m7 8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m4-8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5 10a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3Z"	
							}
							else{
								
								chartOptions.series.forEach((element) => {
									element.type = "line"
									element.symbolSize = 7
									element.symbol = "circle"
									element.showSymbol = true
								});
								chartOptions.legend[0].icon = "pin"
								chartOptions.toolbox[0].feature.myTool5.title = "Line Chart"
								chartOptions.toolbox[0].feature.myTool5.icon = "path://m4.67 28l6.39-12l7.3 6.49a2 2 0 0 0 1.7.47a2 2 0 0 0 1.42-1.07L27 10.9l-1.82-.9l-5.49 11l-7.3-6.49a2 2 0 0 0-1.68-.51a2 2 0 0 0-1.42 1L4 25V2H2v26a2 2 0 0 0 2 2h26v-2Z"		
							}
							chartRef.current.getEchartsInstance().setOption(chartOptions)
						},
					},
					myTool4: {
						show: props.data?.length ? true : false,
						title: "Download Data",
						icon: `path://M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0zM9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1zm-1 4v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 11.293V7.5a.5.5 0 0 1 1 0z`,
						onclick: function () {
							function convertToCSV(arr) {
									const array = [Object.keys(arr[0])].concat(arr)
								  
									return array.map(it => {
									  return Object.values(it).toString()
									}).join('\n')
								  }

								const chartData = props.data.map(eachItem=>[...eachItem.source]).flat(1);
								const csvChartData= convertToCSV(chartData)						
								var fileDownload = document.createElement("a");
								var blob = new Blob([csvChartData], { type: "application/csv" });
								fileDownload.href = window.URL.createObjectURL(blob);
								fileDownload.download = props.usage === "dashboardType2" ? props.chartName + ".csv": 'plot' + ".csv";
								fileDownload.click(); 
						},
					},
					myTool: {
						show: true,
						title: "View Code",
						icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
						onclick: props.usage === "plotter" ? function () {
							audit(`plotter_chart_viewcode`, {...user, userTier: userPlan});
							let { code } = getChartMetadata(props.chartName);
							props.formatCode(code);
						}:function () {
							let req_body = {
								cell_ids: state.checkedCellIds.map((c) => c.cell_id),
								filters: chartFilterRef.current.getFilterValues().filter((obj) => obj.column !== null)
							}
							let replaceInCode = {
								__accesstoken__: accessToken,
								__req_data__: JSON.stringify(req_body),
							};
							audit(`cycle_dash_chart_${props.chartName}_viewode`, {...user, userTier: userPlan});
							let { code } = getChartMetadata(props.chartName);
							props.formatCode(formatText(code, replaceInCode));
						},
					},
			// 		myTool2: {
			// 			show: true,
			// 			title: "Enter Fullscreen",
			// 			icon: `path://M2 2.5C2 2.22386 2.22386 2 2.5 2H5.5C5.77614 2 6 2.22386 6 2.5C6 2.77614 5.77614 3 5.5 3H3V5.5C3 5.77614 2.77614 6 2.5 6C2.22386 6 2 5.77614 2 5.5V2.5ZM9 2.5C9 2.22386 9.22386 2 9.5 2H12.5C12.7761 2 13 2.22386 13 2.5V5.5C13 5.77614 12.7761 6 12.5 6C12.2239 6 12 5.77614 12 5.5V3H9.5C9.22386 3 9 2.77614 9 2.5ZM2.5 9C2.77614 9 3 9.22386 3 9.5V12H5.5C5.77614 12 6 12.2239 6 12.5C6 12.7761 5.77614 13 5.5 13H2.5C2.22386 13 2 12.7761 2 12.5V9.5C2 9.22386 2.22386 9 2.5 9ZM12.5 9C12.7761 9 13 9.22386 13 9.5V12.5C13 12.7761 12.7761 13 12.5 13H9.5C9.22386 13 9 12.7761 9 12.5C9 12.2239 9.22386 12 9.5 12H12V9.5C12 9.22386 12.2239 9 12.5 9Z`,
			// 			onclick: props.usage === "plotter" ? function () {
			// 				audit(`plotter_chart_fullscreen`, {...user, userTier: userPlan});
			// 				screen.enter();
			// 			}: function () {
			// 				audit(`cycle_dash_chart_${props.chartName}_fullscreen`, {...user, userTier: userPlan});
			// 				screen.enter();
			// 			},
			// 		},
			// 		myTool3: {
			// 			show: true,
			// 			title: "Exit Fullscreen",
			// 			icon: `path://M372.939,216.545c-6.123,0-12.03,5.269-12.03,12.03v132.333H24.061V24.061h132.333c6.388,0,12.03-5.642,12.03-12.03
            //   S162.409,0,156.394,0H24.061C10.767,0,0,10.767,0,24.061v336.848c0,13.293,10.767,24.061,24.061,24.061h336.848
            //   c13.293,0,24.061-10.767,24.061-24.061V228.395C384.97,221.731,380.085,216.545,372.939,216.545z,M372.939,0H252.636c-6.641,0-12.03,5.39-12.03,12.03s5.39,12.03,12.03,12.03h91.382L99.635,268.432
            //   c-4.668,4.668-4.668,12.235,0,16.903c4.668,4.668,12.235,4.668,16.891,0L360.909,40.951v91.382c0,6.641,5.39,12.03,12.03,12.03
            //   s12.03-5.39,12.03-12.03V12.03l0,0C384.97,5.558,379.412,0,372.939,0z`,
			// 			onclick: function () {
			// 				screen.exit();
			// 			},
			// 		},
					// saveAsImage: {
					// 	show: "true",
					// },
					
				},
			},
		});
		if (!props.shallShowLoadSpinner) {
			chartRef.current.getEchartsInstance().hideLoading();
		}
		// }
	}, [props.data, props.shallShowLoadSpinner]);

	useEffect(() => {
		// for auditing
		chartRef.current.getEchartsInstance().on("dataZoom", () => {
			props.usage === "plotter" ?
			audit(`plotter_chart_dataZoom`, {...user, userTier: userPlan}):
			audit(`cycle_dash_chart_${props.chartName}_dataZoom`, {...user, userTier: userPlan});
		});
	}, []);

	return (
		<>
	 <ChartFilter
	 	ref={chartFilterRef}
        isModalVisible={isModalVisible}
        setIsModalVisible={setIsModalVisible}
        chartName={props.chartName}
        fetchData={props.fetchData}
		accessToken={accessToken}
		displayNames={props.displayNames}
      />
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
		</>
	);
};

export default DashboardChart;
