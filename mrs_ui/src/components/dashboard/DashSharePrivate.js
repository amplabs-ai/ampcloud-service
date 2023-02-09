import message from "antd/es/message";
import Button from "antd/es/button";
import axios from "axios";
import React, { useState } from "react";
import { useAuth0Token } from "../../utility/useAuth0Token";

const DashSharePrivate = (props) => {
	const [btnLoading, setBtnLoading] = useState(false);
	const [shareLink, setShareLink] = useState("");

	const accessToken = useAuth0Token();

	const generateLink = () => {
		setBtnLoading(true);
		let data = JSON.stringify({
			cell_id: props.cellIds,
			test: props.type,
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
					`/dashboard/share/${response.data.detail}/${props.type}`
						
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
