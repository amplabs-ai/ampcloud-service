import React, { useState, useEffect } from "react";
import { Spin, Result, Button } from "antd";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./LandingPage.module.css";

const LandingPage = () => {
	const navigate = useNavigate();
	const auth = useAuth();
	const [emailValue, setEmailValue] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [loading, setLoading] = useState(true);
	const [internalServerError, setInternalServerError] = useState("");

	useEffect(() => {
		axios
			.post(
				"/login",
				{
					email: Cookies.get("userId"),
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
				}
			)
			.then((response) => {
				console.log(response);
				if (response.data.status === 200) {
					// auth.login(emailValue);
					setLoading(false);
					navigate(response.data.detail); // , { replace: true }
				}
			})
			.catch((err) => {
				setLoading(false);
				setInternalServerError("500");
			});
	}, []);

	const validateEmail = (input) => {
		let validRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
		if (input.match(validRegex)) {
			return true;
		} else {
			return false;
		}
	};

	const handleEmailSubmit = (e) => {
		e.preventDefault();
		if (!validateEmail(emailValue)) {
			setErrorMsg("Please enter a valid email!");
		} else {
			axios
				.post(
					"/login",
					{
						email: emailValue,
					},
					{
						headers: {
							"Content-Type": "application/json",
						},
						withCredentials: true,
					}
				)
				.then((response) => {
					console.log(response);
					if (response.data.status === 200) {
						auth.login(emailValue);
						navigate(response.data.detail || "/upload"); // , { replace: true }
					}
				})
				.catch((err) => {
					setErrorMsg("Something went wrong. Please try again!");
				});
		}
	};

	return (
		<div className={styles.wrapper + " container"}>
			{loading ? (
				<Spin size="large" />
			) : internalServerError ? (
				<Result
					status="500"
					title="500"
					subTitle="Sorry, something went wrong."
					extra={
						<Button type="primary" href="/">
							Reload
						</Button>
					}
				/>
			) : (
				<div className="row">
					<div className="col-md-8 p-2">
						<h1 className="display-4 text-center mb-3">About</h1>
						<div className="">
							<p className="para" style={{ lineHeight: "1.6" }}>
								Tools for scientist, researchers, and engineers to analyze, publish, and collaborate in order to
								reinvent our energy systems.
							</p>
						</div>
					</div>
					<div className={`col-md-4 p-4 ${styles.formSection}`}>
						<form onSubmit={(e) => handleEmailSubmit(e)}>
							<div className="mb-3">
								<label htmlFor="email" className="form-label">
									Email address
								</label>
								<input
									type="email"
									className="form-control mx-0"
									id="email"
									placeholder="Enter Email"
									onChange={(e) => {
										setErrorMsg("");
										setEmailValue(e.target.value);
									}}
									required
								/>
								{errorMsg && (
									<div className="form-text" style={{ color: "red" }}>
										{errorMsg}
									</div>
								)}
							</div>
							<div className="text-center">
								<button type="submit" className="px-4 btn btn-outline-dark">
									Continue
								</button>
							</div>
						</form>
						<p className="fs-6 p-3 fw-light mb-0" style={{ lineHeight: "1.6" }}>
							Please provide your email address to get started.
						</p>
					</div>
				</div>
			)}
		</div>
	);
};

export default LandingPage;
