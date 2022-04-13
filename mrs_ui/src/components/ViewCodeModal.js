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
  console.log("searchParams", searchParams);
  console.log("searchParamsType", typeof searchParams);
  const codeString = code;

  const formatCode = (code, ...args) => {
    for (let k in args) {
      code = code.replace("{" + k + "}", args[k]);
    }
    return code;
  };

  function copyToClipboard(textToCopy) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(textToCopy);
    } else {
      let textArea = document.createElement("textarea");
      textArea.value = textToCopy;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      return new Promise((res, rej) => {
        document.execCommand("copy") ? res() : rej();
        textArea.remove();
      });
    }
  }

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
            console.log("copied!");
            message.success("Copied to clipboard!");
            message.success("Copied to clipboard!");
            copyToClipboard(
              formatCode(codeString, searchParams, Cookies.get("userId"))
            );
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
              copyToClipboard(
                formatCode(codeString, searchParams, Cookies.get("userId"))
              );
              // navigator.clipboard.writeText(
              //   formatCode(codeString, searchParams, Cookies.get("userId"))
              // );
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
