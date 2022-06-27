import { Button, Empty, Layout, PageHeader, Result } from "antd";
import axios from "axios";
import React, { useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import ChartContainer from "./ChartContainer";
import DashboardShareButton from "./DashboardShareButton";
import SideBar from "./Sidebar";
import ViewMetadata from "./ViewMetadata";
import Plotter from "./Plot/Plotter";

const { Content } = Layout;

const Dashboard = (props) => {
	const navigate = useNavigate();
	const { state, action, dashboardRef } = useDashboard();
	const accessToken = useAuth0Token();
	console.log("state", state);

	// if used in shared dashboard
	useEffect(() => {
		if (props.dashboardId && props.type === "shared") {
			let config = {
				method: "get",
				url: `/cells/cycle/meta?dashboard_id=${props.dashboardId}`,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			};

			axios(config)
				.then(function (response) {
					let data = response.data.records[0];
					let cellIds = data.map((d) => {
						return "share_" + d.cell_id;
					});
					action.loadCellData(cellIds);
					action.setDashboardType(props.type);
					action.setDashboardId(props.dashboardId);
				})
				.catch(function (error) {
					console.error(error);
					action.setDashboardError("Something went wrong!");
				});
		}
	}, [props.dashboardId, props.type, accessToken]);

	return (
		<>
			{state.dashboardError ? (
				<Result
					status="500"
					title={state.dashboardError}
					// subTitle={state.dashboardError}
					extra={
						<Button type="primary" onClick={() => window.location.reload()}>
							Reload
						</Button>
					}
				/>
			) : (
				<div className="p-2">
					<PageHeader
						className="site-page-header mb-1 shadow"
						title="Cycle Test Dashboard"
						backIcon={<FaArrowLeft title="go to upload" />}
						onBack={() => navigate("/upload")}
						ghost={false}
						extra={
							state.dashboardType === "private" ? (
								<DashboardShareButton
									ref={dashboardRef}
									cellIds={state.selectedCellIds}
									shareDisabled={state.shareDisabled}
									step={state.appliedStep}
									dashboard="cycle"
								/>
							) : null
						}
					></PageHeader>
					<Layout hasSider>
						{props.type === "shared" ? null : <SideBar page="dashboard" />}
						<Layout className="site-layout" style={{ marginLeft: "auto" }}>
							<Content>
								{state.shallShowChart ? (
									<ChartContainer />
								) : state.shallShowEdit ? (
									<ViewMetadata />
								) : state.shallShowMeta ? (
									<Plotter />
								) : (
									<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
										<Empty description={<span>No Data Loaded</span>} />
									</div>
								)}
							</Content>
						</Layout>
					</Layout>
				</div>
			)}
		</>
	);
};

export default Dashboard;
