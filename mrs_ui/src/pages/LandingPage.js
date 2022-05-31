import React, { useState } from "react";
import { FaArrowRight } from "react-icons/fa";
import { Button } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import { useSpring, animated } from "react-spring";
import styles from "./LandingPage.module.css";
import { useAuth } from "../context/auth";

const LandingPage = () => {
	const auth = useAuth();
	console.log("from context", auth);
	const navigate = useNavigate();
	const location = useLocation();
	const [emailValue, setEmailValue] = useState("");
	const [errorMsg, setErrorMsg] = useState("");
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

	const validateEmail = (input) => {
		let validRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
		if (input.match(validRegex)) {
			return true;
		} else {
			return false;
		}
	};

	const handleEmailSubmit = async (e) => {
		e.preventDefault();
		if (!validateEmail(emailValue)) {
			setErrorMsg("Please enter a valid email!");
		} else {
			setBtnLoading(true);
			try {
				await auth.login(emailValue);
				setBtnLoading(false);
				// localStorage.setItem("token", res);
				if (location.state?.from) {
					console.log("location.state.from", location.state.from);
					navigate(location.state.from, { replace: true });
				} else {
					console.log("location.state.from /dash", location.state.from);
					navigate("/dashboard/cycle-test", { replace: true });
				}
			} catch (error) {
				setBtnLoading(false);
				setErrorMsg("Unable to log in");
				console.log("login err", error);
			}
		}
	};

	return (
		<div className={styles.wrapper + " container"}>
			<div className="row">
				<animated.div className="col-md-8 p-2" style={aboutAnim}>
					<div>
						<h1 className="display-4 text-center mb-3">About</h1>
						<p className="para" style={{ lineHeight: "1.6" }}>
							Tools for scientists, researchers, and engineers to analyze, publish, and collaborate in order to reinvent
							our energy systems.
						</p>
						<div className="text-center">
							<Button
								type="primary"
								size="large"
								onClick={() => {
									navigate("/dashboard/public");
								}}
							>
								View Public Data
							</Button>
						</div>
					</div>
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
							<Button htmlType="submit" type="primary" icon={<FaArrowRight />} size="large" loading={btnLoading}>
								&nbsp;&nbsp;Continue
							</Button>
						</div>
					</form>
					<p className="py-2 fw-light mt-1 mb-0 text-muted" style={{ lineHeight: "1.6", fontSize: "0.9rem" }}>
						Please provide your email address to get started.
					</p>
				</animated.div>
			</div>
		</div>
	);
};

export default LandingPage;
