import "./App.css";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import UploadPage from "./pages/UploadPage";
import DashboardPage from "./pages/DashboardPage";
import { BackTop, Result, Button } from "antd";

import { RequireAuth } from "./components/RequireAuth";

import { AuthProvider } from "./components/auth";

function App() {
	return (
		<>
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
						/>
						<Route
							path="/dashboard"
							element={
								<RequireAuth>
									<DashboardPage />
								</RequireAuth>
							}
						/>
						<Route
							path="*"
							element={
								<Result
									status="404"
									title="404"
									subTitle="Sorry, the page you visited does not exist."
									extra={
										<Button
											type="link"
											onClick={() => window.location.replace("/")}
										>
											Back Home
										</Button>
									}
								/>
							}
						/>
					</Routes>
				</Router>
			</AuthProvider>
		</>
	);
}

export default App;
