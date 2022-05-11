import { Button, Col, Input, Layout, Row, Space, Tree } from "antd";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import DashboardAbuseTest from "./DashboardAbuseTest";
import DashboardCycleTest from "./DashboardCycleTest";

const { Sider, Content } = Layout;
const { Search } = Input;

const treeData = [
	{
		title: "Battery Archive",
		key: "ba",
		children: [
			{
				title: "UL-PUR",
				key: "0",
				children: [{ title: "Cell A", key: "0-0-1" }],
			},
			{
				title: "CALCE",
				key: "0-1",
				children: [{ title: "Cell B", key: "0-1-1" }],
			},
			{
				title: "HNEI - Degradation of Batch Cells",
				key: "0-2",
				children: [{ title: "HNEI_18650_NMC_LCO_25C_0-100_0.5/1.5C_a", key: "0-2-1" }],
			},
		],
	},
	{
		title: "data.matr.io",
		key: "1",
		children: [
			{
				title: "Capacity Degradation",
				key: "1-0",
				children: [
					{
						title: "2017-05-12",
						key: "1-0-0",
						children: [
							{ title: "HNEI_18650_NMC_LCO_25C_0-100_0.5/1.5C_a", key: "1-0-0-0" },
							{ title: "HNEI_18650_NMC_LCO_25C_0-100_0.5/1.5C_a", key: "1-0-0-1" },
						],
					},
				],
			},
		],
	},
];

const dataList = [];
const generateList = (data) => {
	for (let i = 0; i < data.length; i++) {
		const node = data[i];
		const { key } = node;
		dataList.push({ key, title: key });
		if (node.children) {
			generateList(node.children);
		}
	}
};
generateList(treeData);

const getParentKey = (key, tree) => {
	let parentKey;
	for (let i = 0; i < tree.length; i++) {
		const node = tree[i];
		if (node.children) {
			if (node.children.some((item) => item.key === key)) {
				parentKey = node.key;
			} else if (getParentKey(key, node.children)) {
				parentKey = getParentKey(key, node.children);
			}
		}
	}
	return parentKey;
};

const DashboardPage = () => {
	const location = useLocation();
	const [pageType, setPageType] = useState("");

	useEffect(() => {
		console.log("uploadsadasdasd", location);
		if (location.pathname === "/dashboard/abuse-test") {
			setPageType("abuse-test");
		} else if (location.pathname === "/dashboard/cycle-test" || location.pathname === "/dashboard") {
			setPageType("cycle-test");
		}
	}, [location]);

	const [expandedKeys, setExpandedKeys] = useState([]);
	const [checkedKeys, setCheckedKeys] = useState([]);
	const [selectedKeys, setSelectedKeys] = useState([]);
	const [autoExpandParent, setAutoExpandParent] = useState(true);
	const [searchValue, setSearchValue] = useState("");

	const onExpand = (expandedKeysValue) => {
		console.log("onExpand", expandedKeysValue); // if not set autoExpandParent to false, if children expanded, parent can not collapse.
		// or, you can remove all expanded children keys.

		setExpandedKeys(expandedKeysValue);
		setAutoExpandParent(false);
	};

	const onCheck = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue);
	};

	const onSelect = (selectedKeysValue, info) => {
		console.log("onSelect", info);
		setSelectedKeys(selectedKeysValue);
	};

	const onChange = (e) => {
		// const { value } = e.target;
		// const expandedKeys = dataList
		// 	.map((item) => {
		// 		if (item.title.indexOf(value) > -1) {
		// 			return getParentKey(item.key, treeData);
		// 		}
		// 		return null;
		// 	})
		// 	.filter((item, i, self) => item && self.indexOf(item) === i);
		// setExpandedKeys(expandedKeys);
		// setSearchValue(value);
		// setAutoExpandParent(true);
	};

	return (
		<div style={{ paddingTop: "1rem" }}>
			<Layout hasSider>
				<Sider
					// collapsed={true}
					style={{
						overflow: "auto",
						height: "100vh",
						position: "fixed",
						left: 0,
						top: 80,
						bottom: 0,
						padding: "0.5rem 1rem",
						borderRight: "1px solid #D3D3D3",
					}}
					width={300}
					theme="light"
				>
					<Button style={{ float: "right" }} icon={<FaBars />} shape="circle" size="medium" href="#" />
					<Search className="py-2" placeholder="Search" onChange={(e) => onChange(e)} />
					<Row justify="space-around" className="pb-3">
						<Col>
							<Button type="primary">Edit</Button>
						</Col>
						<Col>
							<Button type="primary">Clear</Button>
						</Col>
						<Col>
							<Button type="primary">Load</Button>
						</Col>
					</Row>
					<Tree
						checkable
						defaultExpandAll
						onExpand={onExpand}
						// expandedKeys={expandedKeys}
						autoExpandParent={autoExpandParent}
						onCheck={onCheck}
						checkedKeys={checkedKeys}
						onSelect={onSelect}
						selectedKeys={selectedKeys}
						treeData={treeData}
					/>
				</Sider>
				<Layout className="site-layout" style={{ marginLeft: 300 }}>
					<Content>
						{pageType === "cycle-test" ? (
							<DashboardCycleTest />
						) : pageType === "abuse-test" ? (
							<DashboardAbuseTest />
						) : (
							""
						)}
					</Content>
				</Layout>
			</Layout>
		</div>
	);
};

export default DashboardPage;
