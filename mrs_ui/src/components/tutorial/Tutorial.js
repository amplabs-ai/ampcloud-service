import { useAuth0 } from "@auth0/auth0-react";
import { Modal } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import CustomStepWizard from "./CustomStepWizard";

const Tutorial = () => {
	const [isModalVisible, setIsModalVisible] = useState(false);
	const { getIdTokenClaims } = useAuth0();
	const showModal = () => {
		setIsModalVisible(true);
	};
	const handleOk = () => {
		setIsModalVisible(false);
	};
	const showUserLog = useCallback(() => {
		if (window.localStorage.getItem("pop_status") !== null) return;
		getIdTokenClaims().then(claims => {
			const isNewUser = claims['http://www.amplabs.com/is_new_user']
			if (isNewUser) {
				setIsModalVisible(true);
				window.localStorage.setItem("pop_status", "1")
			}
		})
	}, [getIdTokenClaims]);

	useEffect(() => {
		showUserLog();
	}, [])

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	return (
		<div >
			<Link className="nav-link" to="/" onClick={(e) => { e.preventDefault(); showModal(); }}>
				Tutorial
			</Link>
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
