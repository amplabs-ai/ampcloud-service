import React, { useState, useEffect } from "react";
import { Spin, Result, Button } from "antd";
import { useAuth } from "../components/auth";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import styles from "./LandingPage.module.css";
import { FaArrowRight, FaHandsHelping, FaLongArrowAltRight, FaNewspaper, FaSearch } from "react-icons/fa";
import { useSpring, animated } from "react-spring";
import Typewriter from "typewriter-effect";

const LandingPage = () => {
	const navigate = useNavigate();
	const auth = useAuth();
	const [emailValue, setEmailValue] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
	const [loading, setLoading] = useState(true);
	const [internalServerError, setInternalServerError] = useState("");
	const [btnLoading, setBtnLoading] = useState(false);
	const aboutAnim = useSpring({
		delay: 500,
		from: { x: -900, opacity: 0 },
		to: { x: 0, opacity: 1 },
	});

	const formAnim = useSpring({
		delay: 500,
		from: { x: 900, opacity: 0 },
		to: { x: 0, opacity: 1 },
	});

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
			setBtnLoading(true);
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
					setBtnLoading(true);
				})
				.catch((err) => {
					setErrorMsg("Something went wrong. Please try again!");
					setBtnLoading(true);
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
					<animated.div className="col-md-8 p-2" style={aboutAnim}>
						<h1 className="display-4 text-center mb-3">About</h1>
						<p className="para" style={{ lineHeight: "1.6" }}>
							Tools for scientists, researchers, and engineers to analyze, publish, and collaborate in order to reinvent
							our energy systems.
						</p>
						{/* <div className="fs-2 fw-light">
							<p className="fs-4">
								Tools for <b>Scientists, Researchers, and Engineers</b> to
							</p>
							<b>
								<span className="pe-4">
									<FaSearch />
									Analyze
								</span>
								<span className="pe-4">
									<FaNewspaper />
									Publish
								</span>
								<span className="pe-4">
									<FaHandsHelping />
									Collaborate
								</span>
							</b>
							<p className="fs-4 mt-3">in order to reinvent our energy systems.</p>
						</div> */}
					</animated.div>
					<animated.div style={formAnim} className={`col-md-4 p-4 shadow-sm ${styles.formSection}`}>
						<form onSubmit={(e) => handleEmailSubmit(e)}>
							<div className="mb-3">
								<label htmlFor="email" className="form-label">
									Email address
								</label>
								<input
									type="email"
									className="form-control m-0"
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
								{/* <button type="submit" className="shadow-sm btn btn-outline-dark">
									{btnLoading ? (
										<Spin size="small" />
									) : (
										<span>
											Continue <FaArrowRight />
										</span>
									)}
								</button> */}

								<Button htmlType="submit" type="primary" icon={<FaArrowRight />} size="large" loading={btnLoading}>
									&nbsp;&nbsp;Continue
								</Button>
							</div>
						</form>
						<p className="py-2 fw-light mt-1 mb-0 text-muted" style={{ lineHeight: "1.6" }}>
							Please provide your email address to get started.
						</p>
					</animated.div>
				</div>
			)}
		</div>
	);
};

export default LandingPage;
