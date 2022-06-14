import React, { useContext, useState, useEffect, useRef } from "react";
import { Table, Input, Form, Button, Typography } from "antd";
import { inputType } from "../formConfigs/formConfigs";
const EditableContext = React.createContext(null);

const { Title } = Typography;

const EditableRow = ({ index, ...props }) => {
	const [form] = Form.useForm();
	return (
		<Form form={form} component={false}>
			<EditableContext.Provider value={form}>
				<tr {...props} />
			</EditableContext.Provider>
		</Form>
	);
};

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
	const [editing, setEditing] = useState(false);
	const inputRef = useRef(null);
	const form = useContext(EditableContext);
	useEffect(() => {
		if (editing) {
			inputRef.current.focus();
		}
	}, [editing]);

	const toggleEdit = () => {
		setEditing(!editing);
		form.setFieldsValue({
			[dataIndex]: record[dataIndex],
		});
	};

	const save = async () => {
		try {
			const values = await form.validateFields();
			toggleEdit();
			handleSave({ ...record, ...values });
		} catch (errInfo) {
			console.error("Save failed:", errInfo);
		}
	};

	let childNode = children;

	if (editable && record.type === "private") {
		childNode = editing ? (
			<Form.Item
				style={{
					margin: 0,
				}}
				name={dataIndex}
				// rules={[
				// 	{
				// 		required: true,
				// 		message: `${title} is required.`,
				// 	},
				// ]}
			>
				<Input
					ref={inputRef}
					type={inputType[dataIndex]}
					onPressEnter={save}
					onBlur={save}
					// disabled={record.type !== "private"}
				/>
			</Form.Item>
		) : (
			<div
				className="editable-cell-value-wrap"
				style={{
					paddingRight: 24,
				}}
				onClick={toggleEdit}
			>
				{children}
			</div>
		);
	}

	return <td {...restProps}>{childNode}</td>;
};

// ============================
const EditableTable = (props) => {
	const [dataSource, setDataSource] = useState([]);
	const [columns, setColumns] = useState([]);

	useEffect(() => {
		setDataSource([...props.dataSource]);
	}, [props.dataSource]);

	useEffect(() => {
		setColumns(_formatColumns(props.columns));
	}, [dataSource, props.columns]);

	const _formatColumns = (columns) => {
		return columns.map((col) => {
			if (!col.editable) {
				return col;
			}
			return {
				...col,
				onCell: (record) => ({
					record,
					editable: col.editable,
					dataIndex: col.dataIndex,
					title: col.title,
					handleSave: handleSave,
				}),
			};
		});
	};

	const handleSave = (row) => {
		const newData = [...dataSource];
		const index = newData.findIndex((item) => row.key === item.key);
		const item = newData[index];
		newData.splice(index, 1, { ...item, ...row });
		setDataSource(newData);
	};

	const components = {
		body: {
			row: EditableRow,
			cell: EditableCell,
		},
	};

	const handleMetadataSave = () => { 
		props.onSave(JSON.parse(JSON.stringify(dataSource)));
	};

	return (
		<div className="p-1">
			<Table
				sticky={true}
				title={() => <Title level={4}>{props.title}</Title>}
				loading={!dataSource.length}
				pagination={false}
				components={components}
				rowClassName={() => "editable-row"}
				bordered
				dataSource={dataSource}
				columns={columns}
				// rowKey="index"
			/>
			{props.shallShowSaveBtn && (
				<Button onClick={handleMetadataSave} type="primary" className="my-1 shadow" style={{ float: "right" }}>
					Save Changes
				</Button>
			)}
		</div>
	);
};

export default EditableTable;
