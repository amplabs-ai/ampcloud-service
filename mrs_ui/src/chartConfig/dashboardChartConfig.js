// ====== python code files ======
import sourceCode from "../chartConfig/chartSourceCode";

const _createChartDataSeries = (
  data,
  xAxis,
  yAxis,
  displayColMapping = null,
  chartId
) => {
  let x = [];
  if (chartId === "plotter") {
    data.forEach((d) => {
      yAxis.forEach((y) => {
        x.push({
          type: "scatter",
          symbolSize: 5,
          name: `${d.id}: ${displayColMapping[y]}`,
          showSymbol: false,
          datasetId: d.id,
          encode: {
            x: xAxis,
            y: y,
          },
        });
      });
    });
  } else {
    data.forEach((d) => {
      x.push({
        type:
          chartId === "timeSeries" || chartId === "plotter"
            ? "scatter"
            : "line",
        symbolSize: chartId === "timeSeries" || chartId === "plotter" ? 5 : 10,
        name: d.id,
        showSymbol: false,
        datasetId: d.id,
        encode: {
          x: xAxis,
          y: yAxis,
        },
      });
    });
  }
  return x;
};

const _createChartLegend = (data, chartId, yAxis = null) => {
  let x = [];
  if (chartId === "plotter") {
    data.forEach((d) => {
      yAxis.mapToId.forEach((y) => {
        x.push(`${d.id}: ${yAxis.displayColMapping[y]}`);
      });
    });
  } else {
    data.forEach((d) => {
      x.push(d.id);
    });
  }
  return {
    data: x,
    type: "scroll",
    orient: "horizontal",
    // left: "right",
    // top: window.screen.width < 600 ? "auto" : "15%",
    bottom: "0%",
    // right: window.screen.width < 1200 ? "auto" : "0%",
    // top: window.screen.width < 1200 ? "auto" : "16%",
    // bottom: window.screen.width < 1200 ? "0" : "auto",
    icon:
      chartId === "timeSeries" || chartId === "plotter"
        ? "pin"
        : "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z",
    pageTextStyle: {
      overflow: "truncate",
    },
    // backgroundColor: "#FFFFFF",
    textStyle: {
      fontSize: window.screen.width < 600 ? 12 : 16,
    },
  };
};

export const chartConfig = (chartName, data) => {
  let { xAxis, yAxis, chartId, chartTitle } = getChartMetadata(chartName);
  return {
    title: {
      show: true,
      id: chartId,
      text: chartTitle,
      textStyle: {
        fontSize: window.screen.width < 600 ? 15 : 20,
        fontWeight: "normal",
        overflow: "break",
        width: window.screen.width < 600 ? 300 : 500,
      },
    },
    dataset: data,
    series: _createChartDataSeries(
      data,
      xAxis.mapToId,
      yAxis.mapToId,
      yAxis.displayColMapping,
      chartId
    ),
    xAxis: {
      type: "value",
      name: xAxis.title,
      nameLocation: "middle",
      nameGap: 25,
      nameTextStyle: {
        fontSize: window.screen.width < 600 ? 12 : 16,
        padding: [5, 0],
      },
      scale: true,
    },
    yAxis:
      chartId === "plotter"
        ? { scale: true }
        : {
            type: "value",
            name: yAxis.title,
            nameLocation: "middle",
            nameGap: 25,
            nameTextStyle: {
              fontSize: window.screen.width < 600 ? 12 : 16,
            },
            scale: true,
            padding: [0, 5],
          },
    legend: _createChartLegend(data, chartId, yAxis),
    color: [
      "#1f77b4", // muted blue
      "#ff7f0e", // safety orange
      "#2ca02c", // cooked asparagus green
      "#d62728", // brick red
      "#9467bd", // muted purple
      "#8c564b", // chestnut brown
      "#e377c2", // raspberry yogurt pink
      "#7f7f7f", // middle gray
      "#bcbd22", // curry yellow-green
      "#17becf", // blue-teal
    ],
  };
};

export const getChartMetadata = (chartName) => {
  let result = {};
  switch (chartName) {
    case "cycleIndex":
      result = {
        endpoint: `/echarts/energyAndCapacityDecay`,
        xAxis: {
          mapToId: "cycle_index",
          title: "Cycle Index",
        },
        yAxis: {
          mapToId: "value",
          title: "Ah/Wh",
        },
        chartTitle: "Cycle Index Data - Energy and Capacity Decay",
        chartId: "cycleIndex",
        code: sourceCode.cycleIndexChart,
      };
      break;
    case "timeSeries":
      result = {
        endpoint: `/echarts/energyAndCapacityDecay`,
        xAxis: {
          mapToId: "test_time",
          title: "Time (s)",
        },
        yAxis: {
          mapToId: "value",
          title: "Wh/Ah",
        },
        chartTitle: "Time Series Data - Energy and Capacity Decay",
        chartId: "timeSeries",
        code: sourceCode.timeSeriesChart,
      };
      break;
    case "efficiency":
      result = {
        endpoint: `/echarts/efficiency`,
        xAxis: {
          mapToId: "cycle_index",
          title: "Cycle Index",
        },
        yAxis: {
          mapToId: "value",
          title: "Enery and Coulombic Efficiencies",
        },
        chartTitle: "Efficiencies",
        chartId: "efficiency",
        code: sourceCode.efficiencyChart,
      };
      break;
    case "cycleQtyByStep":
      result = {
        endpoint: `/echarts/cycleQuantitiesByStep`,
        xAxis: {
          mapToId: "cycle_time",
          title: "Cycle Time (s)",
        },
        yAxis: {
          mapToId: "v",
          title: "Voltage (V)",
        },
        chartTitle: "Cycle Quantities by Step",
        chartId: "cycleQtyByStep",
        code: sourceCode.cycleQtyByStepChart,
      };
      break;
    case "cycleQtyByStepWithCapacity":
      result = {
        endpoint: `/echarts/cycleQuantitiesByStep`,
        xAxis: {
          mapToId: "ah",
          title: "Capacity (Ah)",
        },
        yAxis: {
          mapToId: "v",
          title: "Voltage (V)",
        },
        chartTitle: "Cycle Quantities by Step - Capacity",
        chartId: "cycleQtyByStepWithCapacity",
        code: sourceCode.cycleQtyByStepWithCapacityChart,
      };
      break;
    default:
      // for showing chart on plotter page
      return JSON.parse(chartName);
  }
  return result;
};
