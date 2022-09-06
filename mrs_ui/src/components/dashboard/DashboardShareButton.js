import React, { useEffect, useState } from "react";
import { Alert, Button, Card, message, Modal, Skeleton, Spin, Switch, Typography } from "antd";
import { audit } from "../../auditAction/audit";
import { FaLinkedin, FaEnvelope, FaLink, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { SHARE_TEXT } from "../../constants/shareText";
import { ShareAltOutlined } from "@ant-design/icons";
import { toBlob } from "html-to-image";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import b64toBlob from "../../utility/b64ToBlob";
import copyToClipboard from "../../utility/copyToClipboard";
import DashSharePrivate from "./DashSharePrivate";
import HelmetMetaData from "../../components/HelmetMetaData";
import { useUserPlan } from "../../context/UserPlanContext";

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

const DashboardShareButton = (props, ref) => {
	const [metaImageDash, setMetaImageDash] = useState(null);
	const [shallShowShareDashModal, setShallShowShareDashModal] = useState(false);
	const [shareLoadingMsg, setShareLoadingMsg] = useState("");
	const [shareType, setShareType] = useState("private");
	const [loading, setLoading] = useState(false);
	const [shareLink, setShareLink] = useState("");

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
				let shareText = formatString(SHARE_TEXT, props.dashboard, state);
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
		audit(`${props.dashboard}_dash_share`, {...user, userTier: userPlan});
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
			state=${shareLink}&
			scope=r_emailaddress%20r_liteprofile%20w_member_social&
			client_id=${CLIENT_ID}
			&redirect_uri=${encodeURI(REDIRECT_URI_CYCLE)}
		`,
			"_self"
		);
	};

	const cleanCellIds = (cellIds) => {
		let x = [];
		cellIds.map((k) => {
			x.push(k.substring(k.indexOf("_") + 1));
		});
		return x;
	};

	const onShareWithChange = (checked) => {
		checked ? setShareType("public") : setShareType("private");
		if (checked) {
			setLoading(true);
			let data = JSON.stringify({
				shared_to: [],
				cell_id: cleanCellIds(props.cellIds),
				test: props.dashboard,
				step: props.step,
				sample: props.sample,
				is_public: true,
			});

			let config = {
				method: "post",
				url: "/dashboard/share-id",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
				data: data,
			};

			axios(config)
				.then(function (response) {
					setLoading(false);
					setShareLink(
						(process.env.REACT_APP_ENV === "production" ? process.env.REACT_APP_PROD_URI : "http://localhost:3000") +
							`/dashboard/${props.dashboard}/share/` +
							response.data.detail
					);
				})
				.catch(function (error) {
					setLoading(false);
					console.error(error);
					message.error("Error Generating Link! Please Try Again.");
					message.error("Error Generating Link! Please Try Again.");
				});
		}
	};

	return (
		<>
			{/* <HelmetMetaData image={metaImageDash}></HelmetMetaData> */}
			<Modal
				title="Share Dashboard"
				centered
				visible={shallShowShareDashModal || shareLoadingMsg}
				footer={false}
				onCancel={() => {
					setShallShowShareDashModal(false);
					setShareLoadingMsg("");
				}}
				// style={{ maxHeight: "70%" }}
				style={{ marginTop: "100px" }}
				width={700}
			>
				{shareLoadingMsg ? (
					<div className="text-center">{shareLoadingMsg}</div>
				) : (
					<div>
						<Alert className="mb-1" message="Loaded Cell Ids with step will be shared!" type="info" showIcon closable />
						<span className="fw-bold ms-1">Type: </span>
						<Switch checkedChildren="Public" unCheckedChildren="Private" onChange={onShareWithChange} />
						{shareType === "public" ? (
							loading ? (
								<div>
									<Spin />
								</div>
							) : (
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
										<p>LinkedIn</p>
									</div>
									<div style={{ width: "50%" }} className="text-center">
										<a
											title="Mail"
											href={`mailto:?subject=Amplabs.ai - Dashboard&body=${formatString(
												SHARE_TEXT,
												props.dashboard,
												shareLink
											)}`}
											target="_blank"
											rel="noreferrer"
										>
											<FaEnvelope size={80} />
										</a>
										<p>Email</p>
									</div>
									<div style={{ width: "50%" }} className="text-center">
										<div
											className="btn btn-link"
											title="Direct Link"
											onClick={(e) => {
												e.preventDefault();
												copyToClipboard(shareLink);
												message.success("Copied to clipboard!");
												message.success("Copied to clipboard!");
											}}
										>
											<FaLink size={70} />
										</div>
										<p>Copy Direct Link</p>
									</div>
								</div>
							)
						) : (
							<DashSharePrivate
								step={props.step}
								sample={props.sample}
								dashboard={props.dashboard}
								cellIds={cleanCellIds(props.cellIds)}
							/>
						)}
						<Card
							loading={!metaImageDash}
							// cover={metaImageDash ? <img alt="dashboard screenshot" src={metaImageDash} /> : <Skeleton.Image />}
							style={{ width: "100%", marginTop: "10px", backgroundColor: "#f9f9f9" }}
						>
							{metaImageDash ? (
								<img alt="dashboard screenshot" style={{ width: "100%" }} src={metaImageDash} />
							) : (
								<Skeleton.Image />
							)}
							<br />
							{shareLink ? formatString(SHARE_TEXT, props.dashboard, shareLink) : null}
						</Card>
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
