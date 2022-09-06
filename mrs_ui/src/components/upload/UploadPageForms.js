import React, { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Form, Input, Typography, Radio, Space, Collapse } from "antd";

const { Panel } = Collapse;

const { Title } = Typography;

const UploadPageForms = ({ pageType, userPlan }, ref) => {
	const [cellMdform] = Form.useForm();
	const [cycleMdform] = Form.useForm();
	const [abuseMdform] = Form.useForm();

	const [cellMetadata, setCellMetadata] = useState({is_public:true});
	const [cycleTestMetadata, setCycleTestMetadata] = useState({});
	const [abuseTestMetadata, setAbuseTestMetadata] = useState({});
	const [value, setValue] = useState(true)

	const onChange = (e) => {
		setValue(e.target.value)
		let x = {};
		x["is_public"] = e.target.value
		setCellMetadata({ ...cellMetadata, ...x });
	};

	useImperativeHandle(ref, () => ({
		getCellMetadata() {
			return cellMetadata;
		},
		getCycleTestMetadata() {
			return cycleTestMetadata;
		},
		getAbuseTestMetadata() {
			return abuseTestMetadata;
		},
		resetForm() {
			cellMdform.resetFields();
			cycleMdform.resetFields();
			abuseMdform.resetFields();
			setCellMetadata({});
			setCycleTestMetadata({});
			setAbuseTestMetadata({});
		},
	}));

	return (
		<div className="row">
			<div className="col-md-6">
				<Collapse defaultActiveKey={["1"]}>
					<Panel header="Enter Cell Metadata" key="1">
						{/* <div className="my-1 text-center">
							<Title level={5}>Cell ID Metadata</Title>
						</div> */}
						<Form
							form={cellMdform}
							layout="vertical"
							name="cellId"
							onFieldsChange={(e) => {
								let x = {};
								x[e[0].name[0]] = e[0].value;
								x["is_public"] = value
								setCellMetadata({ ...cellMetadata, ...x });
							}}
						>
							<Form.Item
								label="Cell Id"
								name="cell_id"
								rules={[
									{
										required: true,
										message: "Please provide a Cell Id!",
									},
								]}
							>
								<Input allowClear />
							</Form.Item>
							<Form.Item label="Anode" name="anode">
								<Input allowClear />
							</Form.Item>
							<Form.Item label="Cathode" name="cathode">
								<Input allowClear />
							</Form.Item>
							<Form.Item label="Source" name="source">
								<Input allowClear />
							</Form.Item>
							<Form.Item label="Ah" name="ah">
								<Input type="number" allowClear />
							</Form.Item>
							<Form.Item label="Form Factor" name="form_factor">
								<Input allowClear />
							</Form.Item>
							<Form.Item label="Active Mass (mg)" name="active_mass">
								<Input type="number" allowClear />
							</Form.Item>
						</Form>
					</Panel>
				</Collapse>
			</div>
			<div className="col-md-6">
				{pageType === "cycle-test" ? (
					<>
						<Collapse defaultActiveKey={["1"]}>
							<Panel header="Enter Cycle Test Metadata" key="1">
								{/* <div className="my-1 text-center">
							<Title level={5}>Cycle Test Metadata</Title>
						</div> */}
								<Form
									form={cycleMdform}
									layout="vertical"
									name="cycleTest"
									onFieldsChange={(e) => {
										let x = {};
										x[e[0].name[0]] = e[0].value;
										setCycleTestMetadata({ ...cycleTestMetadata, ...x });
									}}
								>
									<Form.Item label="Temperature (C)" name="temperature">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Max SOC" name="soc_max">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Min SOC" name="soc_min">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Chart Rate (C)" name="crate_c">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Discharge Rate (C)" name="crate_d">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Visibility">
										<Radio.Group onChange={onChange} label="Upload type" defaultValue={true}>
											<Space direction="vertical">
												<Radio value={false} disabled={userPlan === "COMMUNITY"} >Private</Radio>
												<Radio value={true} >Public</Radio>
											</Space>
										</Radio.Group>
									</Form.Item>
								</Form>
							</Panel>
						</Collapse>
					</>
				) : (
					<>
						<Collapse defaultActiveKey={["1"]}>
							<Panel header="Enter Abuse Test Metadata" key="1">
								{/* <div className="my-1 text-center">
									<Title level={5}>Abuse Test Metadata</Title>
								</div> */}
								<Form
									form={abuseMdform}
									layout="vertical"
									name="cycleTest"
									onFieldsChange={(e) => {
										let x = {};
										x[e[0].name[0]] = e[0].value;
										setAbuseTestMetadata({ ...abuseTestMetadata, ...x });
									}}
								>
									<Form.Item label="Temperature (C)" name="temperature">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Thickness (in)" name="thickness">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="V t=0 (V)" name="v_init">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Indentor" name="indentor">
										<Input type="number" allowClear />
									</Form.Item>
									<Form.Item label="Nail Speed" name="nail_speed">
										<Input type="number" allowClear />
									</Form.Item>
								</Form>
							</Panel>
						</Collapse>
					</>
				)}
			</div>
		</div>
	);
};

export default React.memo(forwardRef(UploadPageForms));
