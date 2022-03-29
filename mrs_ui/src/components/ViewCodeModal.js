import React from "react";

import { Modal, Button, Typography, message, Tooltip } from "antd";
import { FaCode } from "react-icons/fa";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";

import Cookies from "js-cookie";

const { Text } = Typography;

const ViewCodeModal = ({
	code,
	modalVisible,
	setModalVisible,
	searchParams,
}) => {
	const codeString = code;

	const formatCode = (code, ...args) => {
		for (let k in args) {
			code = code.replace("{" + k + "}", args[k]);
		}
		return code;
	};

	return (
		<>
			<Modal
				centered
				visible={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				width="fit-content"
				bodyStyle={{
					padding: "0px",
				}}
			>
				<SyntaxHighlighter
					onClick={() => {
						console.log("copied!");
						message.success("Copied to clipboard!");
						message.success("Copied to clipboard!");
						navigator.clipboard.writeText(codeString);
					}}
					showLineNumbers={true}
					wrapLines={true}
					language="python"
					style={a11yLight}
				>
					{/* {codeString.replace("{queryParams}", searchParams)} */}
					{formatCode(codeString, searchParams, Cookies.get("userId"))}
				</SyntaxHighlighter>
				<div className="d-flex flex-row-reverse mb-2">
					<Text
						type="secondary"
						onClick={() => {
							navigator.clipboard.writeText(codeString);
							message.success("Copied to clipboard!");
							message.success("Copied to clipboard!");
							console.log("copied!");
						}}
						code={true}
						style={{ cursor: "pointer" }}
					>
						Click to copy
					</Text>
				</div>
			</Modal>
		</>
	);
};

export default ViewCodeModal;
