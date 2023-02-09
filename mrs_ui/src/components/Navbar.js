import React, { useEffect, useState } from "react";
import logo from "../assets/images/amplabsLogo.png";
import { Link, useLocation } from "react-router-dom";
import Menu from "antd/es/menu";
import Dropdown from "antd/es/dropdown";
import Avatar from "antd/es/avatar";
import Col from 'antd/es/col';
import Button from 'antd/es/button';
import message from "antd/es/message";
import { FaAngleDown } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import UserOutlined from "@ant-design/icons/UserOutlined";
import { useUserPlan } from "../context/UserPlanContext";
import { useAuth0Token } from "../utility/useAuth0Token";
import { audit } from "../auditAction/audit";
import mixpanel from "mixpanel-browser";

const Navbar = () => {
	const { logout, isAuthenticated, user, isLoading } = useAuth0();
	const { loginWithRedirect } = useAuth0();
	const userplan = useUserPlan();

	const accessToken = useAuth0Token();
	const [uploadPageType, setUploadPageType] = useState("Add Data")
  	const [dashboardPageType, setDashboardPageType] = useState("View Data")
	let location = useLocation();

	useEffect(() => {
		if (user?.email && userplan) {
			audit("user_route_navigate", { ...user, pathName: location.pathname, userTier: userplan });
		}
	}, [location, user, userplan]);

	const copyToClipBoard = (copyMe) => {
		navigator.clipboard.writeText(copyMe);
		message.success("Token Copied");
		message.success("Token Copied");
	};
	const userProfileMenu = (
		<Menu>
			<Menu.Item key="plan">
				<Link type="text" className="nav-link" to="/pricing">
					Manage Plan
				</Link>
			</Menu.Item>
			<Menu.Item key="csvtool">
				<Link className="nav-link" to="/data-viewer">
					CSV Tool
				</Link>
			</Menu.Item>
			<Menu.Item key="api">
				<Link
					className="nav-link"
					to="/"
					onClick={() => {
						window.open("https://www.amplabs.ai/api");
					}}
				>
					API
				</Link>
			</Menu.Item>
			<Menu.Item key="gettoken">
				<Link
					className="nav-link"
					to=""
					onClick={(e) => {
						e.preventDefault();
						copyToClipBoard(`${accessToken}`);
					}}
				>
					Get API token <br />
					<small className="text-secondary " style={{ fontSize: 10 }}>
						Token refreshes periodically in <b>30 days</b>
					</small>
				</Link>
			</Menu.Item>
			<Menu.Item key="example">
				<Link
					className="nav-link"
					to="/"
					onClick={() => {
						window.open("http://github.com/amplabs-ai/amplabs");
					}}
				>
					Examples
				</Link>
			</Menu.Item>
			<Menu.Item key="logout">
				<Link
					className="nav-link"
					onClick={async (e) => {
						e.preventDefault();
						audit("user_logout", { ...user, userTier: userplan });
						logout({ returnTo: window.location.origin });
					}}
					to="/"
				>
					Sign-out
				</Link>
			</Menu.Item>
		</Menu>
	);

	const uploadMenu = (
    <Menu>
      <Menu.Item key="cycle">
        <Link
          type="text"
          className="nav-link"
          to="/upload/cycle"
          onClick={() => {
            setUploadPageType("Cycle Upload");
            setDashboardPageType("View Data");
          }}
        >
          Cycle Upload
        </Link>
      </Menu.Item>
      <Menu.Item key="abuse">
        <Link
          className="nav-link"
          to="/upload/abuse"
          onClick={() => {
            setUploadPageType("Abuse Upload");
            setDashboardPageType("View Data");
          }}
        >
          Abuse Upload
        </Link>
      </Menu.Item>
    </Menu>
  );
	
  const dashboardMenu = (
    <Menu>
      <Menu.Item key="cycle">
        <Link type="text" className="nav-link" to="/dashboard/cycle" onClick={() =>{
          setUploadPageType("Add Data")
          setDashboardPageType("Cycle Data")
        }}>
          Cycle Data
        </Link>
      </Menu.Item>
      <Menu.Item key="abuse">
        <Link className="nav-link" to="/dashboard/abuse" onClick={() =>{
          setUploadPageType("Add Data")
          setDashboardPageType("Abuse Data")
        }}>
          Abuse Data
        </Link>
      </Menu.Item>
    </Menu>
  );

	return (
		<nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<a className="navbar-brand" style={{ position: "relative" }} href="/">
					<img style={{ maxWidth: "125px", display: "block" }} src={logo} alt="AMPLABS" />
				</a>
				<button
					className="navbar-toggler"
					type="button"
					data-bs-toggle="collapse"
					data-bs-target="#navbarNav"
					aria-controls="navbarNav"
					aria-expanded="false"
					aria-label="Toggle navigation"
				>
					<span className="navbar-toggler-icon"></span>
				</button>
				{isAuthenticated ? (
					<div className="collapse navbar-collapse justify-content-end" id="navbarNav">
						<ul className="navbar-nav">
							<>
								<li className="nav-item ms-2" style={{ display: "none" }}>
									<Link className="nav-link" to="/pricing">
										Pricing
									</Link>
								</li>
								<li className="nav-item ms-2">
									<Dropdown overlay={uploadMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											{uploadPageType} <FaAngleDown />
										</Link>
									</Dropdown>
								</li>
								<li className="nav-item ms-2">
									<Dropdown overlay={dashboardMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											{dashboardPageType} <FaAngleDown />
										</Link>
									</Dropdown>
								</li>
								<li className="nav-item pe-2 ps-3">
									<Avatar
										src={user.picture ? user.picture : <UserOutlined />}
										className="mt-2"
										style={{ width: 35, height: 35 }}
									></Avatar>
								</li>
								<li className="nav-item" style={{ margin: "-10px" }}>
									<Dropdown overlay={userProfileMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											<Col>
												<span style={{ fontSize: 16 }}>
													{user.email}
													<FaAngleDown />
												</span>
											</Col>
											{userplan && (
												<span className="rounded-pill bg-light text-dark p-1" style={{ fontSize: 10 }}>
													{userplan}
												</span>
											)}
										</Link>
									</Dropdown>
								</li>
							</>
						</ul>
					</div>
				) : !isLoading ? (
					<>
						<div className="collapse navbar-collapse justify-content ms-3" id="navbarNav">
							<ul className="navbar-nav">
								<>
									<li className="nav-item ms-1">
										<Link
											className="nav-link"
											to="/cloud"
											onClick={() => {
												mixpanel.track("user_route_cloud");
											}}
										>
											Cloud
										</Link>
									</li>
									<li className="nav-item ms-1">
										<Link
											className="nav-link"
											to="/community"
											onClick={() => {
												mixpanel.track("user_route_community");
											}}
										>
											Community
										</Link>
									</li>
									<li className="nav-item ms-1">
										<Link
											className="nav-link"
											to="/pricing"
											onClick={() => {
												mixpanel.track("user_route_pricing");
											}}
										>
											Pricing
										</Link>
									</li>
								</>
							</ul>
						</div>

						<div className="collapse navbar-collapse justify-content-end" id="navbarNav">
							<ul className="navbar-nav">
								<li className="nav-item pe-4">
									<Link className="nav-link" to="/dashboard">
										Sign In
									</Link>
								</li>
							</ul>
							<ul className="navbar-nav">
								<li className="nav-item">
									<Button
										size={"large"}
										ghost
										onClick={() =>
											loginWithRedirect({
												screen_hint: "signup",
											})
										}
									>
										Sign Up
									</Button>
								</li>
							</ul>
						</div>
					</>
				) : null}
			</div>
		</nav>
	);
};

export default Navbar;
