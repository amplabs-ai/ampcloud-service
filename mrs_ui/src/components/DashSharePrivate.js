import { Button, Input, message } from "antd";
import axios from "axios";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useAuth } from "../context/auth";

const DashSharePrivate = (props) => {
	const [sharedWith, setSharedWith] = useState([]);
	const [btnLoading, setBtnLoading] = useState(false);
	const [inputMail, setInputMail] = useState("");
	const { user } = useAuth(); // auth context
	const [shareLink, setShareLink] = useState("");

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
		if (!sharedWith.length) {
			return;
		}
		setBtnLoading(true);
		console.log("generate share link private", props.cellIds);
		let data = JSON.stringify({
			shared_to: sharedWith,
			cell_id: props.cellIds,
			test: props.dashboard,
			step: props.step,
			sample: props.sample,
			is_public: false,
		});

		let config = {
			method: "post",
			url: "/dashboard/share-id",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${user.iss}`,
			},
			data: data,
		};

		console.log(config);

		axios(config)
			.then(function (response) {
				setBtnLoading(false);
				console.log("dashboard share id res", response.data.detail);
				setShareLink(
					(process.env.REACT_APP_ENV === "production" ? process.env.REACT_APP_PROD_URI : "http://localhost:3000") +
						`/dashboard/${props.dashboard}/share/` +
						response.data.detail
				);
			})
			.catch(function (error) {
				setBtnLoading(false);
				console.log(error);
				message.error("Error Generating Link! Please Try Again.");
				message.error("Error Generating Link! Please Try Again.");
			});
	};

	return (
		<div className="my-2">
			<Input.Group compact>
				<Input
					style={{
						width: "calc(100% - 200px)",
					}}
					placeholder="Enter email adderess"
					type="email"
					onChange={(e) => setInputMail(e.target.value)}
					value={inputMail}
				/>
				<Button onClick={addShareMail}>Add</Button>
			</Input.Group>
			<div className="pt-1">
				{/* <span className="me-1">Shared With:</span> */}
				{sharedWith.map((user) => {
					return (
						<span key={user} className="badge bg-light text-dark fw-normal m-1" style={{ fontSize: "16px" }}>
							{user} <FaTimes style={{ cursor: "pointer" }} onClick={() => removeSharedWith(user)} />
						</span>
					);
				})}
				<div className="mt-1">
					<Button type="link" loading={btnLoading} onClick={generateLink}>
						share access & generate link
					</Button>
				</div>
			</div>
			{shareLink && <div className="bg-light my-1 py-2 px-4 ">{shareLink}</div>}
		</div>
	);
};

export default DashSharePrivate;
