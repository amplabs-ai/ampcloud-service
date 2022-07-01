import React from "react";
import logo from "../assets/images/amplabsLogo.png";
import { Link } from "react-router-dom";
import { Menu, Dropdown, Avatar } from "antd";
import { FaAngleDown } from "react-icons/fa";
// import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";

import { UserOutlined } from "@ant-design/icons";

const Navbar = () => {
	const { logout, isAuthenticated, user, isLoading } = useAuth0();

	const userProfileMenu = (
		<Menu>
			<Menu.Item key="logout">
				<Link
					className="nav-link"
					onClick={async (e) => {
						e.preventDefault();
						logout({ returnTo: window.location.origin });
					}}
					to="/"
				>
					Sign-out
				</Link>
			</Menu.Item>
		</Menu>
	);

	return (
		<nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<a className="navbar-brand" href="/">
					<img style={{ maxWidth: "125px" }} src={logo} alt="AMPLABS" />
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
								<li className="nav-item">
									<Dropdown overlay={userProfileMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											<Avatar src={user.picture ? user.picture : <UserOutlined />} style={{ width: 32 }}></Avatar>{" "}
											{user.email} <FaAngleDown />
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
										<Link className="nav-link" to="/cloud" >
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
									<Link className="nav-link" to="/dashboard" style={{ border: "0.5px solid white", padding: "10px 30px" }}>
										Go to Console
									</Link>
								</li>
							</ul>
						</div></>
				)) : null}
			</div>
		</nav>
	);
};

export default Navbar;
