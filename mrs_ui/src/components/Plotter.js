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

const Plotter = () => {
	const navigate = useNavigate();

	const plottingChart = useRef(null);
	const [data, setData] = useState(null);
	const [availableCol, setAvailableCol] = useState([]);
	const [selectedXaxis, setSelectedXaxis] = useState(null);
	const [selectedYaxes, setSelectedYaxes] = useState([]);
	const [fileName, setFileName] = useState("");

	const [file, setFile] = useState(null);

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

	const _createSeries = () => {
		let x = [];
		selectedYaxes.map((y) => {
			x.push({
				name: y,
				type: "scatter",
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
				scale: true,
				nameLocation: "middle",
				nameGap: 25,
				nameTextStyle: {
					fontSize: 20,
				},
			},
			yAxis: {
				scale: true,
			},
			series: _createSeries(),
			toolbox: {
				show: true,
			},
		});
	};

	const fileUploadHandler = (info) => {
		console.log("info", info);
		setFile(info.file.originFileObj);
		setFileName(info.file.name);
		if (info.fileList.length) {
			papa.parse(info.file.originFileObj, {
				// header: true,
				skipEmptyLines: true,
				dynamicTyping: true,
				complete: function (results) {
					console.log("parsed", results.data);
					setAvailableCol(results.data[0]);
					setData(results.data);
				},
			});
		}
	};

	// const dynamicSort = (property) => {
	// 	var sortOrder = 1;
	// 	if (property[0] === "-") {
	// 		sortOrder = -1;
	// 		property = property.substr(1);
	// 	}
	// 	return function (a, b) {
	// 		/* next line works with strings and numbers,
	// 		 * and you may want to customize it to your needs
	// 		 */
	// 		var result = a[property] < b[property] ? -1 : a[property] > b[property] ? 1 : 0;
	// 		return result * sortOrder;
	// 	};
	// };

	const removeFile = (e) => {
		console.log("onRemove");
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
			{/* <div className="p-2" style={{ display: "flex", flexDirection: "row-reverse" }}>
				<Tooltip title="Full-Screen">
					<Button
						type="primary"
						shape="circle"
						onClick={() => toggle_full_screen()}
						icon={<FullscreenOutlined />}
						size="large"
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
				<Button
					size="small"
					type="primary"
					style={{ float: "right" }}
					onClick={() => {
						navigate("/upload/cycle-test", { state: { file: file } });
					}}
					disabled={!file}
				>
					Add to database
				</Button>
			</Divider>
			<div className="card shadow p-2">
				<ReactEcharts
					style={{ width: "95vw", height: "600px" }}
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
							left: "5%",
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
							},
						},
					}}
				/>
			</div>
		</div>
	);
};

export default Plotter;
