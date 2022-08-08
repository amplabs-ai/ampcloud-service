import React, { useEffect } from "react";
import "./App.css";
import { BackTop, Spin } from "antd";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import Landing from "./pages/Landing";
import Navbar from "./components/Navbar";
import Cloud from "./components/Cloud";
import Pricing from "./components/Pricing";
import Community from "./components/Community";
import UploadPage from "./pages/UploadPage";
import PageNotFound from "./pages/PageNotFound";
import DataViewerPage from "./pages/DataViewerPage";
import RedirectRoute from "./routes/RedirectRoute";
import SharedDashboard from "./components/SharedDashboard";
import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { UserPlanProvider } from "./context/UserPlanContext";
import mixpanel from "mixpanel-browser";
import Tutorial from "./components/tutorial/Tutorial";

mixpanel.init(process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_MIXPANEL_DEV_PROJECT_TOKEN : process.env.REACT_APP_MIXPANEL_PROD_PROJECT_TOKEN, { debug: true });
const domain = process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_DEV_AUTH0_DOMAIN : process.env.REACT_APP_PROD_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_DEV_AUTH0_CLIENT_ID : process.env.REACT_APP_PROD_AUTH0_CLIENT_ID;

const PrivateRoute = ({ component }) => {
	const Component = withAuthenticationRequired(component, {
		onRedirecting: () => (
			<div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
				<Spin size="large" />
			</div>
		),
	});
	return <Component />;
};

const Auth0ProviderWithRedirectCallback = ({ children, ...props }) => {
	const navigate = useNavigate();
	const onRedirectCallback = (appState) => {
		navigate((appState && appState.returnTo) || window.location.pathname);
	};

	return (
		<Auth0Provider onRedirectCallback={onRedirectCallback} {...props}>
			{children}
		</Auth0Provider>
	);
};

const App = () => {
	return (
		<>
			<Router>
				<Auth0ProviderWithRedirectCallback
					domain={domain}
					clientId={clientId}
					redirectUri="https://www.amplabs.ai"
					audience="https://amplabs.server"
					useRefreshTokens={true}
				>
					<UserPlanProvider>
						<p>My Token = {window.token}</p>
						<BackTop />
						<Navbar />
						<Routes>
							<Route
								path="/"
								element={
									<RedirectRoute>
										<Landing />
									</RedirectRoute>
								}
								exact
							/>

							<Route path="/upload" element={<PrivateRoute component={UploadPage} />}>
								<Route path="cycle-test" element={<UploadPage />} />
								<Route path="abuse-test" element={<UploadPage />} />
							</Route>
							<Route path="/dashboard" element={<PrivateRoute component={DashboardPage} />}></Route>
							<Route path="/data-viewer" element={<PrivateRoute component={DataViewerPage} />}></Route>

							<Route path="/dashboard/:test/share/:id" element={<PrivateRoute component={SharedDashboard} />} />
							<Route path="/tutorial" element={<PrivateRoute component={Tutorial} />} />
							<Route path="/cloud/" element={<Cloud />} />
							<Route path="/community/" element={<Community />} />
							<Route path="/pricing/" element={<Pricing />} exact />
							<Route path="*" element={<PageNotFound />} />
						</Routes>
					</UserPlanProvider>
				</Auth0ProviderWithRedirectCallback>
			</Router>
		</>
	);
};

export default App;
