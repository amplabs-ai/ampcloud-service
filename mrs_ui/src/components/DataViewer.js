
import React, { useRef, useState } from "react";
import papa from "papaparse";
import ReactEcharts from "echarts-for-react";
import { Upload, message, Button, Select, Divider, Form } from "antd";
import { InboxOutlined, FileTextOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Dragger } = Upload;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
  children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

const DataViewer = () => {
  const navigate = useNavigate();

  const plottingChart = useRef(null);
  const [data, setData] = useState(null);
  const [availableCol, setAvailableCol] = useState([]);
  const [selectedXaxis, setSelectedXaxis] = useState(null);
  const [selectedYaxes, setSelectedYaxes] = useState([]);
  const [fileName, setFileName] = useState("");
  const [chartType, setChartType] = useState("line")

  const [file, setFile] = useState(null);

  const handleYAxisSelect = (value) => {
    setAvailableCol(availableCol.filter((c) => c !== value));
    setSelectedYaxes([...selectedYaxes, value]);
  };

  const handleYAxisDeselect = (value) => {
    setAvailableCol((prev) => [...prev, value]);
    setSelectedYaxes(selectedYaxes.filter((c) => c !== value));
  };

  const handleXAxisChange = (value) => {
    setSelectedXaxis(value);
  };

  const _createSeries = () => {
    let x = [];
    selectedYaxes.map((y) => {
      x.push({
        legendHoverLink: true,
				symbolSize: 5,
				symbol: "circle",
				showSymbol: false,
        name: y,
        type: "line",
        encode: {
          x: selectedXaxis,
          y: y,
        },
      });
    });
    return x;
  };

  const doHandlePlot = () => {
    if (!data) {
      message.error("No data uploaded!");
      message.error("No data uploaded!");
      return;
    } else if (!selectedXaxis) {
      message.error("Please Select X-Axis!");
      message.error("Please Select X-Axis!");
      return;
    } else if (!selectedYaxes.length) {
      message.error("Please Select Y-Axis!");
      message.error("Please Select Y-Axis!");
      return;
    }
    plottingChart.current.getEchartsInstance().dispatchAction({
      type: "restore",
    });
    plottingChart.current.getEchartsInstance().setOption({
      animation: false,
      title: {
        text: fileName,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      dataset: {
        source: data,
      },
      legend: {
        data: selectedYaxes,
      },
      grid: {
        left: "5%",
        right: "15%",
        containLabel: true,
      },
      xAxis: {
        boundaryGap: false,
        name: selectedXaxis,
        // scale: true,
        nameLocation: "middle",
        nameGap: 25,
        nameTextStyle: {
          fontSize: 20,
          padding: [5, 0],
        },
        splitLine: {
          show: false
         },
        type: "value",
        axisLine: {
          lineStyle: {
            color: "black"
          }
          }
      },
      yAxis: {
        type: "value",
        nameLocation: "middle",
        nameGap: 60,
        nameTextStyle: {
          fontSize: window.screen.width < 600 ? 12 : 16,
        },
        scale: true,
        padding: [0, 5],
        axisLabel: {
          formatter: function (value, index){
            return parseFloat(value).toPrecision(3);
          }
          },
          splitLine: {
          show: false
         },
          axisLine: {
          lineStyle: {
            color: "black"
          }
          }
      },
      series: _createSeries(),
    });
  };

  const fileUploadHandler = (info) => {
    setData(null);
    setAvailableCol([]);
    setSelectedXaxis(null);
    setSelectedYaxes([]);
    plottingChart.current.getEchartsInstance().dispatchAction({
      type: "restore",
    });
    let text = ""
    let re = ""
    const reader = new FileReader()
    reader.onload = async (e) => { 
      text = (e.target.result)
      if(info.file.name.includes(".dat")){
      re = new RegExp('^(?!1).*.[\r\n|\n]', 'gm');
      text = text.replace(re, '')
      re = /^(1\t*ALIAS\t)/gm
      text = text.replace(re, "")
      re = /^(1.*DATA\t)/gm
      text = text.replace(re, "")
      re = /^(1.*PARAMS).*.[\r\n|\n]/gm
      text = text.replace(re, "")
      re = /^(1.*UNITS).*.[\r\n|\n]/gm
      text = text.replace(re, "")
      
      re = /\t+/gm
      text = text.replace(re, ",")
      }
      else {
      re = /^(?![^,\n]*,[^,\n]*,[^,\n]*,[^,\n]*,).*$/gm
      text = text.replace(re, '')
      }
   
    setFile(info.file.originFileObj);
    setFileName(info.file.name);
    if (info.fileList.length) {
      papa.parse(text, {
        // header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        complete: function (results) {
          console.log(results)
          setAvailableCol(results.data[0]);
          setData(results.data);
        },
      });
    }
    };
    reader.readAsText(info.file.originFileObj)
    
  };

  const removeFile = (e) => {
    setData(null);
    setAvailableCol([]);
    setSelectedXaxis(null);
    setSelectedYaxes([]);
    plottingChart.current.getEchartsInstance().dispatchAction({
      type: "restore",
    });
  };

  return (
    <div style={{ marginTop: "4rem" }} className="mx-3">
      <div className="my-3 row">
        <div className="col-md-6">
          <Dragger
            multiple={false}
            maxCount={1}
            name="file"
            onChange={(info) => fileUploadHandler(info)}
            customRequest={() => {}}
            iconRender={() => <FileTextOutlined />}
            accept=".csv, text/csv, text/plain, .dat, .tdms"
            onRemove={removeFile}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">
              Click or drag file to this area to upload
            </p>
            {/* <p className="ant-upload-hint">Support for a csv</p> */}
          </Dragger>
        </div>
        <div className="col-md-6">
          <div className="my-3 row">
            <div className="col-md-12">
              <Form>
                <Form.Item label="X-Axis">
                  <Select
                    onChange={handleXAxisChange}
                    defaultValue={null}
                    style={{ width: 120 }}
                    value={selectedXaxis}
                    placeholder="Select X-Axis"
                  >
                    {availableCol.map((c, i) => (
                      <Option key={i} value={c}>
                        {c}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
                <Form.Item label="Y-Axes">
                  <Select
                    mode="multiple"
                    allowClear
                    style={{ width: "100%" }}
                    placeholder="Please select Y Axes"
                    onSelect={handleYAxisSelect}
                    onDeselect={handleYAxisDeselect}
                    value={selectedYaxes}
                  >
                    {availableCol.map((c, i) => (
                      <Option key={i + Math.random()} value={c}>
                        {c}
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </div>
            <div className="col-md-4">
              <Button type="primary" size="large" onClick={doHandlePlot}>
                Plot
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Divider style={{ marginTop: "50px" }} orientation="right">
      </Divider>
      <div className="card shadow p-2">
        <ReactEcharts
          style={{ width: "95vw", height: "600px" }}
          ref={plottingChart}
          option={{
            
            grid: {
              left: "5%",
              right: "15%",
              containLabel: true,
            },
            toolbox: {  
              show: true,
              feature: {
                saveAsImage: {},
                dataZoom: {
                  show: true,
                },
                myTool1: {
            show: data?.length,
            title: chartType === "line"
              ? "Scatter Plot"
                : "Line Chart",
            icon:
            chartType === "line"
                ? "path://M2 2h2v18h18v2H2V2m7 8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m4-8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5 10a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3Z"
                : "path://m4.67 28l6.39-12l7.3 6.49a2 2 0 0 0 1.7.47a2 2 0 0 0 1.42-1.07L27 10.9l-1.82-.9l-5.49 11l-7.3-6.49a2 2 0 0 0-1.68-.51a2 2 0 0 0-1.42 1L4 25V2H2v26a2 2 0 0 0 2 2h26v-2Z",
            onclick: function () {
              let chartOptions = plottingChart.current
                .getEchartsInstance()
                .getOption();
              console.log(chartOptions)
              if (
                chartOptions.toolbox[0].feature.myTool1.title === "Line Chart"
              ) {
                chartOptions.series.forEach((element) => {
                  element.type = "line";
                  element.symbolSize = 5;
                  element.showSymbol = false;
                });
                chartOptions.legend[0].icon =
                  "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z";
                chartOptions.toolbox[0].feature.myTool1.title = "Scatter Plot";
                chartOptions.toolbox[0].feature.myTool1.icon =
                  "path://M2 2h2v18h18v2H2V2m7 8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m4-8a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m5 10a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3Z";
              } else {
                chartOptions.series.forEach((element) => {
                  element.type = "line";
                  element.symbolSize = 5;
                  element.symbol = "circle";
                  element.showSymbol = true;
                });
                chartOptions.legend[0].icon = "pin";
                chartOptions.toolbox[0].feature.myTool1.title = "Line Chart";
                chartOptions.toolbox[0].feature.myTool1.icon =
                  "path://m4.67 28l6.39-12l7.3 6.49a2 2 0 0 0 1.7.47a2 2 0 0 0 1.42-1.07L27 10.9l-1.82-.9l-5.49 11l-7.3-6.49a2 2 0 0 0-1.68-.51a2 2 0 0 0-1.42 1L4 25V2H2v26a2 2 0 0 0 2 2h26v-2Z";
              }
              plottingChart.current.getEchartsInstance().setOption(chartOptions);
              let newType = chartType === "line" ? "scatter" : "line"
              setChartType(newType)
            },
          },
              },
            },
            tooltip: [
			{
				trigger: "axis",
				axisPointer: { type: "cross" },
				triggerOn: "click",
        formatter: function (params) {
          console.log(params)
					let tooltip_str = ""
					params.forEach((param) => {
						tooltip_str+=`${param.marker} <b>${param.seriesName}</b>(${parseFloat(param.value[param.encode.x[0]]).toPrecision(5)}<b>, </b>${parseFloat(param.value[param.encode.y[0]]).toPrecision(5)}) <br>`
					})
					return tooltip_str
				  }
			},
      
		],
    color: ['#e98d6b', '#e3685c', '#d14a61', '#b13c6c', '#8f3371', '#6c2b6d'],
    legend: {
      type: "scroll",
              align: "right",
              left: "right",
              top: "5%",
              right: "5%",
              orient: "vertical",
      padding: [60,15,0,0,0],
		bottom: "0%",
		icon: chartType === "scatter"?
				"pin"
				: "path://M904 476H120c-4.4 0-8 3.6-8 8v56c0 4.4 3.6 8 8 8h784c4.4 0 8-3.6 8-8v-56c0-4.4-3.6-8-8-8z",
		pageTextStyle: {
			overflow: "truncate",
		},
		textStyle: {
			fontSize: window.screen.width < 600 ? 12 : 16,
		},},
          }}
        />
      </div>
    </div>
  );
};

export default DataViewer;

