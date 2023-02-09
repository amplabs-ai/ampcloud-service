import React from "react";
import message from "antd/es/message";
import Modal from "antd/es/modal";
import Typography from "antd/es/typography";
import {Light as SyntaxHighlighter} from "react-syntax-highlighter";
import a11yLight from "react-syntax-highlighter/dist/esm/styles/hljs/a11y-light";
import python from "react-syntax-highlighter/dist/esm/languages/hljs/python"

import copyToClipboard from "../../../utility/copyToClipboard";

const { Text } = Typography;
SyntaxHighlighter.registerLanguage('python', python);

const formatText = (str, mapObj) => {
	if (str && mapObj) {
		var re = new RegExp(Object.keys(mapObj).join("|"), "gi");

		return str.replace(re, function (matched) {
			return mapObj[matched.toLowerCase()];
		});
	}
};

const ViewCode = ({ code, modalVisible, setModalVisible, toReplace }) => {
	const copyText = () => {
		copyToClipboard(formatText(code, toReplace));
		message.success("Copied to clipboard!");
		message.success("Copied to clipboard!");
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
					onClick={copyText}
					showLineNumbers={true}
					wrapLines={true}
					language="python"
					style={a11yLight}
				>
					{formatText(code, toReplace)}
				</SyntaxHighlighter>
				<div className="d-flex flex-row-reverse mb-2">
					<Text type="secondary" onClick={copyText} code={true} style={{ cursor: "pointer" }}>
						Click to copy
					</Text>
				</div>
			</Modal>
		</>
	);
};

export default ViewCode;
