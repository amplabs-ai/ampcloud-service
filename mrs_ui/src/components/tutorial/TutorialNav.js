import { Button, Divider, message } from "antd";
import React, { useEffect } from "react";
import { useNavigate, createSearchParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { useDashboard } from "../../context/DashboardContext";

const TutorialNav = (props) => {
	const navigate = useNavigate();
	useEffect(() => {
		if (props.triggerNextStep) {
			props.nextStep();
		}
	}, [props.triggerNextStep]);

	const { action } = useDashboard();

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
							// window.location.reload("/dashboard", {
							// 	state: { cellIds: props.cellId ? [props.cellId] : ["Amplabs Sample"] },
							// });
							navigate("/dashboard", {
								state: { cellIds: props.cellId ? [props.cellId] : ["Amplabs Sample"] },
							});
							window.location.reload();
							// action.refreshSidebar(null, null, null, "dashboardType2");
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
