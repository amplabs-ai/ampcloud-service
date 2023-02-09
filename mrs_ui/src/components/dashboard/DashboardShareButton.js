import React, { useEffect, useState } from "react";
import Alert from "antd/es/alert";
import Button from "antd/es/button";
import Modal from "antd/es/modal";
import Spin from "antd/es/spin";
import Typography from "antd/es/typography";
import { audit } from "../../auditAction/audit";
import { FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { SHARE_TEXT } from "../../constants/shareText";
import ShareAltOutlined from "@ant-design/icons/ShareAltOutlined";
import { toBlob } from "html-to-image";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import b64toBlob from "../../utility/b64ToBlob";
import DashSharePrivate from "./DashSharePrivate";
import { useUserPlan } from "../../context/UserPlanContext";

const Title = Typography;

const formatString = (str, ...args) => {
	for (let k in args) {
		str = str.replace("{" + k + "}", args[k]);
	}
	return str;
};

const DashboardShareButton = (props, ref) => {
	const [shallShowShareDashModal, setShallShowShareDashModal] = useState(false);
	const [shareLoadingMsg, setShareLoadingMsg] = useState("");
	const [shareType, setShareType] = useState("public");
	const [loading, setLoading] = useState(false);

	const accessToken = useAuth0Token();

	const [searchParamsForCode, setSearchParamsForCode] = useSearchParams();
	const { user } = useAuth0(); // auth context
	const userPlan = useUserPlan()

	useEffect(() => {
		if ([...searchParamsForCode].length && accessToken && userPlan) {
			let code = searchParamsForCode.get("code");
			let state = searchParamsForCode.get("state");
			if (code && state.includes("amplabs")) {
				setShareLoadingMsg(
					<>
						<Title level={4}>Creating Post for you...</Title>
						<br></br>
						<Spin size="large" />
					</>
				);
				// send code to backend
				let shareText = formatString(SHARE_TEXT, props.type, state);
				let img = localStorage.getItem("dashImage");
				let parts = [b64toBlob(img?.split(",")[1], "image/png")];
				let file = new File(parts, "dashboard.png", {
					lastModified: new Date(0),
					type: "image/png",
				});
				const formData = new FormData();
				formData.append("code", code);
				formData.append("file", file);
				formData.append("shareText", shareText);
				formData.append("dashboard", props.type);
				axios
					.post("/dashboard/share-linkedin", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
							Authorization: `Bearer ${accessToken}`,
						},
					})
					.then((response) => {
						searchParamsForCode.delete("code");
						searchParamsForCode.delete("state");
						setSearchParamsForCode(searchParamsForCode);
						// post shared successfully
						// get redirect url to post share and redirect
						window.open("https://www.linkedin.com/embed/feed/update/" + response.data.records.id);
						setShareLoadingMsg(
							<>
								<FaCheckCircle size={60} className="text-success" />
								<Title level={4}>Post Created successfully!</Title>
								<Title level={5}>
									Check it out at{" "}
									<a
										href={"https://www.linkedin.com/embed/feed/update/" + response.data.records.id}
										target="_blank"
										rel="noreferrer"
									>
										Link
									</a>
								</Title>
							</>
						);
					})
					.catch((err) => {
						searchParamsForCode.delete("code");
						searchParamsForCode.delete("state");
						setSearchParamsForCode(searchParamsForCode);
						setShareLoadingMsg(
							<>
								<FaExclamationCircle size={60} className="text-danger" />
								<Title className="pt-3" level={4}>
									<b>Something went wrong! Please refresh the page & try again.</b>
								</Title>
							</>
						);
					});
			}
		}
	}, [accessToken, userPlan]);

	const doShareDashboard = () => {
		audit(`${props.type}_dash_share`, {...user, userTier: userPlan});
		localStorage.setItem("dashImage", null);
		setShallShowShareDashModal(true);
		if (ref.current === null) {
			return;
		}
		toBlob(ref.current).then(function (blob) {
			let reader = new FileReader();
			reader.readAsDataURL(blob);
			reader.onloadend = function () {
				let base64data = reader.result;
				localStorage.setItem("dashImage", base64data);
			};
		});
	};


	const cleanCellIds = (cellIds) => {
		let x = [];
		cellIds.map((k) => {
			x.push(k.split("_").slice(2).join("_"));
		});
		return x;
	};

	return (
		<>
			<Modal
				title="Share Dashboard"
				centered
				visible={shallShowShareDashModal || shareLoadingMsg}
				footer={false}
				onCancel={() => {
					setShallShowShareDashModal(false);
					setShareLoadingMsg("");
				}}
				style={{ marginTop: "100px" }}
				width={700}
			>
				{shareLoadingMsg ? (
					<div className="text-center">{shareLoadingMsg}</div>
				) : (
					<div>
						<Alert className="mb-1" message="Loaded Cell Ids will be shared!" type="info" showIcon closable />
						{shareType === "public" ? (
							loading ? (
								<div>
									<Spin />
								</div>
							) : (
								
							<DashSharePrivate
								type={props.type}
								cellIds={cleanCellIds(props.cellIds)}
							/>)) : null}
					</div>
				)}
			</Modal>
			<Button
				disabled={props.shareDisabled}
				key="1"
				size="medium"
				type="primary"
				className="me-2"
				onClick={doShareDashboard}
				icon={<ShareAltOutlined />}
			>
				Share
			</Button>
		</>
	);
};

export default React.forwardRef(DashboardShareButton);
