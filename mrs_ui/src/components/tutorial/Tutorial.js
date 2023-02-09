import Modal from "antd/es/modal";
import React, {useState } from "react";
import CustomStepWizard from "./CustomStepWizard";

const Tutorial = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleOk = () => {
		setIsModalVisible(false);
	};

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	return (
		<div >
			<button className="text-white mt-3 py-2 rounded-pill shadow" style={{ backgroundColor: "#dc3545", padding: "0 3.5rem" }} onClick={(e) => { e.preventDefault(); showModal(); }}>
				<b>Tutorial</b>
			</button>
			<Modal
				width="68vw"
				visible={isModalVisible}
				closable={false}
				onOk={handleOk}
				onCancel={handleCancel}
				footer={null}
				maskClosable={false}
				destroyOnClose
			>
				<CustomStepWizard onCancelTutorial={handleCancel} />
			</Modal>
		</div>
	);
};

export default Tutorial;
