import React, { useState, useEffect } from "react";
import { Button, Input, Tree, Layout, Spin, Empty, Result } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import axios from "axios";
import SimpleBarReact from "simplebar-react";
import "simplebar/src/simplebar.css";

const { Search } = Input;
const { Sider } = Layout;

const _generateTreeData = (data) => {
	let x = [
		{
			title: "Battery Archive",
			key: "amplabs",
			children: [],
		},
		{
			title: "data.matr.io",
			key: "datamatrio",
			children: [
				{
					title: "Capacity Degradation",
					key: "1-0",
					children: [
						{
							title: "2017-05-12",
							key: "1-0-0",
							children: [],
						},
					],
				},
			],
		},
		{
			title: "Private",
			key: "private",
			children: [],
		},
	];
	let amplabsDirInfo = {};
	data.map((cellMeta) => {
		let cellType = cellMeta.type + "_";
		switch (cellMeta.type) {
			case "public/battery-archive":
				let dirName = cellMeta.cell_id.split("_", 1)[0];
				if (amplabsDirInfo[dirName] === undefined) {
					x[0].children.push({
						title: dirName,
						key: dirName,
						children: [
							{
								title: cellMeta.cell_id,
								key: "cell_" + cellType + cellMeta.cell_id,
							},
						],
					});
					amplabsDirInfo[dirName] = x[0].children.length - 1;
				} else {
					x[0].children[amplabsDirInfo[dirName]].children.push({
						title: cellMeta.cell_id,
						key: "cell_" + cellType + cellMeta.cell_id,
					});
				}
				break;
			case "public/data.matr.io":
				x[1].children[0].children[0].children.push({
					title: cellMeta.cell_id,
					key: "cell_" + cellType + cellMeta.cell_id,
				});
				break;
			case "private":
				x[2].children.push({
					title: cellMeta.cell_id,
					key: "cell_" + cellType + cellMeta.cell_id,
				});
				break;
			default:
				break;
		}
	});
	return x;
};

const SideBar = (props) => {
	const [checkedKeys, setCheckedKeys] = useState([]);
	const [sideBarCollapse, setSideBarCollapse] = useState(false);
	const [filteredTreeData, setFilteredTreeData] = useState([]);
	const [treeData, setTreeData] = useState([]);
	const [checkedCellIds, setCheckedCellIds] = useState([]);
	const [isCelldataLoaded, setIsCelldataLoaded] = useState(false);
	const [error, setError] = useState(null);

	useEffect(() => {
		setIsCelldataLoaded(false);
		let endpoint = props.testType === "abuse-test" ? "/cells/abuse/meta" : "/cells/cycle/meta";
		console.log("endpointt", endpoint);
		axios
			.get(endpoint)
			.then((res) => {
				console.log("sidebar ", res);
				if (res.status === 200 && res.data) {
					let treeData = _generateTreeData(res.data.records[0]);
					console.log("treeData", treeData);
					setTreeData(treeData);
					setFilteredTreeData(() => {
						setIsCelldataLoaded(true);
						return treeData;
					});
				}
			})
			.catch((err) => {
				console.log("get cellId err", err);
				setError(err);
			});
	}, [props.refresh]);

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

	const onCheck = (checkedKeysValue) => {
		console.log("onCheck", checkedKeysValue);
		setCheckedKeys(checkedKeysValue);
		let x = [];
		checkedKeysValue.map((k) => {
			let identifier = k.split("_", 1)[0];
			console.log("identifier", identifier);
			if (identifier === "cell") {
				x.push(k.substring(k.indexOf("_") + 1));
			}
		});
		console.log(x);
		setCheckedCellIds(x);
	};

	const onChange = (e) => {
		let searchName = e.target.value;
		let filtered = treeData.filter((item) => findObjectAndParents(item, searchName));
		setFilteredTreeData(filtered);
	};

	const onLoad = () => {
		props.onLoadCellIds(checkedCellIds);
	};

	const onClear = () => {
		setCheckedKeys([]);
		setCheckedCellIds([]);
		setFilteredTreeData(treeData);
		props.onLoadCellIds([]);
	};

	const onEdit = () => {
		props.onEditCellIds(checkedCellIds);
	};

	return (
		<>
			<Sider
				collapsed={sideBarCollapse}
				trigger={null}
				collapsible
				style={{
					position: "sticky",
					overflow: "auto",
					height: "100%",
					left: 0,
					top: 80,
					bottom: 0,
					padding: "0.5rem 0.3rem",
					// borderRight: "1px solid #D3D3D3",
					borderRadius: "5px",
					marginRight: "5px",
				}}
				collapsedWidth={50}
				width={300}
				theme="light"
			>
				<SimpleBarReact style={{ maxHeight: "90vh" }}>
					<Button
						style={{ float: "right" }}
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
							<div className="row justify-content-around pb-3">
								<div className="col-4">
									<Button type="primary" onClick={() => onEdit()}>
										Edit
									</Button>
								</div>
								<div className="col-4">
									<Button type="primary" onClick={() => onClear()}>
										Clear
									</Button>
								</div>
								<div className="col-4">
									<Button type="primary" onClick={() => onLoad()}>
										Load
									</Button>
								</div>
							</div>
							{error ? <Result status="warning" extra={<p>Error loading data!</p>} /> : null}
							<div style={{ minHeight: "100%" }}>
								{isCelldataLoaded ? (
									<>
										<div className="text-muted" style={{ float: "right", fontSize: "0.8rem" }}>
											Selected: {checkedCellIds.length}
										</div>
										<Tree
											checkable
											showLine
											onCheck={onCheck}
											checkedKeys={checkedKeys}
											treeData={filteredTreeData}
											autoExpandParent={true}
											defaultExpandedKeys={["amplabs", "datamatrio", "private"]}
										/>
									</>
								) : (
									<Spin />
								)}
							</div>
						</>
					)}
				</SimpleBarReact>
			</Sider>
			{/* <Divider type="vertical" className="handle" /> */}
		</>
	);
};

export default SideBar;
