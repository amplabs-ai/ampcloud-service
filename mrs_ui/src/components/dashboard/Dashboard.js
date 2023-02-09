import Button from "antd/es/button";
import Layout from "antd/es/layout";
import Result from "antd/es/result";
import Spin from "antd/es/spin"
import axios from "axios";
import React, { useEffect, lazy, Suspense} from "react";
import { useDashboard } from "../../context/DashboardContext";
import { useAuth0Token } from "../../utility/useAuth0Token";
import SideBar from "./Sidebar";
import SubsPrompt from "../SubsPrompt";

const ViewMetadata = lazy(() => import("./ViewMetadata"))
const Plotter = lazy(() => import("./Plot/Plotter"))
const ChartContainerType2 = lazy(() => import("./ChartContainerType2"))
const DefaultDashboard = lazy(() => import("./DefaultDashboard"))
const DashboardFilterBar= lazy(() => import("./DashboardFilterBar"))

const { Content } = Layout;

const Dashboard = (props) => {
	const { state, action} = useDashboard();
	const accessToken = useAuth0Token();
	// if used in shared dashboard
	useEffect(() => {
    action.clearDashboard();
		if (props.dashboardId && props.type.includes("shared")) {
			let config = {
				data: {},
				method: "POST",
				url: props.type === "cycle_shared" ? `/cells/cycle/meta?dashboard_id=${props.dashboardId}` : `/cells/abuse/meta?dashboard_id=${props.dashboardId}`,
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
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      ) : (
        <div className="p-2">
          <Layout hasSider>
          {props.type.includes("shared") ? null : <SideBar type={props.type} />}
            <Layout
              className="site-layout"
              style={{ marginLeft: "auto", height: "90vh" }}
            >
              <Suspense
                fallback={
                  <div
                    className="d-flex justify-content-center align-items-center"
                    style={{ height: "100vh" }}
                  >
                    <Spin size="large" />
                  </div>
                }
              >
                <Content
                  style={{
                    overflow: "auto",
                  }}
                >
                  {state.shallShowFilterBar ? (
                    <DashboardFilterBar type={props.type} />
                  ) : null}
                  {state.shallShowEdit ? (
                    <ViewMetadata type={props.type}/>
                  ) : state.shallShowMeta ? (
                    <Plotter type={props.type}/>
                  ) : state.shallShowSecondChart || props.type.includes("shared") ? (
                    <ChartContainerType2 type={props.type.includes("cycle") ? "cycle" : "abuse"}/>
                  ) : (
                    <DefaultDashboard />
                  )}
                </Content>
              </Suspense>
            </Layout>
          </Layout>
        </div>
      )}
    </>
  );
};

export default Dashboard;
