import React from "react";
import { useSpring, animated } from "react-spring";
import styles from "./LandingPage.module.css";
import { useAuth0 } from "@auth0/auth0-react";
import LoginButton from "../components/LoginButton";

const LandingPage = () => {
	const auth = useAuth0();
	console.log("from context", auth);

	const aboutAnim = useSpring({
		delay: 500,
		from: { x: -900, opacity: 0 },
		to: { x: 0, opacity: 1 },
	});

	return (
		<div className={styles.wrapper + " container"}>
			<div className="row">
				<animated.div className="col-md-12 p-2 text-center" style={aboutAnim}>
					<div
						style={{
							display: "flex",
							justifyContent: "center",
							alignItems: "center",
							height: "100%",
							flexDirection: "column",
						}}
					>
						<h1 className="display-4 text-center mb-3">About</h1>
						<p className="para" style={{ lineHeight: "1.6", padding: "0px 90px" }}>
							Tools for scientists, researchers, and engineers to analyze, publish, and collaborate in order to reinvent
							our energy systems.
						</p>
						<div className="text-center">
							<LoginButton />
						</div>
					</div>
				</animated.div>
			</div>
		</div>
	);
};

export default LandingPage;
