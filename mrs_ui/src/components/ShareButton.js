import React, { useEffect, useState } from "react";
import { audit } from "../auditAction/audit";
import { Button, Card, message, Modal, Skeleton, Spin, Typography } from "antd";
import { FaLinkedin, FaEnvelope, FaLink, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { ShareAltOutlined } from "@ant-design/icons";
import { toBlob } from "html-to-image";
import { useSearchParams } from "react-router-dom";
import Cookies from "js-cookie";
import copyToClipboard from "../utility/copyToClipboard";
import b64toBlob from "../utility/b64ToBlob";
import axios from "axios";
import HelmetMetaData from "../components/HelmetMetaData";
import { LINKEDIN_SHARE_TEXT_CYCLE } from "../constants/shareText";
import { LINKEDIN_SHARE_TEXT_ABUSE } from "../constants/shareText";
import { useAuth } from "../context/auth";

const Title = Typography;
const CLIENT_ID = process.env.REACT_APP_LINKEDIN_CLIENT_ID;
const REDIRECT_URI_CYCLE = process.env.REACT_APP_LINKEDIN_REDIRECT_URI_DASH_CYCLE;
const REDIRECT_URI_ABUSE = process.env.REACT_APP_LINKEDIN_REDIRECT_URI_DASH_ABUSE;

const formatString = (str, ...args) => {
	for (let k in args) {
		str = str.replace("{" + k + "}", args[k]);
	}
	return str;
};

const ShareButton = (props, ref) => {
	const [metaImageDash, setMetaImageDash] = useState(null);
	const [shallShowShareDashModal, setShallShowShareDashModal] = useState(false);
	const [shareLoadingMsg, setShareLoadingMsg] = useState("");

	const [searchParamsForCode, setSearchParamsForCode] = useSearchParams();
	const { user } = useAuth(); // auth context

	useEffect(() => {
		if ([...searchParamsForCode].length) {
			let code = searchParamsForCode.get("code");
			if (code) {
				setShareLoadingMsg(
					<>
						<Title level={4}>Creating Post for you...</Title>
						<br></br>
						<Spin size="large" />
					</>
				);
				console.log("code", code);
				// send code to backend
				let shareText = formatString(
					props.dashboard === "cycle" ? LINKEDIN_SHARE_TEXT_CYCLE : LINKEDIN_SHARE_TEXT_ABUSE,
					Cookies.get("userId")
				);
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
				formData.append("dashboard", props.dashboard);
				axios
					.post("/dashboard/share-linkedin", formData, {
						headers: {
							"Content-Type": "multipart/form-data",
							Authorization: `Bearer ${user.iss}`,
						},
					})
					.then((response) => {
						searchParamsForCode.delete("code");
						searchParamsForCode.delete("state");
						setSearchParamsForCode(searchParamsForCode);
						console.log("linkedin share success", response);
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
						console.log("linkedin share failed", err);
					});
			}
		}
	}, []);

	const doShareDashboard = () => {
		audit(`${props.dashboard}_dash_share`);
		setMetaImageDash(null);
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
				setMetaImageDash(base64data);
				localStorage.setItem("dashImage", base64data);
			};
		});
	};

	const shareOnLinkedIn = () => {
		window.open(
			`
			https://www.linkedin.com/oauth/v2/authorization?
			response_type=code&
			state=123456789&
			scope=r_emailaddress%20r_liteprofile%20w_member_social&
			client_id=${CLIENT_ID}
			&redirect_uri=${encodeURI(props.dashboard === "cycle" ? REDIRECT_URI_CYCLE : REDIRECT_URI_ABUSE)}
		`,
			"_self"
		);
	};

	return (
		<>
			<HelmetMetaData image={metaImageDash}></HelmetMetaData>
			<Modal
				title="Share Dashboard"
				centered
				visible={shallShowShareDashModal || shareLoadingMsg}
				footer={false}
				onCancel={() => {
					setShallShowShareDashModal(false);
					setShareLoadingMsg("");
				}}
				style={{ maxHeight: "70%" }}
			>
				{shareLoadingMsg ? (
					<div className="text-center">{shareLoadingMsg}</div>
				) : (
					<div>
						<div style={{ display: "flex" }}>
							<div style={{ width: "50%" }} className="text-center">
								<button
									className="btn btn-link"
									onClick={(e) => {
										e.preventDefault();
										shareOnLinkedIn();
									}}
								>
									<FaLinkedin size={70} />
								</button>
							</div>
							<div style={{ width: "50%" }} className="text-center">
								<a
									title="Mail"
									href={`mailto:?subject=Amplabs.ai - Dashboard&body=${formatString(
										props.dashboard === "cycle" ? LINKEDIN_SHARE_TEXT_CYCLE : LINKEDIN_SHARE_TEXT_ABUSE,
										Cookies.get("userId")
									)}`}
									target="_blank"
									rel="noreferrer"
								>
									<FaEnvelope size={70} />
								</a>
							</div>
							<div style={{ width: "50%" }} className="text-center">
								<div
									className="btn btn-link"
									title="Direct Link"
									onClick={(e) => {
										e.preventDefault();
										copyToClipboard(
											`https://www.amplabs.ai/dashboard/${props.dashboard}-test?mail=${Cookies.get("userId")}`
										);
										message.success("Copied to clipboard!");
										message.success("Copied to clipboard!");
									}}
								>
									<FaLink size={60} />
								</div>
							</div>
						</div>
						<Card
							loading={!metaImageDash}
							cover={metaImageDash ? <img alt="dashboard screenshot" src={metaImageDash} /> : <Skeleton.Image />}
							style={{ width: "100%", marginTop: "10px", backgroundColor: "#f9f9f9" }}
						>
							{formatString(
								props.dashboard === "cycle" ? LINKEDIN_SHARE_TEXT_CYCLE : LINKEDIN_SHARE_TEXT_ABUSE,
								Cookies.get("userId")
							)}
						</Card>
					</div>
				)}
			</Modal>
			<Button
				disabled={props.shareDisabled}
				key="1"
				size="large"
				type="primary"
				onClick={doShareDashboard}
				icon={<ShareAltOutlined />}
			>
				Share
			</Button>
		</>
	);
};

export default React.forwardRef(ShareButton);
