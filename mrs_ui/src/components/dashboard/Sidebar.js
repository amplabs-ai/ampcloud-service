import React, { useState, useEffect } from "react";
import { Button, Input, Tree, Layout, Spin, Result } from "antd";
import axios from "axios";
import SimpleBarReact from "simplebar-react";
import "simplebar/src/simplebar.css";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useDashboard } from "../../context/DashboardContext";
import { useUserPlan } from "../../context/UserPlanContext";
import { useLocation, useNavigate } from "react-router-dom";
import InfoBatteryArchiveModal from "./InfoBatteryArchiveModal";

const { Search } = Input;
const { Sider } = Layout;

const _generateTreeData = (data, userPlan) => {
	let x = [
		{
			title: "Private",
			key: "private",
			children: [],
			disabled: !userPlan?.includes("PRO"),
		},
		{
			title: "Public",
			key: "public",
			children: [],
		},
		{
			title: <InfoBatteryArchiveModal />,
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


	];
	let amplabsDirInfo = {};
	let dataMatrIoDirInfo = {
		capacityDegrad: {},
		closeLoopOpt: {},
	};
	data.map((cellMeta) => {
		let cellType = cellMeta.type + "_";
		let cellId = cellMeta.cell_id;
		let index = cellMeta.index;
		switch (cellMeta.type) {
			case "public/battery-archive":
				let dirName = cellId.split("_", 1)[0];
				if (amplabsDirInfo[dirName] === undefined) {
					x[2].children.push({
						title: dirName,
						key: dirName,
						children: [
							{
								title: cellId,
								key: "cell_" + index + "_" + cellType + cellId,
							},
						],
					});
					amplabsDirInfo[dirName] = x[2].children.length - 1;
				} else {
					x[2].children[amplabsDirInfo[dirName]].children.push({
						title: cellId,
						key: "cell_" + index + "_" + cellType + cellId,
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
						x[3].children[projectDirIndex].children.push({
							title: batchNameCloseloop,
							key: batchNameCloseloop,
							children: [],
						});
						dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop] = x[3].children[projectDirIndex].children.length - 1;
						// batchIndex = 0;
					} else {
					}
					batchIndex = dataMatrIoDirInfo.closeLoopOpt[batchNameCloseloop];
				} else {
					// project: capacity degradation
					projectDirIndex = 0;
					let batchNameCapDeg = cellId.split("_", 1)[0];
					if (dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] === undefined) {
						x[3].children[projectDirIndex].children.push({
							title: batchNameCapDeg,
							key: batchNameCapDeg,
							children: [],
						});
						dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg] = x[3].children[projectDirIndex].children.length - 1;
						// batchIndex = 0;
					} else {
					}
					batchIndex = dataMatrIoDirInfo.capacityDegrad[batchNameCapDeg];
				}

				x[3].children[projectDirIndex].children[batchIndex].children.push({
					title: cellId,
					key: "cell_" + index + "_" + cellType + cellId,
				});
				break;
			case "public/user":
				x[1].children.push({
					title: cellId,
					key: "cell_" + index + "_" + cellType + cellId,
				});
				break;
			case "public/other":
				x[1].children.push({
					title: cellId,
					key: "cell_" + index + "_" + cellType + cellId,
				});
				break;
			case "private":
				x[0].children.push({
					title: cellId,
					key: "cell_" + index + "_" + cellType + cellId,
					disabled: !userPlan?.includes("PRO"),
				});
				break;
			default:
				break;
		}
	});
	if (!x[1].children.length) {
		x.splice(1, 3);
	}
	return x;
};

const SideBar = (props) => {
	const [checkedKeys, setCheckedKeys] = useState([]);
	// const [sideBarCollapse, setSideBarCollapse] = useState(false);
	const [filteredTreeData, setFilteredTreeData] = useState([]);
	const [treeData, setTreeData] = useState([]);
	const [checkedCellIds, setCheckedCellIds] = useState([]);
	const [isCelldataLoaded, setIsCelldataLoaded] = useState(false);
	const [error, setError] = useState(null);

	const { state, action } = useDashboard();
	const accessToken = useAuth0Token();

	const userPlan = useUserPlan();
	const location = useLocation();
	const navigate = useNavigate();

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
						navigate(location.pathname, { replace: true });

						if (location.state !== null) {
							let key = ""
							treeData[0].children.forEach((data) => {
								if (data.key.includes(location.state?.cellId)) {
									key = data.key
									return false
								}

							})
							if (key === "") {

								treeData[1].children.forEach((data) => {
									if (data.key.includes(location.state?.cellId)) {
										key = data.key
										return false
									}
								})
							}
							setCheckedKeys([key]);
							setCheckedCellIds([key.substring(key.indexOf("_") + 1)]);
							if (location.state?.from === "upload") {
								action.loadCellData([key.substring(key.indexOf("_") + 1)]);
							}
							else {
								action.plotCellData([key.substring(key.indexOf("_") + 1)]);
							}


						}
						else{
							setCheckedKeys(state.selectedCellIds.map(element => `cell_${element}`))
							setCheckedCellIds(state.selectedCellIds)
						}
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

	const onLoad = (dashboardType) => {
		action.loadCellData(checkedCellIds, dashboardType);
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
				// collapsed={sideBarCollapse}
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
					{/* <Button
						style={{ float: "right" }}
						onClick={() => {
							setSideBarCollapse(!sideBarCollapse);
						}}
						icon={sideBarCollapse ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
						className="trigger"
					/> */}
					{/* {sideBarCollapse ? (
						<></>
					) : ( */}
					<>
						<Search className="py-2" placeholder="Search" onChange={(e) => onChange(e)} />
						<div className="row justify-content-around pb-2">
							<div className="col-md-6">
								<Button type="primary" block onClick={() => onClear()} disabled={!checkedKeys.length} danger>
									Clear
								</Button>
							</div>
							<div className="col-md-6">
								<Button type="primary" block onClick={() => onLoad("type-2")} disabled={!checkedKeys.length}>
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
										defaultExpandedKeys={["amplabs", "datamatrio", "private","public"]}

									/>
								</>
							) : (
								<Spin />
							)}
						</div>
					</>
					{/* )} */}
				</SimpleBarReact>
			</Sider>
			{/* <Divider type="vertical" className="handle" /> */}
		</>
	);
};

export default SideBar;
