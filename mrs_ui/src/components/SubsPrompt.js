import Modal from 'antd/es/modal';
import Button from 'antd/es/button';
import Result from "antd/es/result";
import { useNavigate } from "react-router-dom";

const SubsPrompt = (props) => {
	const navigate = useNavigate();

	return (
		<>
			<Modal
				title="Please subscribe to continue..."
				visible={props.isModalVisible}
				onCancel={props.handleCancel}
				onOk={props.handleOk}
				maskClosable={false}
				footer={null}
			>
				<Result
					title="Private Cells are only accessible on paid plans"
					subTitle={"Or remove private cells and continue"}
					extra={
						<Button
							type="primary"
							key="console"
							onClick={() => {
								navigate("/pricing");
							}}
						>
							Buy Now
						</Button>
					}
				/>
			</Modal>
		</>
	);
};

export default SubsPrompt;
