import React from "react";
import "./App.css";
import { BackTop } from "antd";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import PageNotFound from "./pages/PageNotFound";
import PlotterPage from "./pages/PlotterPage";
import PublicDataDashboard from "./pages/PublicDataDashboard";
import RedirectRoute from "./routes/RedirectRoute";
import SharedDashboard from "./components/SharedDashboard";
import Callback from "./pages/Callback";
import { Auth0Provider, withAuthenticationRequired } from "@auth0/auth0-react";
import { AccessTokenContextProvider } from "./context/AccessTokenContext";

const domain = process.env.REACT_APP_AUTH0_DOMAIN;
const clientId = process.env.REACT_APP_AUTH0_CLIENT_ID;

const PrivateRoute = ({ component, ...args }) => {
	const Component = withAuthenticationRequired(component, args);
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
					redirectUri="https://localhost:3000/dashboard"
					audience="https://amplabs.server"
					useRefreshTokens={true}
				>
					<p>My Token = {window.token}</p>
					<BackTop />
					<Navbar />
					{/* <AccessTokenContextProvider> */}
					<Routes>
						<Route
							path="/"
							element={
								<RedirectRoute>
									<LandingPage />
								</RedirectRoute>
							}
							exact
						/>
						<Route path="/upload" element={<PrivateRoute component={UploadPage} />}>
							<Route path="cycle-test" element={<UploadPage />} />
							<Route path="abuse-test" element={<UploadPage />} />
						</Route>
						<Route path="/dashboard" element={<PrivateRoute component={DashboardPage} />}>
							<Route path="cycle-test" element={<DashboardPage />} />
							<Route path="abuse-test" element={<DashboardPage />} />
						</Route>
						<Route path="/plotter" element={<PrivateRoute component={PlotterPage} />}></Route>
						<Route path="/dashboard/public" element={<PublicDataDashboard />} exact></Route>
						<Route path="/callback/:redirectstate" element={<Callback />}></Route>
						<Route path="/callback" element={<Callback />} exact></Route>
						<Route path="/dashboard/:test/share/:id" element={<PrivateRoute component={SharedDashboard} />} />
						<Route path="*" element={<PageNotFound />} />
					</Routes>
					{/* </AccessTokenContextProvider> */}
				</Auth0ProviderWithRedirectCallback>
			</Router>
		</>
	);
};

export default App;
