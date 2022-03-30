import React, { useState } from "react";
import logo from "../images/amplabsLogo.png";
import { Link } from "react-router-dom";

import { useAuth } from "./auth";

import { useLocation } from "react-router-dom";

const Navbar = () => {
	const location = useLocation();

	const auth = useAuth();

	const handleLogout = () => {
		console.log("Logout");
	};

	return (
		// <nav className="navbar fixed-top navbar-expand-lg navbar-dark bg-dark">
		// 	<div className="container">
		// <a className="navbar-brand" href="/">
		// 	<img
		// 		style={{ maxWidth: "120px", color: "blue" }}
		// 		src={logo}
		// 		alt="AMPLABS"
		// 	/>
		// </a>
		// {auth.user && (
		// 	<>
		// 		<button
		// 			className="navbar-toggler"
		// 			type="button"
		// 			data-bs-toggle="collapse"
		// 			data-bs-target="#navbarNav"
		// 			aria-controls="navbarNav"
		// 			aria-expanded="false"
		// 			aria-label="Toggle navigation"
		// 		>
		// 			<span className="navbar-toggler-icon"></span>
		// 		</button>
		// 		<div
		// 			className="collapse navbar-collapse"
		// 			// container
		// 			id="navbarNav"
		// 		>
		// 			<ul className="navbar-nav">
		// 				{/* <li className="nav-item">
		// 					<Link className="nav-link" to="/">
		// 						Home
		// 					</Link>
		// 				</li> */}
		// 				<li className="nav-item">
		// 					<Link className="nav-link" to="/upload">
		// 						Upload
		// 					</Link>
		// 				</li>
		// 				<li className="nav-item">
		// 					<Link className="nav-link" to="/dashboard">
		// 						Dashboard
		// 					</Link>
		// 				</li>
		// 				<li className="nav-item">
		// 					<Link
		// 						className="nav-link"
		// 						onClick={() => auth.logout()}
		// 						to="/"
		// 					>
		// 						Sign-out
		// 					</Link>
		// 				</li>
		// 			</ul>
		// 		</div>
		// 	</>
		// )}
		// 	</div>
		// </nav>

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
									<Link className="nav-link" to="/upload">
										Upload
									</Link>
								</li>
								<li className="nav-item">
									<Link className="nav-link" to="/dashboard">
										Dashboard
									</Link>
								</li>
								<li className="nav-item">
									<Link
										className="nav-link"
										onClick={() => auth.logout()}
										to="/"
									>
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
