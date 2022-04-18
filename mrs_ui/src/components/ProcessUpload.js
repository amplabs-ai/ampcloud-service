import React, { useState } from "react";
import { Button, Progress, Steps, Typography } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { FaTimes, FaRedoAlt } from "react-icons/fa";

const { Title } = Typography;
const { Step } = Steps;

// const processingProgressMsg = "Please Wait while your files are proccessed!";
// const processingProgress = {
// 	percentage: 90,
// };

const ProcessUpload = ({ processingProgressMsg, processingProgress }) => {
	//  { processingProgressMsg, processingProgress }

	const status = Math.floor(parseInt(processingProgress.percentage)) === -1 ? "exception" : "active";
	const [steps, setSteps] = useState({
		"Calculate Statistics": true,
		"Writing to DB": false,
		"Finishing-process": true,
		"Finishing-process1": false,
		"Finishing-process2": false,
		"Finishing-process3": false,
	});

	return (
		<div className="processingStatusBar">
			{/* {styles.processingStatusBar} */}

			{/* {Object.keys(steps).length && (
				<div className="mb-5 container w-100" style={{ paddingTop: "75px" }}>
					<Steps current={1} status={status === "exception" ? "error" : "process"}>
						{Object.keys(steps).map((s, i) => (
							<Step
								title={s}
								key={s}
								// icon={steps[s] ? "" : steps[s] ? <LoadingOutlined /> : ""}
							/>
						))}
					</Steps>
				</div>
			)} */}

			<Progress
				type="circle"
				width="300px"
				status={status}
				percent={Math.floor(processingProgress.percentage)}
				format={(percent) => <div style={{ fontSize: "1.5rem" }}>{percent}%</div>}
			/>
			<Title className="py-4" level={2}>
				{processingProgressMsg}
			</Title>
			<div>
				<Button
					type={status === "exception" ? "primary" : "danger"}
					onClick={(e) => {
						if (status === "exception") {
							console.log("retry");
							// props.fileUploadRetry(e);
							window.location.reload();
						} else {
							console.log("cancel");
							// props.fileUploadCancel(e);
							window.location.reload();
						}
					}}
					icon={status === "exception" ? <FaRedoAlt /> : <FaTimes />}
					size="large"
					// loading={uploadBtnDisatrybled}
				>
					&nbsp;&nbsp;{status === "exception" ? "Try Again" : "Cancel"}
				</Button>
			</div>
		</div>
	);
};

export default ProcessUpload;
