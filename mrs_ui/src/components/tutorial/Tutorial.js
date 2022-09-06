import { useAuth0 } from "@auth0/auth0-react";
import { Button, Modal } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomStepWizard from "./CustomStepWizard";

const Tutorial = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	// const { getIdTokenClaims } = useAuth0();
	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleOk = () => {
		setIsModalVisible(false);
	};
	// const showUserLog = useCallback(() => {
	// 	if (window.localStorage.getItem("pop_status") !== null) return;
	// 	getIdTokenClaims().then(claims => {
	// 		const isNewUser = claims['http://www.amplabs.com/is_new_user']
	// 		if (isNewUser) {
	// 			setIsModalVisible(true);
	// 			window.localStorage.setItem("pop_status", "1")
	// 		}
	// 	})
	// }, [getIdTokenClaims]);

	// useEffect(() => {
	// 	showUserLog();
	// }, [])

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
				// bodyStyle={{ minHeight: "80vh" }}
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
