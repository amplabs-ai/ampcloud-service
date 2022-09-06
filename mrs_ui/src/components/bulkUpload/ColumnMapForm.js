import React, { useEffect, useState } from "react";
import { Form, Input, List, Select } from "antd";
import stringSimilarity from "string-similarity";

const { Option } = Select;

const ColumnMapForm = ({ headers, options, fileName, onValChange }) => {
	const [dataSource, setDataSource] = useState([]);

	const onChange = (value, item) => {
		onValChange(item, value, fileName);
	};

	useEffect(() => {
		let ops = Object.keys(options);
		if (!(headers && headers.length && ops.length)) {
			return;
		}
		const getDefaultValue = (item) => {
			let matches = stringSimilarity.findBestMatch(item, ops);
			let res = matches.bestMatch.rating >= 0.2 ? matches.bestMatch.target : "";
			return options[res] || "";
		};
		let countMissingHeader = 0;
		let data = headers.map((h) => {
			let header = {};
			if (!h) {
				countMissingHeader++;
				h = `--missing header(${countMissingHeader})--`;
				header.defaultValue = "";
			} else {
				header.defaultValue = getDefaultValue(h);
			}
			onValChange(h, header.defaultValue, fileName);
			header.name = h;
			return header;
		});
		setDataSource(data);
	}, [headers, options]);

	return (
		<div style={{ maxHeight: "50vh", overflowY: "scroll", paddingRight: "10px" }}>
			<Form
				// initialValues={initialValues}
				labelCol={{
					span: 10,
				}}
				wrapperCol={{
					span: 14,
				}}
				// form={formInstance}
			>
				{dataSource.map((item) => (
					<Form.Item name={item.name} label={item.name} key={item.name}>
						<Select
							style={{
								minWidth: 120,
							}}
							onChange={(val) => onChange(val, item.name)}
							dropdownMatchSelectWidth={false}
							placement="bottomRight"
							defaultValue={item.defaultValue}
							// value={item.value}
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
