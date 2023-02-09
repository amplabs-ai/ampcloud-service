import Button from "antd/es/button";
import React, { useEffect } from "react";
import { useNavigate} from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";

const TutorialNav = (props) => {
	const navigate = useNavigate();
	useEffect(() => {
		if (props.triggerNextStep) {
			props.nextStep();
		}
	}, [props.triggerNextStep]);

	return (
		<div className="d-flex justify-content-between">
			<div>
				<Button size="large" onClick={props.previousStep} icon={props.currentStep === 1 ? null : <FaArrowLeft />} />
			</div>
			<div>
				<Button
					type="primary"
					size="large"
					className={props.currentStep === 1 ? "mt-1 " : "me-3"}
					onClick={props.onCancelTutorial}
					danger
				>
					Cancel
				</Button>
				<Button
					type="primary"
					size="large"
					disabled={props.loading}
					onClick={() => {
						if (props.currentStep === 3) {
							// upload api call with file and metadata
							props.onUploadFile();
						} else if (props.currentStep === 4) {
							navigate("/dashboard/cycle", {
								state: { cellIds: props.cellId ? [props.cellId] : ["Amplabs Sample"] },
							});
							window.location.reload();
							props.onCancelTutorial();
						} else {
							props.onStaticFile();
							props.goToNamedStep("plot_snapshot");
						}
					}}
				>
					{props.currentStep === 3
						? "Plot"
						: props.currentStep === 4
						? "Open in Plotter"
						: props.currentStep === 2
						? "Plot"
						: null}
				</Button>
			</div>
		</div>
	);
};

export default TutorialNav;
