import React from "react";
import logo from "../images/amplabsLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { Menu, Dropdown } from "antd";
import { FaAngleDown } from "react-icons/fa";
import { useAuth } from "../context/auth";

const Navbar = () => {
	const auth = useAuth();
	const navigate = useNavigate();

	const uploadMenu = (
		<Menu data-toggle="collapse" data-target=".navbar-collapse">
			<Menu.Item key="cycleTest">
				<Link className="nav-link" to="/upload/cycle-test">
					Cycle Test
				</Link>
			</Menu.Item>
			<Menu.Item key="abuseTest">
				<Link className="nav-link" to="/upload/abuse-test">
					Abuse Test
				</Link>
			</Menu.Item>
		</Menu>
	);

	const userProfileMenu = (
		<Menu>
			<Menu.Item key="logout">
				<Link
					className="nav-link"
					onClick={async (e) => {
						e.preventDefault();
						await auth.logout();
						navigate("/", { replace: true });
					}}
					to="/"
				>
					Sign-out
				</Link>
			</Menu.Item>
		</Menu>
	);

	const dashboardMenu = (
		<Menu>
			<Menu.Item key="cycleTest">
				<Link className="nav-link" to="/dashboard/cycle-test">
					Cycle Test
				</Link>
			</Menu.Item>
			<Menu.Item key="abuseTest">
				<Link className="nav-link" to="/dashboard/abuse-test">
					Abuse Test
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
						{auth.user.isLoggedIn && (
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
									<Link className="nav-link" to="/dashboard/cycle-test">
										Dashboard
									</Link>
								</li>
								<li className="nav-item">
									<Dropdown overlay={userProfileMenu}>
										<Link className="nav-link" to="" onClick={(e) => e.preventDefault()}>
											{auth.user.email} <FaAngleDown />
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
