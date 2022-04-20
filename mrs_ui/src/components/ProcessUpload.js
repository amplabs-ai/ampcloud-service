import React, { useState, useEffect } from "react";
import { Button, Progress, Steps, Typography } from "antd";
import { FaTimes, FaRedoAlt } from "react-icons/fa";

const { Title } = Typography;
const { Step } = Steps;

const ProcessUpload = ({ processingProgressMsg, processingProgress }) => {
	const status = Math.floor(parseInt(processingProgress.percentage)) === -1 ? "exception" : "active";
	const steps = processingProgress.steps || {};
	const [current, setCurrent] = useState(0);

	useEffect(() => {
		let curr = -1;
		Object.keys(processingProgress.steps || {}).map((f, i) => {
			if (processingProgress.steps[f]) {
				curr = i + 1;
			}
		});

		console.log("curr", curr);
		setCurrent(curr);
	}, [processingProgress]);

	return (
		<div className="processingStatusBar">
			{Object.keys(steps).length ? (
				<div className="mb-5 container w-100" style={{ paddingTop: "75px" }}>
					<Steps current={current} status={status === "exception" ? "error" : "process"}>
						{Object.keys(steps).map((s, i) => (
							<Step title={s} key={s} />
						))}
					</Steps>
				</div>
			) : (
				""
			)}

			{status === "active" ? (
				<Progress
					type="circle"
					width="300px"
					status={status}
					percent={Math.floor(processingProgress.percentage)}
					format={(percent) => <span style={{ fontSize: `1.5rem` }}>{percent}%</span>}
				/>
			) : (
				""
			)}
			<Title className="py-4" level={2}>
				{processingProgressMsg}
			</Title>
			<div>
				<Button
					type={status === "exception" ? "primary" : "danger"}
					onClick={(e) => {
						if (status === "exception") {
							console.log("retry");
							window.location.reload();
						} else {
							console.log("cancel");
							window.location.reload();
						}
					}}
					icon={status === "exception" ? <FaRedoAlt /> : <FaTimes />}
					size="large"
				>
					&nbsp;&nbsp;{status === "exception" ? "Try Again" : "Cancel"}
				</Button>
			</div>
		</div>
	);
};

export default ProcessUpload;
