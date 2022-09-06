import axios from "axios";
import React, { useEffect, useState } from "react";
import StepWizard from "react-step-wizard";
import { useAuth0Token } from "../../utility/useAuth0Token";
import TutorialNav from "./TutorialNav";
import TutorialStep1 from "./TutorialStep1";
import TutorialStep2 from "./TutorialStep2";
import TutorialStep3 from "./TutorialStep3";
import TutorialStep4 from "./TutorialStep4";
import pako from "pako";
import { message } from "antd";
import { useAuth0 } from "@auth0/auth0-react";
import { response } from "./sampleTestData";

const CustomStepWizard = (props) => {
	let custom = {
		enterRight: "",
		enterLeft: "",
		exitRight: "",
		exitLeft: "",
		intro: "",
	};

	const [file, setFile] = useState(null);
	const [chartData, setChartData] = useState([]);
	const [loading, setLoading] = useState(false);
	const accessToken = useAuth0Token();
	const { user, getIdTokenClaims } = useAuth0();
	const [intervalId, setIntervalId] = useState(null);
	const [triggerNextStep, settriggerNextStep] = useState(false);

	const handleUserData = (data) => {
		setFile(data);
	};

	// used to clearInterval for status
	useEffect(() => {
		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	}, [intervalId]);

	const getStatus = () => {
		let errorCount = 0;
		let params = new URLSearchParams();
		params.append("cell_id", file.name);
		params.append("email", user.email);
		let intervalId = setInterval(() => {
			axios
				.get(`/upload/cells/status`, {
					params: params,
				})
				.then((res) => {
					if (res.data.records) {
						if (parseInt(res.data.records[file.name].percentage) === 100) {
							setLoading(false);
							settriggerNextStep(true);
							clearInterval(intervalId);
						} else if (parseInt(res.data.records[file.name].percentage) === -1) {
							setLoading(false);
							message.error("something went wrong!");
							message.error("something went wrong!");
							clearInterval(intervalId);
						}
					}
				})
				.catch((err) => {
					if (errorCount > 5) {
						setLoading(false);
						clearInterval(intervalId);
						message.error("something went wrong!");
						message.error("something went wrong!");
					}
					errorCount++;
				});
		}, 1000);
		setIntervalId(intervalId);
	};

	const handleFileUpload = () => {
		if (!file) {
			message.error("No File Found!");
			message.error("No File Found!");
			return;
		}
		setLoading(true);
		// init upload request
		let uploadInitReqData = [
			{
			cell_id: file.name,
			is_public: true,
			test_type: "cycle"}
		]
		axios({
			method: "post",
			url: "/upload/cells/initialize",
			headers: {
			  Authorization: `Bearer ${accessToken}`,
			  "Content-Type": "application/json",
			},
			data: JSON.stringify(uploadInitReqData),
		})
			.then((response) => {
				if (response.status === 200) {
					const formData = new FormData();
					const reader = new FileReader();
					reader.onload = (e) => {
						const fileAsArray = new Uint8Array(e.target.result);
						const compressedFileArray = pako.gzip(fileAsArray);
						const compressedFile = compressedFileArray.buffer;
						const dataToUpload = new Blob([compressedFile], { type: file.type });
						const fileToUpload = new Blob([dataToUpload], { type: file.type });
						formData.append("file", fileToUpload, file.name);
						formData.append("cell_id", file.name);
						axios
							.post("/upload/cells/generic", formData, {
								headers: {
									"Content-Type": "multipart/form-data",
									Authorization: `Bearer ${accessToken}`,
								},
							})
							.then((response) => {
								getStatus();
							})
							.catch((error) => {
								message.error(error.response.data.detail);
								message.error(error.response.data.detail);
								setLoading(false);
							});
					};
					reader.readAsArrayBuffer(file);
				}
			})
			.catch((error) => {
				message.error(error.response.data.detail);
				message.error(error.response.data.detail);
			});
	};
	const handleStaticUpload = () => {
		setChartData(response.records[0])
	}

	return (
		<div>
			<StepWizard
				transitions={custom}
				nav={
					<TutorialNav
						onCancelTutorial={props.onCancelTutorial}
						triggerNextStep={triggerNextStep}
						onUploadFile={handleFileUpload}
						onStaticFile={handleStaticUpload}
						loading={loading}
						cellId={file?.name}
					/>
				}
			>
				<TutorialStep1 stepName={"select_data"} />
				<TutorialStep2 stepName={"amplabs_sample_data"} />
				<TutorialStep3 stepName={"custom_data"} onUserDataUpload={handleUserData} loading={loading} />
				<TutorialStep4 stepName={"plot_snapshot"} chartData={chartData} cellId={file?.name} loading={loading} />
			</StepWizard>
		</div>
	);
};

export default CustomStepWizard;
