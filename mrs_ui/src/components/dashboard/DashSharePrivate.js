import { Button, Input, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth0Token } from "../../utility/useAuth0Token";

const DashSharePrivate = (props) => {
	const [sharedWith, setSharedWith] = useState([]);
	const [btnLoading, setBtnLoading] = useState(false);
	const [inputMail, setInputMail] = useState("");
	const [shareLink, setShareLink] = useState("");

	const accessToken = useAuth0Token();

	const removeSharedWith = (user) => {
		setSharedWith(sharedWith.filter((u) => u !== user));
	};

	const addShareMail = () => {
		if (inputMail) {
			setSharedWith((prev) => {
				return [...prev, inputMail];
			});
			setInputMail("");
		}
	};

	const generateLink = () => {
		// if (!sharedWith.length) {
		// 	return;
		// }
		setBtnLoading(true);
		let data = JSON.stringify({
			// shared_to: sharedWith,
			cell_id: props.cellIds,
			test: props.dashboard,
			// step: props.step,
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
				setBtnLoading(false);
				setShareLink(
					(process.env.REACT_APP_ENV === "production" ? process.env.REACT_APP_PROD_URI : "https://65.1.73.220:4000") +
						`/dashboard/share/` +
						response.data.detail
				);
			})
			.catch(function (error) {
				setBtnLoading(false);
				message.error("Error Generating Link! Please Try Again.");
				message.error("Error Generating Link! Please Try Again.");
			});
	};

	return (
		<div className="my-2">
			<div className="pt-1">
				{/* <span className="me-1">Shared With:</span> */}
				<div className="mt-1">
					<Button  loading={btnLoading} onClick={generateLink}>
						share access & generate link
					</Button>
				</div>
			</div>
			{shareLink && <div className="bg-light my-1 py-2 px-4 ">{shareLink}</div>}
		</div>
	);
};

export default DashSharePrivate;
