import React from "react";
import { Button, Progress, Steps, Typography } from "antd";
import { FaTimes, FaRedoAlt } from "react-icons/fa";

const { Title } = Typography;
const { Step } = Steps;

// const processingProgressMsg = "Please Wait while your files are proccessed!";
// const processingProgress = {
// 	percentage: 90,
// };

const ProcessUpload = ({ processingProgressMsg, processingProgress }) => {
	//

	const status = Math.floor(parseInt(processingProgress.percentage)) === -1 ? "exception" : "active";

	return (
		<div className="processingStatusBar">
			{/* {styles.processingStatusBar} */}

			{/* <div className="mb-5 container w-100" style={{ paddingTop: "75px" }}>
				<Steps current={1} status={status === "exception" ? "error" : "process"}>
					<Step title="Calculate Statistics" description="This is a description." />
					<Step title="Writing to DB" description="This is a description." />
					<Step title="Finishing" description="This is a description." />
					<Step title="Finishing" description="This is a description." />
					<Step title="Finishing" description="This is a description." />
				</Steps>
			</div> */}

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
