import React from "react";
import "./App.css";
import { BackTop } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import PageNotFound from "./pages/PageNotFound";
import ProcessUpload from "./components/ProcessUpload";
import PlotterPage from "./pages/PlotterPage";
import PublicDataDashboard from "./pages/PublicDataDashboard";
import PrivateRoute from "./routes/PrivateRoute";
import { AuthProvider } from "./context/auth.js";
import RedirectRoute from "./routes/RedirectRoute";
import SharedDashboard from "./components/SharedDashboard";

const App = () => {
	return (
		<>
			<Router>
				<AuthProvider>
					<p>My Token = {window.token}</p>
					<BackTop />
					<Navbar />
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
						<Route
							path="/upload"
							element={
								<PrivateRoute>
									<UploadPage />
								</PrivateRoute>
							}
						>
							<Route path="cycle-test" element={<UploadPage />} />
							<Route path="abuse-test" element={<UploadPage />} />
						</Route>
						<Route
							path="/dashboard"
							element={
								<PrivateRoute>
									<DashboardPage />
								</PrivateRoute>
							}
						>
							<Route path="cycle-test" element={<DashboardPage />} />
							<Route path="abuse-test" element={<DashboardPage />} />
						</Route>
						{/* <Route path="/uploadProgress" element={<ProcessUpload />}></Route> */}
						<Route
							path="/plotter"
							element={
								<PrivateRoute>
									<PlotterPage />
								</PrivateRoute>
							}
						></Route>
						<Route path="/dashboard/public" element={<PublicDataDashboard />} exact></Route>
						<Route
							path="/dashboard/:test/share/:id"
							element={
								<PrivateRoute>
									<SharedDashboard />
								</PrivateRoute>
							}
						/>
						<Route path="*" element={<PageNotFound />} />
					</Routes>
				</AuthProvider>
			</Router>
		</>
	);
};

export default App;
