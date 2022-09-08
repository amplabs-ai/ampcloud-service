import React from "react";
import { Checkbox, Divider, Form, Input, Select } from "antd";
import { useUserPlan } from "../../context/UserPlanContext";

const { Option } = Select;

const ColumnMapForm = ({ formInfo, options, onColMapChange, onFileInfoInputChange }) => {
	const userPlan = useUserPlan();

	const onHeaderMapChange = (item, value) => {
		console.log("onHeaderMapChange", value, item);
		onColMapChange(item, value, formInfo.fileName);
	};

	const fileInputChange = (item, value) => {
		onFileInfoInputChange(item, value, formInfo.fileName);
	};

	return (
		<div style={{ maxHeight: "50vh", overflowY: "scroll", paddingRight: "10px" }}>
			<Form
				labelCol={{
					span: 10,
				}}
				wrapperCol={{
					span: 14,
				}}
			>
				<div className="row">
					<div className="col-md-6">
						<Form.Item name="cell_id" label="Cell Id">
							<Input defaultValue={formInfo.cellId} onChange={(e) => fileInputChange("cellId", e.target.value)} />
						</Form.Item>
					</div>
					<div className="col-md-6">
						<Form.Item name="isPublic" label="isPublic?">
							<Checkbox
								checked={formInfo.isPublic}
								disabled={userPlan.includes("COMMUNITY")}
								onChange={(e) => fileInputChange("isPublic", e.target.checked)}
							></Checkbox>
						</Form.Item>
					</div>
				</div>
				<Divider className="m-0 p-1" />
				{Object.keys(formInfo.mappings).map((item) => (
					<Form.Item name={item} label={item} key={item}>
						<Select
							style={{
								minWidth: 120,
							}}
							onChange={(val) => onHeaderMapChange(item, val)}
							dropdownMatchSelectWidth={false}
							placement="bottomRight"
							defaultValue={formInfo.mappings[item]}
							showSearch
						>
							{Object.keys(options).map((o) => (
								<Option key={o} value={options[o]}>
									{o}
								</Option>
							))}
						</Select>
					</Form.Item>
				))}
			</Form>
		</div>
	);
};

export default React.memo(ColumnMapForm);
