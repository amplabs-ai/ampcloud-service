import React, { useRef, useState } from "react";
import papa from "papaparse";
import ReactEcharts from "echarts-for-react";
import { Upload, message, Input, Tooltip, Button, Select, Divider, Form } from "antd";
import { InboxOutlined, FileTextOutlined, FullscreenOutlined } from "@ant-design/icons";

const { Dragger } = Upload;
const { Option } = Select;

const children = [];
for (let i = 10; i < 36; i++) {
	children.push(<Option key={i.toString(36) + i}>{i.toString(36) + i}</Option>);
}

function toggle_full_screen() {
	if (
		(document.fullScreenElement && document.fullScreenElement !== null) ||
		(!document.mozFullScreen && !document.webkitIsFullScreen)
	) {
		if (document.documentElement.requestFullScreen) {
			document.documentElement.requestFullScreen();
		} else if (document.documentElement.mozRequestFullScreen) {
			/* Firefox */
			document.documentElement.mozRequestFullScreen();
		} else if (document.documentElement.webkitRequestFullScreen) {
			/* Chrome, Safari & Opera */
			document.documentElement.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
		} else if (document.msRequestFullscreen) {
			/* IE/Edge */
			document.documentElement.msRequestFullscreen();
		}
	} else {
		if (document.cancelFullScreen) {
			document.cancelFullScreen();
		} else if (document.mozCancelFullScreen) {
			/* Firefox */
			document.mozCancelFullScreen();
		} else if (document.webkitCancelFullScreen) {
			/* Chrome, Safari and Opera */
			document.webkitCancelFullScreen();
		} else if (document.msExitFullscreen) {
			/* IE/Edge */
			document.msExitFullscreen();
		}
	}
}

const Plotter = () => {
	const plottingChart = useRef(null);
	const [data, setData] = useState(null);
	const [availableCol, setAvailableCol] = useState([]);
	const [selectedXaxis, setSelectedXaxis] = useState(null);
	const [selectedYaxes, setSelectedYaxes] = useState([]);
	const [fileName, setFileName] = useState("");

	const handleYAxisSelect = (value) => {
		console.log(value);
		setAvailableCol(availableCol.filter((c) => c !== value));
		setSelectedYaxes([...selectedYaxes, value]);
		console.log(availableCol.filter((c) => c !== value));
	};

	const handleYAxisDeselect = (value) => {
		console.log(value);
		setAvailableCol((prev) => [...prev, value]);
		setSelectedYaxes(selectedYaxes.filter((c) => c !== value));
		console.log([...availableCol, value]);
	};

	const handleXAxisChange = (value) => {
		console.log(`selected ${value}`);
		setSelectedXaxis(value);
	};

	const doHandlePlot = () => {
		if (!data) {
			message.error("No data uploaded!");
			return;
		} else if (!selectedXaxis) {
			message.error("Please Select X-Axis!");
			return;
		} else if (!selectedYaxes.length) {
			message.error("Please Select Y-Axis!");
			return;
		}
		plottingChart.current.getEchartsInstance();
		// create series
		let allSeries = [];
		selectedYaxes.map((series) => {
			allSeries.push({
				name: series,
				type: "line",
				data: data[series],
			});
		});
		plottingChart.current.getEchartsInstance().dispatchAction({
			type: "restore",
		});
		plottingChart.current.getEchartsInstance().setOption({
			title: {
				text: fileName,
			},
			tooltip: {
				trigger: "axis",
			},
			legend: {
				data: selectedYaxes,
			},
			xAxis: {
				type: "value",
				boundaryGap: false,
				data: data[selectedXaxis],
				name: selectedXaxis,
				scale: true,
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: 20,
				},
			},
			yAxis: {
				type: "value",
				scale: true,
			},
			series: allSeries,
			toolbox: {
				show: true,
			},
		});
	};

	const _createData = (data) => {
		let newData = {};
		let headers = Object.keys(data[0]);
		setAvailableCol(headers);
		headers.forEach((h) => {
			newData[h] = [];
		});
		data.forEach((d) => {
			headers.map((h) => {
				newData[h].push(d[h]);
			});
		});
		console.log(newData);
		setData(newData);
		// return data;
	};

	const fileUploadHandler = (info) => {
		console.log("info", info);
		setFileName(info.file.name);
		if (info.fileList.length) {
			papa.parse(info.file.originFileObj, {
				header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				complete: function (results) {
					console.log("parsed", results.data);
					_createData(results.data);
				},
			});
		}
	};

	const removeFile = (e) => {
		console.log("onRemove");
		setData(null);
	};

	return (
		<div style={{ marginTop: "4rem" }} className="mx-3">
			{/* <div className='p-2' style={{ display: "flex", flexDirection: "row-reverse" }}>
        <Tooltip title='Full-Screen'>
          <Button
            type='primary'
            shape='circle'
            onClick={() => toggle_full_screen()}
            icon={<FullscreenOutlined />}
            size='large'
          />
        </Tooltip>
      </div> */}
			<div className="my-3 row">
				<div className="col-md-6">
					<Dragger
						multiple={false}
						maxCount={1}
						name="file"
						onChange={(info) => fileUploadHandler(info)}
						customRequest={() => {}}
						iconRender={() => <FileTextOutlined />}
						accept=".csv, text/csv, text/plain"
						onRemove={removeFile}
					>
						<p className="ant-upload-drag-icon">
							<InboxOutlined />
						</p>
						<p className="ant-upload-text">Click or drag file to this area to upload</p>
						<p className="ant-upload-hint">Support for a csv</p>
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
			<Divider style={{ marginTop: "50px" }} />
			<div>
				<ReactEcharts
					style={{ width: "90vw", height: "500px" }}
					ref={plottingChart}
					option={{
						legend: {
							type: "scroll",
							align: "right",
							left: "right",
							top: "10%",
							orient: "vertical",
						},
						grid: {
							left: "0%",
							right: "15%",
							containLabel: true,
						},
						toolbox: {
							show: false,
							feature: {
								saveAsImage: {},
								restore: {
									show: true,
								},
								dataView: {
									show: true,
								},
								dataZoom: {
									show: true,
								},
								magicType: {
									show: true,
									type: ["line", "bar", "stack"],
								},
								brush: {},
							},
						},
					}}
				/>
			</div>
		</div>
	);
};

export default Plotter;
