import React, { useState, useEffect } from "react";
import logo from "../assets/images/amplabsLogo.png";
import { Link, useLocation } from "react-router-dom";
import { Menu, Dropdown, Avatar, Button, Col, message } from "antd";
import { FaAngleDown } from "react-icons/fa";
import { useAuth0 } from "@auth0/auth0-react";
import { UserOutlined } from "@ant-design/icons";
import { useUserPlan } from "../context/UserPlanContext";
import { useAuth0Token } from "../utility/useAuth0Token";
import { audit } from "../auditAction/audit";
import mixpanel from "mixpanel-browser";

const Navbar = () => {
	const { logout, isAuthenticated, user, isLoading, loginWithRedirect } = useAuth0();
	const userplan = useUserPlan();

	const accessToken = useAuth0Token();
	const [copySuccess, setCopySuccess] = useState(null);
	let location = useLocation();

	useEffect(() => {
		if (user?.email) {
			audit("user_route_navigate", { ...user, pathName: location.pathname });
		}
	}, [location, user]);

	const copyToClipBoard = async copyMe => {
		try {
			await navigator.clipboard.writeText(copyMe);
			message.success('Token Copied');
			message.success('Token Copied');
		}
		catch (err) {
			message.success('Token Copy Failed');
			message.success('Token Copied');
		}
	};
	const addToBasket = () => { }
	const userProfileMenu = (
		<Menu>
			<Menu.Item key="logout">
				<Link
					className="nav-link"
					onClick={async (e) => {
						e.preventDefault();
						audit("logout", user);
						logout({ returnTo: window.location.origin });
					}}
					to="/"
				>
					Sign-out
				</Link>
			</Menu.Item>
			<Menu.Item>
				<Button type="text" href='/pricing' >Manage Plan</Button>
			</Menu.Item>
			<Menu.Item>
				<Button type="text" onClick={() => { copyToClipBoard(`${accessToken}`); addToBasket() }} >Get API token</Button>
			</Menu.Item>

		</Menu>
	);

	return (
		<nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<a className="navbar-brand" style={{ position: 'relative' }} href="/">
					<img style={{ maxWidth: "125px", display: "block" }} src={logo} alt="AMPLABS" />
					<span className="rounded-pill bg-danger text-white " style={{ fontSize: 9, padding: "1.6px 3px", border: "2px solid #dcdddd", position: " absolute", bottom: 23, left: 112 }}><b>BETA</b></span>
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
								{/* <li className="nav-item">
									<Link className="nav-link" to="/view-metadata">
										View-MetaData
									</Link>
								</li> */}

								<li className="nav-item">
									<Link className="nav-link" to="/data-viewer">
										CSV-Viewer
									</Link>
								</li>
								<li className="nav-item" style={{ display: "none" }}>
									<Link className="nav-link" to="/pricing">
										Pricing
									</Link>
								</li>
								<li className="nav-item">
									{/* <Dropdown overlay={uploadMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											Upload <FaAngleDown />
										</Link>
									</Dropdown> */}
									<Link className="nav-link" to="/upload/cycle-test">
										Upload
									</Link>
								</li>
								<li className="nav-item">
									{/* <Dropdown overlay={dashboardMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											Dashboard <FaAngleDown />
										</Link>
									</Dropdown> */}
									<Link className="nav-link" to="/dashboard">
										Dashboard
									</Link>
								</li>

								<li className="nav-item" style={{ margin: "-4px", padding: "0px 10px" }}><Avatar src={user.picture ? user.picture : <UserOutlined />} style={{ width: 35, height: 35, marginTop: 10 }}></Avatar></li>
								<li className="nav-item" style={{ margin: "-10px" }}>
									<Dropdown overlay={userProfileMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											<Col><span style={{ fontSize: 16 }}>{user.email}<FaAngleDown /></span></Col><span className="rounded-pill bg-light text-dark" style={{ fontSize: 10, padding: "2px 2.5px" }}>{userplan}</span>
										</Link>
									</Dropdown>
								</li>
							</>
						</ul>
					</div>
				) : !isLoading ? ((
					<>
						<div className="collapse navbar-collapse justify-content" id="navbarNav">
							<ul className="navbar-nav">
								<>
									<li className="nav-item">
										<Link className="nav-link" to="/cloud">
											Cloud
										</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/community">
											Community
										</Link>
									</li>
									<li className="nav-item">
										<Link className="nav-link" to="/pricing">
											Pricing
										</Link>
									</li>
								</>
							</ul>
						</div>

						<div className="collapse navbar-collapse justify-content-end" id="navbarNav">
							<ul className="navbar-nav">
								<li className="nav-item">
									<Link className="nav-link" to="/dashboard" style={{ padding: "10px 30px" }}>
										Sign In
									</Link>
								</li>
							</ul>
							<ul className="navbar-nav">
								<li className="nav-item">
									<Button size={"large"} ghost onClick={() =>
										loginWithRedirect({
											screen_hint: 'signup',
										})
									}>Sign Up</Button>
								</li>
							</ul>
						</div></>
				)) : null}
			</div>
		</nav>
	);
};

export default Navbar;
