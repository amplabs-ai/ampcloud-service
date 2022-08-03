import { Button, Card } from "antd";
import Meta from "antd/lib/card/Meta";
import React from "react";

const TutorialStep1 = (props) => {
	return (
		<div>
			<h3 className="my-3">Step 1: Select Battery Data</h3>
			{/* d-flex justify-content-center  */}
			<div
				className="m-1 mt-5"
				style={{ height: "50vh", display: "flex", justifyContent: "center", alignItems: "center" }}
			>
				<Card
					hoverable
					style={{
						width: 340,
						padding: 30,
					}}
					className=" mx-4 border"
					onClick={() => props.goToNamedStep("amplabs_sample_data")}
				>
					<h3 className="fw-light">Try with AmpLabs Sample Data</h3>
				</Card>
				<div className=" d-flex align-items-center justify-content-center">
					<h4 className="fw-light">Or</h4>
				</div>
				<Card
					hoverable
					style={{
						width: 340,
						padding: 30,
					}}
					className=" mx-4 border"
					onClick={() => props.goToNamedStep("custom_data")}
				>
					<h3 className="fw-light">Try with your own data</h3>
				</Card>
			</div>
		</div>
	);
};

export default TutorialStep1;
