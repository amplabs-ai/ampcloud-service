import React from "react";
import Modal from "antd/es/modal";
import Typography from "antd/es/typography";
import message from "antd/es/message";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python"
import copyToClipboard from "../utility/copyToClipboard";
const { Text } = Typography;
SyntaxHighlighter.registerLanguage('python', python);


const ViewCodeModal = ({ code, modalVisible, setModalVisible }) => {
	const codeString = code;

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
						copyToClipboard(codeString);
					}}
					showLineNumbers={true}
					wrapLines={true}
					language="python"
					style={a11yLight}
				>
					{codeString}
				</SyntaxHighlighter>
				<div className="d-flex flex-row-reverse mb-2">
					<Text
						type="secondary"
						onClick={() => {
							copyToClipboard(codeString);
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
