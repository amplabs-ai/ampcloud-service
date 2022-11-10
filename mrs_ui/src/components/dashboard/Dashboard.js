import { Button, Layout, PageHeader, Result } from "antd";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import ChartContainer from "./ChartContainer";
import ChartContainerType2 from "./ChartContainerType2";
import DashboardShareButton from "./DashboardShareButton";
import SideBar from "./Sidebar";
import ViewMetadata from "./ViewMetadata";
import Plotter from "./Plot/Plotter";
import SubsPrompt from "../SubsPrompt";
import DefaultDashboard from "./DefaultDashboard";
import DashboardFilterBar from "./DashboardFilterBar";

const { Content } = Layout;

const Dashboard = (props) => {
	const { state, action, dashboardRef } = useDashboard();
	const accessToken = useAuth0Token();
	// if used in shared dashboard
	useEffect(() => {
		if (props.dashboardId && props.type === "shared") {
			let config = {
				data: {},
				method: "POST",
				url: `/cells/meta?dashboard_id=${props.dashboardId}`,
				headers: {
					Authorization: `Bearer ${accessToken}`,
				},
			};

			axios(config)
				.then(function (response) {
					let data = response.data.records[0];
					let cellIds = data.map((d) => {
						return d.index +"_share_" + d.cell_id;
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

	const closeSubsPrompModal = () => {
		action.setSubsPromptModalVisible(false);
	};

	return (
		<>
			<SubsPrompt
				handleOk={closeSubsPrompModal}
				handleCancel={closeSubsPrompModal}
				isModalVisible={state.shallShowSubsModal}
			/>
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
					{/* <PageHeader
						className="site-page-header mb-1 shadow"
						title="Cycle Test Data"
						// backIcon={<FaArrowLeft title="go to upload" />}
						// onBack={() => navigate("/upload")}
						ghost={false}
						extra={[


							state.dashboardType === "private" ? (
								<DashboardShareButton
									ref={dashboardRef}
									cellIds={state.selectedCellIds}
									shareDisabled={state.shareDisabled}
									step={state.appliedStep}
									dashboard="cycle"
								/>
							) : null
						]}
					></PageHeader> */}
					<Layout hasSider>
						{props.type === "shared" ? null : <SideBar page="dashboard" />}
						<Layout className="site-layout" style={{ marginLeft: "auto", height: "90vh" }}>
							<Content
								style={{
									overflow: "auto",
								}}
							>
								{state.shallShowFilterBar ? <DashboardFilterBar type = "shared" /> : null}
								{state.shallShowEdit ? (
									<ViewMetadata />
								) : state.shallShowMeta ? (
									<Plotter />
								) : state.shallShowSecondChart || props.type === "shared" ? (
									<ChartContainerType2 />
								) : (
									<DefaultDashboard />
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
