import "./App.css";
import { AuthProvider } from "./components/auth";
import { BackTop } from "antd";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RequireAuth } from "./components/RequireAuth";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import Navbar from "./components/Navbar";
import UploadPage from "./pages/UploadPage";
import PageNotFound from "./pages/PageNotFound";
import DashboardAbuseTest from "./pages/DashboardAbuseTest";
import DashboardCycleTest from "./pages/DashboardCycleTest";
import ProcessUpload from "./components/ProcessUpload";

function App() {
	return (
		<>
			<p>My Token = {window.token}</p>
			<AuthProvider>
				<Router>
					<BackTop />
					<Navbar />
					<Routes>
						<Route path="/" element={<LandingPage />} exact />
						<Route
							path="/upload"
							element={
								<RequireAuth>
									<UploadPage />
								</RequireAuth>
							}
						>
							<Route
								path="cycle-test"
								element={
									<RequireAuth>
										<UploadPage />
									</RequireAuth>
								}
							/>
							<Route
								path="abuse-test"
								element={
									<RequireAuth>
										<UploadPage />
									</RequireAuth>
								}
							/>
						</Route>

						<Route
							path="/dashboard"
							element={
								<RequireAuth>
									<DashboardPage />
								</RequireAuth>
							}
						>
							<Route
								path="cycle-test"
								element={
									<RequireAuth>
										<DashboardPage />
									</RequireAuth>
								}
							/>
							<Route
								path="abuse-test"
								element={
									<RequireAuth>
										<DashboardPage />
									</RequireAuth>
								}
							/>
						</Route>

						{/* <Route path="/uploadProgress" element={<ProcessUpload />}></Route> */}
						<Route path="*" element={<PageNotFound />} />
					</Routes>
				</Router>
			</AuthProvider>
		</>
	);
}

export default App;
