import React, { useState, useEffect } from "react";
import { Button, Input, Tree, Layout, Spin, Result } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import axios from "axios";
import SimpleBarReact from "simplebar-react";
import "simplebar/src/simplebar.css";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useDashboard } from "../../context/DashboardContext";
import { useUserPlan } from "../../context/UserPlanContext";
import SubsPrompt from "../SubsPrompt";
import { useLocation } from "react-router-dom";

const { Search } = Input;
const { Sider } = Layout;

const _generateTreeData = (data, userPlan) => {
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
					key: "capacity_degradation",
					children: [],
				},
				{
					title: "Closed-loop optimization",
					key: "closed-loop_optimization",
					children: [],
				},
			],
		},
		{
			title: "Public",
			key: "public",
			children: [],
		},
		{
			title: "Private",
			key: "private",
			children: [],
			disabled: !userPlan?.includes("PRO"),
		},
	];
	let amplabsDirInfo = {};
	let dataMatrIoDirInfo = {
		capacityDegrad: {},
		closeLoopOpt: {},
	};
	data.map((cellMeta) => {
		let cellType = cellMeta.type + "_";
		let cellId = cellMeta.cell_id;
		switch (cellMeta.type) {
			case "public/battery-archive":
				let dirName = cellId.split("_", 1)[0];
				if (amplabsDirInfo[dirName] === undefined) {
					x[0].children.push({
						title: dirName,
						key: dirName,
						children: [
							{
								title: cellId,
								key: "cell_" + cellType + cellId,
							},
						],
					});
					amplabsDirInfo[dirName] = x[0].children.length - 1;
				} else {
					x[0].children[amplabsDirInfo[dirName]].children.push({
						title: cellId,
						key: "cell_" + cellType + cellId,
					});
				}
				break;
			case "public/data.matr.io":
				let projectDirIndex;
				let batchIndex;
				if (cellId.includes("_oed_") || cellId.includes("_batch9_")) {
					// project: close-loop optimization
					projectDirIndex = 1;
					let batchNameCloseloop;
					if (cellId.includes("_oed_")) {
						batchNameCloseloop = "Batch " + cellId.split("_")[1] + "_" + cellId.split("_")[2];
					} else {
						batchNameCloseloop = "Batch9 (validation batch)";
					}
					if (dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop] === undefined) {
						x[1].children[projectDirIndex].children.push({
							title: batchNameCloseloop,
							key: batchNameCloseloop,
							children: [],
						});
						dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop] = x[1].children[projectDirIndex].children.length - 1;
						// batchIndex = 0;
					} else {
					}
					batchIndex = dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop];
				} else {
					// project: capacity degradation
					projectDirIndex = 0;
					let batchNameCapDeg = cellId.split("_", 1)[0];
					if (dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] === undefined) {
						x[1].children[projectDirIndex].children.push({
							title: batchNameCapDeg,
							key: batchNameCapDeg,
							children: [],
						});
						dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] = x[1].children[projectDirIndex].children.length - 1;
						// batchIndex = 0;
					} else {
					}
					batchIndex = dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg];
				}

				x[1].children[projectDirIndex].children[batchIndex].children.push({
					title: cellId,
					key: "cell_" + cellType + cellId,
				});
				break;
			case "public/user":
				x[2].children.push({
					title: cellId,
					key: "cell_" + cellType + cellId,
				});
				break;
			case "private":
				x[3].children.push({
					title: cellId,
					key: "cell_" + cellType + cellId,
					disabled: !userPlan?.includes("PRO"),
				});
				break;
			default:
				break;
		}
	});
	if (!x[2].children.length) {
		x.splice(2, 1);
	}
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

	const { state, action } = useDashboard();
	const accessToken = useAuth0Token();

	const userPlan = useUserPlan();
	const location = useLocation();
	const userEnteredFileKey = [];
	useEffect(() => {
		//   if (location.state !== null) {
		if (location.state && location.state.from === "upload" && location.state.cellId) {
			const { cellId } = location.state;
			setCheckedKeys(["cell_private_" + cellId]);
			setCheckedCellIds(["private_" + cellId]);
			//   action.plotCellData(["private_" + cellId]);
			action.loadCellData(["private_" + cellId]);

			userEnteredFileKey.push("cell_private_" + cellId);
		}
		//       //   const defaultSelctecKey = "cell_private_" + cellId;
		//       //     action.setCheckedCellIds(defaultSelctecKey);
		//       //     action.loadCellData(defaultSelctecKey);
		//       //   //   action.plotCellData(defaultSelctecKey);
		//     }
	}, [location.state]);
	useEffect(() => {
		if (accessToken && userPlan) {
			setIsCelldataLoaded(false);
			let endpoint = "/cells/cycle/meta";
			// const accessToken = await getAccessTokenSilently();
			// setCheckedCellIds([]);
			// setCheckedKeys([]);
			axios
				.get(endpoint, {
					headers: {
						Authorization: `Bearer ${accessToken}`,
					},
				})
				.then((res) => {
					if (res.status === 200 && res.data) {
						let treeData = _generateTreeData(res.data.records[0], userPlan);
						setTreeData(treeData);
						setFilteredTreeData(() => {
							setIsCelldataLoaded(true);
							return treeData;
						});
					}
				})
				.catch((err) => {
					console.error("get cellId err", err);
					setError(err);
				});
		}
	}, [state.refreshSidebar, accessToken, userPlan]);

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
		setCheckedKeys(checkedKeysValue);
		let x = [];
		checkedKeysValue.map((k) => {
			let identifier = k.split("_", 1)[0];
			if (identifier === "cell") {
				x.push(k.substring(k.indexOf("_") + 1));
			}
		});
		setCheckedCellIds(x);
	};

	const onChange = (e) => {
		let searchName = e.target.value;
		let filtered = treeData.filter((item) => findObjectAndParents(item, searchName));
		setFilteredTreeData(filtered);
	};

	const onLoad = () => {
		action.loadCellData(checkedCellIds);
		// props.onLoadCellIds(checkedCellIds);
	};

	const onPlot = () => {
		action.plotCellData(checkedCellIds);
	};

	const onClear = () => {
		setCheckedKeys([]);
		setCheckedCellIds([]);
		setFilteredTreeData(treeData);
		// props.onLoadCellIds([]);
		// props.onEditCellIds([]);
		action.clearDashboard();
	};

	const onMeta = () => {
		// props.onEditCellIds(checkedCellIds);
		action.editCellData(checkedCellIds);
	};

	return (
		<>
			<Sider
				collapsed={sideBarCollapse}
				trigger={null}
				collapsible
				style={{
					position: "sticky",
					// overflow: "auto",
					maxHeight: "100vh",
					left: 0,
					top: 80,
					bottom: 0,
					padding: "0.5rem 0.5rem",
					// borderRight: "1px solid #D3D3D3",
					borderRadius: "5px",
					marginRight: "5px",
				}}
				collapsedWidth={50}
				width={300}
				theme="light"
				className="shadow"
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
							<div className="row justify-content-around pb-2">
								<div className="col-md-6">
									<Button type="primary" block onClick={() => onClear()} disabled={!checkedKeys.length}>
										Clear
									</Button>
								</div>
								<div className="col-md-6">
									<Button type="primary" block onClick={() => onPlot()} disabled={!checkedKeys.length}>
										Plot
									</Button>
								</div>
							</div>
							<div className="row pb-2">
								<div className="col-md-12">
									<Button type="primary" block onClick={() => onLoad()} disabled={!checkedKeys.length}>
										Load Dashboard
									</Button>
								</div>
							</div>
							<div className="row pb-3">
								<div className="col-md-12">
									<Button type="primary" block onClick={() => onMeta()} disabled={!checkedKeys.length}>
										View Metadata
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
											defaultExpandedKeys={["amplabs", "datamatrio", "private", "public"]}
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
