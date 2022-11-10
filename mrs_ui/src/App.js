import React from "react";
import "./App.css";
import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { BackTop, Spin } from "antd";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { UserPlanProvider } from "./context/UserPlanContext";
import BulkUploadPage from "./pages/BulkUploadPage";
import Cloud from "./components/Cloud";
import Community from "./components/Community";
import DashboardPage from "./pages/DashboardPage";
import DataViewerPage from "./pages/DataViewerPage";
import Landing from "./pages/Landing";
import mixpanel from "mixpanel-browser";
import Navbar from "./components/Navbar";
import PageNotFound from "./pages/PageNotFound";
import Pricing from "./components/Pricing";
import RedirectRoute from "./routes/RedirectRoute";
import SharedDashboard from "./components/SharedDashboard";
import UploadPage from "./pages/UploadPage";

mixpanel.init(
	process.env.REACT_APP_ENV === "development"
		? process.env.REACT_APP_MIXPANEL_DEV_PROJECT_TOKEN
		: process.env.REACT_APP_MIXPANEL_PROD_PROJECT_TOKEN,
	{ debug: true }
);
const AUTH0_DOMAIN =
	process.env.REACT_APP_ENV === "development"
		? process.env.REACT_APP_DEV_AUTH0_DOMAIN
		: process.env.REACT_APP_PROD_AUTH0_DOMAIN;
const AUTH0_CLIENT_ID =
	process.env.REACT_APP_ENV === "development"
		? process.env.REACT_APP_DEV_AUTH0_CLIENT_ID
		: process.env.REACT_APP_PROD_AUTH0_CLIENT_ID;
const AUTH0_REDIRECT_URI =
	process.env.REACT_APP_ENV === "development"
		? process.env.REACT_APP_AUTH0_REDIRECT_URI_DEV
		: process.env.REACT_APP_AUTH0_REDIRECT_URI_PROD;
const AUTH0_AUDIENCE = "https://amplabs.server";

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
					domain={AUTH0_DOMAIN}
					clientId={AUTH0_CLIENT_ID}
					redirectUri={AUTH0_REDIRECT_URI}
					audience={AUTH0_AUDIENCE}
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
							<Route path="/upload" element={<PrivateRoute component={BulkUploadPage} />}>
								<Route path="cycle-test" element={<UploadPage />} />
								<Route path="abuse-test" element={<UploadPage />} />
							</Route>
							<Route path="/dashboard" element={<PrivateRoute component={DashboardPage} />}></Route>
							<Route path="/data-viewer" element={<PrivateRoute component={DataViewerPage} />}></Route>
							<Route path="/dashboard/share/:id" element={<SharedDashboard/>} />
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
