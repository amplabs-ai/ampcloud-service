import React, { useEffect } from "react";
import logo from "../assets/images/amplabsLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown, Avatar, Image } from "antd";
import { FaAngleDown } from "react-icons/fa";
// import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0 } from "@auth0/auth0-react";

import { UserOutlined } from "@ant-design/icons";

const Navbar = () => {
	const { logout, isAuthenticated, user } = useAuth0();

	const userProfileMenu = (
		<Menu>
			<Menu.Item key="logout">
				<Link
					className="nav-link"
					onClick={async (e) => {
						e.preventDefault();
						logout();
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
				<div className="collapse navbar-collapse justify-content-end" id="navbarNav">
					<ul className="navbar-nav">
						{/* {auth.user.isLoggedIn && ( */}
						{isAuthenticated && (
							<>
								<li className="nav-item">
									<Link className="nav-link" to="/plotter">
										Plot
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
						)}
					</ul>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
