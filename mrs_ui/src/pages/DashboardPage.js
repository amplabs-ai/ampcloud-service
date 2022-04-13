import React, { useState, useRef } from "react";

import axios from "axios";
import ReactEcharts from "echarts-for-react";
import DashboardFilterBar from "../components/DashboardFilterBar";
import ViewCodeModal from "../components/ViewCodeModal";

// remove this later
import { energyAndCapacityDecayData } from "../mock-endpoints/fixtures/dashboard_data";

import initialChartOptions from "../chartConfig/initialConfigs";

import sourceCode from "../chartConfig/chartSourceCode";

import { Result, Button, Alert } from "antd";

const DashboardPage = () => {
  // const sortData = (data) => {
  // 	return data.sort(function (a, b) {
  // 		return a[0] - b[0];
  // 	});
  // };

  const cycleIndexChart = useRef();
  const timeSeriesChart = useRef();
  const efficiencyChart = useRef();
  const cycleQtyByStepChart = useRef();
  const compareByCycleTimeChart = useRef();

  const [searchParams, setSearchParams] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [codeContent, setCodeContent] = useState("");
  const [noDataFound, setNoDataFound] = useState(false);
  const [chartLoadingError, setChartLoadingError] = useState({
    cycleIndexChart: false,
    timeSeriesChart: false,
    efficiencyChart: false,
    cycleQtyByStepChart: false,
    compareByCycleTimeChart: false,
  });

  const [internalServerError, setInternalServerError] = useState("");

  const internalServerErrorFound = (errStatus) => {
    setInternalServerError(errStatus);
  };

  const handleFilterChange = (cellIds, step) => {
    console.log("cellIds->filterbar", cellIds);
    if (!cellIds.length) {
      setNoDataFound(true);
    }

    let params = new URLSearchParams();
    cellIds.forEach((cellId) => {
      params.append("cell_id", cellId.cell_id);
    });
    params.append("step", step);
    console.log("params", params);

    let request = {
      params: params,
    };

    setSearchParams(params.toString());

    fetchData(request, "cycleIndex");
    fetchData(request, "timeSeries");
    fetchData(request, "efficiency");
    fetchData(request, "cycleQtyByStep");
    fetchData(request, "compareByCycleTime");
    return true;
  };

  const fetchData = (request, chartType) => {
    let endpoint, ref, xAxis, yAxis, chartTitle, chartId, code;
    switch (chartType) {
      case "cycleIndex":
        [endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
          `/echarts/energyAndCapacityDecay`,
          cycleIndexChart,
          {
            mapToId: "cycle_index",
            title: "Cycle Index",
          },
          {
            mapToId: "value",
            title: "Ah/Wh",
          },
          "Cycle Index Data - Energy and Capacity Decay",
          "cycleIndex",
          sourceCode.cycleIndexChart,
        ];
        break;
      case "timeSeries":
        [endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
          `/echarts/energyAndCapacityDecay`,
          timeSeriesChart,
          {
            mapToId: "test_time",
            title: "Time (s)",
          },
          {
            mapToId: "value",
            title: "Wh/Ah",
          },
          "Time Series Data - Energy and Capacity Decay",
          "timeSeries",
          sourceCode.timeSeriesChart,
        ];
        break;
      case "efficiency":
        [endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
          `/echarts/efficiency`,
          efficiencyChart,
          {
            mapToId: "cycle_index",
            title: "Cycle Index",
          },
          {
            mapToId: "value",
            title: "Enery and Coulombic Efficiencies",
          },
          "Efficiencies",
          "efficiency",
          sourceCode.efficiencyChart,
        ];
        break;
      case "cycleQtyByStep":
        [endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
          `/echarts/cycleQuantitiesByStep`,
          cycleQtyByStepChart,
          {
            mapToId: "cycle_time",
            title: "Cycle Tiime (s)",
          },
          {
            mapToId: "v",
            title: "Volateg (V)",
          },
          "Cycle Quantities by Step",
          "cycleQtyByStep",
          sourceCode.cycleQtyByStepChart,
        ];
        break;
      case "compareByCycleTime":
        [endpoint, ref, xAxis, yAxis, chartTitle, chartId, code] = [
          `/echarts/compareByCycleTime`,
          compareByCycleTimeChart,
          {
            mapToId: "cycle_time",
            title: "Cycle time (s)",
          },
          {
            mapToId: "value",
            title: "Voltage (V)/Current (A)",
          },
          "Compare by Cycle Time - Compare Cycle Voltage and Current",
          "compareByCycleTime",
          sourceCode.compareByCycleTimeChart,
        ];
        break;
      default:
        break;
    }
    showChartLoadingError(ref.current.ele, false);
    ref.current.getEchartsInstance().showLoading();
    axios
      .get(endpoint, request)
      .then((result) => {
        if (typeof result.data == "string") {
          result = JSON.parse(result.data.replace(/\bNaN\b/g, "null"));
        } else {
          result = result.data;
        }
        if (result.status !== 200) {
          console.log("result status", result.status);
        }
        ref.current.getEchartsInstance().dispatchAction({
          type: "restore",
        });
        ref.current.getEchartsInstance().setOption({
          title: {
            show: true,
            id: chartId,
            text: chartTitle,
            textStyle: {
              fontSize: 14,
              overflow: "breakAll",
            },
          },
          dataset: result.records[0],
          series: _createChartDataSeries(
            result.records[0], // replace with actual data
            xAxis.mapToId,
            yAxis.mapToId,
            chartId
          ),
          xAxis: {
            type: "value",
            name: xAxis.title,
            nameLocation: "middle",
            nameGap: 20,
          },
          yAxis: {
            type: "value",
            name: yAxis.title,
            nameLocation: "middle",
            nameGap: 30,
          },
          legend: _createChartLegend(result.records[0], chartId),
          toolbox: {
            feature: {
              myTool: {
                show: true,
                title: "View Code",
                icon: `path://M9,22 L15,2 M17,17 L22,12 L17,7 M7,17 L2,12 L7,7`,
                onclick: function () {
                  formatCode(code);
                },
              },
              saveAsImage: {
                show: "true",
              },
              dataZoom: {
                yAxisIndex: "none",
              },
            },
          },
        });
        ref.current.getEchartsInstance().hideLoading();
      })
      .catch((err) => {
        console.log("err", err);
        ref.current.getEchartsInstance().showLoading();
        showChartLoadingError(ref.current.ele, true);
      });
  };

  const formatCode = (code) => {
    setCodeContent(code);
    setModalVisible(true);
  };

  const showChartLoadingError = (chartRef, show) => {
    setChartLoadingError((prevState) => {
      return { ...prevState, [chartRef]: show };
    });
  };

  const _createChartDataSeries = (data, xAxis, yAxis, chartId) => {
    let x = [];
    data.forEach((d) => {
      x.push({
        type: chartId === "timeSeries" ? "scatter" : "line",
        name: d.id,
        showSymbol: false,
        datasetId: d.id,
        encode: {
          x: xAxis,
          y: yAxis,
        },
      });
    });
    console.log("_createChartDataSeries", x);
    return x;
  };

  const _createChartLegend = (data, chartId) => {
    let x = [];
    data.forEach((d) => {
      x.push(d.id);
    });
    return {
      data: x, //["MACCOR_example copy 2 c: 1", "Arbin_example c: 2"], // ["cell id 1", "cell id 2"],
      type: "scroll",
      orient: "horizontal",
      left: "0",
      bottom: "0",
      icon:
        chartId === "timeSeries"
          ? "pin"
          : "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z",
      // top: "center",
      pageTextStyle: {
        overflow: "truncate",
      },
      backgroundColor: "#FFFFFF",
    };
  };

  return (
    <div style={{ paddingTop: "75px" }}>
      {noDataFound ? (
        <Result
          title="No Data was found! Please upload files."
          extra={
            <Button type="primary" key="console" href="/upload">
              Go to Upload
            </Button>
          }
        />
      ) : internalServerError ? (
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={
            <Button type="primary" href="/dashboard">
              Reload
            </Button>
          }
        />
      ) : (
        <div style={{ margin: "0.6rem" }}>
          <DashboardFilterBar
            onFilterChange={handleFilterChange}
            internalServerErrorFound={internalServerErrorFound}
          />
          <ViewCodeModal
            code={codeContent}
            modalVisible={modalVisible}
            setModalVisible={setModalVisible}
            searchParams={searchParams}
          />
          <div className="row pb-5">
            <div className="col-md-6 mt-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  {chartLoadingError.cycleIndexChart && (
                    <Alert message="Error" type="error" showIcon />
                  )}
                  <ReactEcharts
                    showLoading
                    ref={cycleIndexChart}
                    option={initialChartOptions}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  {chartLoadingError.timeSeriesChart && (
                    <Alert message="Error" type="error" showIcon />
                  )}
                  <ReactEcharts
                    showLoading
                    ref={timeSeriesChart}
                    option={initialChartOptions}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  {chartLoadingError.efficiencyChart && (
                    <Alert message="Error" type="error" showIcon />
                  )}
                  <ReactEcharts
                    showLoading
                    ref={efficiencyChart}
                    option={initialChartOptions}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 mt-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  {chartLoadingError.cycleQtyByStepChart && (
                    <Alert message="Error" type="error" showIcon />
                  )}
                  <ReactEcharts
                    showLoading
                    ref={cycleQtyByStepChart}
                    option={initialChartOptions}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-12 mt-2">
              <div className="card shadow-sm">
                <div className="card-body">
                  {chartLoadingError.compareByCycleTimeChart && (
                    <Alert message="Error" type="error" showIcon />
                  )}
                  <ReactEcharts
                    showLoading
                    ref={compareByCycleTimeChart}
                    option={initialChartOptions}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
