import { Button, Col, Input, Layout, Row, Space, Tree } from "antd";
import React, { useEffect, useState } from "react";
import { FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import DashboardAbuseTest from "./DashboardAbuseTest";
import DashboardCycleTest from "./DashboardCycleTest";

import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

const { Sider, Content } = Layout;
const { Search } = Input;

const getInitialTreeData = () => {
	return [
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
};

const DashboardPage = () => {
	const location = useLocation();
	const [pageType, setPageType] = useState("");
	const [treeData, setTreeData] = useState(() => getInitialTreeData());

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
	const [sideBarCollapse, setSideBarCollapse] = useState(false);
	const [filteredTreeData, setFilteredTreeData] = useState(() => getInitialTreeData());

	const findObjectAndParents = (item, title) => {
		if (item.title.toLowerCase().includes(title.toLowerCase()) || !title) {
			return true;
		}
		if (item.children) {
			for (let i = 0; i < item.children.length; i++) {
				if (findObjectAndParents(item.children[i], title)) {
					return true;
				}
			}
		}
		return false;
	};

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
		console.log(e.target.value);
		let searchName = e.target.value;
		console.log(treeData);
		let filtered = treeData.filter((item) => findObjectAndParents(item, searchName));
		setFilteredTreeData(filtered);
		console.log(filtered);
	};

	return (
		<div style={{ paddingTop: "1rem" }}>
			<Layout hasSider>
				<Sider
					collapsed={sideBarCollapse}
					trigger={null}
					collapsible
					style={{
						position: "sticky",
						overflow: "auto",
						height: "100vh",
						left: 0,
						top: 80,
						bottom: 0,
						padding: "0.5rem 1rem",
						borderRight: "1px solid #D3D3D3",
					}}
					width={300}
					theme="light"
				>
					<Button
						onClick={() => {
							setSideBarCollapse(!sideBarCollapse);
						}}
						icon={sideBarCollapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						className="trigger"
					/>
					{sideBarCollapse ? (
						<></>
					) : (
						<>
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
							<div style={{ overflow: "auto" }}>
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
									treeData={filteredTreeData}
								/>
							</div>
						</>
					)}
				</Sider>
				<Layout className="site-layout" style={{ marginLeft: "auto" }}>
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
