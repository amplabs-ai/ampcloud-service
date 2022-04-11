import React from "react";
import logo from "../images/amplabsLogo.png";
import { Link } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import { useAuth } from "./auth";
import { useLocation } from "react-router-dom";
import { FaAngleDown } from "react-icons/fa";

const Navbar = () => {
	const location = useLocation();
	const auth = useAuth();
	const menu = (
		<Menu>
			<Menu.Item>
				<Link className="nav-link" to="/upload">
					Cycle Test
				</Link>
			</Menu.Item>
			{/* <Menu.Item>
				<Link className="nav-link" to="/upload/abuse-test">
					Abuse Test
				</Link>
			</Menu.Item> */}
		</Menu>
	);

	return (
		<nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
			<div className="container-fluid">
				<a className="navbar-brand" href="/">
					<img style={{ maxWidth: "125px" }} src={logo} alt="AMPLABS" />
				</a>
				{auth.user && location.pathname !== "/" && (
					<>
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

						<div
							className="collapse navbar-collapse justify-content-end"
							// container
							id="navbarNav"
						>
							<ul className="navbar-nav">
								{/* <li className="nav-item">
									<Link className="nav-link" to="/">
										Home
									</Link>
								</li> */}
								<li className="nav-item">
									<Dropdown overlay={menu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											Upload <FaAngleDown />
										</Link>
									</Dropdown>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/dashboard">
										Dashboard
									</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" onClick={() => auth.logout()} to="/">
										Sign-out
									</Link>
								</li>
							</ul>
						</div>
					</>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
