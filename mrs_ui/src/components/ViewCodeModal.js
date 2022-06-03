import React from "react";
import { Modal, Typography, message } from "antd";
import SyntaxHighlighter from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import copyToClipboard from "../utility/copyToClipboard";
import { useAuth0 } from "@auth0/auth0-react";

const { Text } = Typography;

const ViewCodeModal = ({ code, modalVisible, setModalVisible, searchParams }) => {
	const codeString = code;
	const { user } = useAuth0();

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
					padding: "10px",
					margin: "85px 10px",
				}}
			>
				<SyntaxHighlighter
					onClick={() => {
						message.success("Copied to clipboard!");
						message.success("Copied to clipboard!");
						copyToClipboard(
							formatCode(codeString, searchParams, `httprequest.add_header("Authorization", "Bearer ${user.iss}")`)
						);
					}}
					showLineNumbers={true}
					wrapLines={true}
					language="python"
					style={a11yLight}
				>
					{/* {codeString.replace("{queryParams}", searchParams)} */}
					{formatCode(codeString, searchParams, `httprequest.add_header("Authorization", "Bearer ${user.iss}")`)}
				</SyntaxHighlighter>
				<div className="d-flex flex-row-reverse mb-2">
					<Text
						type="secondary"
						onClick={() => {
							copyToClipboard(
								formatCode(codeString, searchParams, `httprequest.add_header("Authorization", "Bearer ${user.iss})"`)
							);
							// navigator.clipboard.writeText(
							//   formatCode(codeString, searchParams, Cookies.get("userId"))
							// );
							message.success("Copied to clipboard!");
							message.success("Copied to clipboard!");
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
