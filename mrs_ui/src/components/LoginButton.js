import { useAuth0 } from "@auth0/auth0-react";
import Button from "antd/es/button";
import { FaArrowRight } from "react-icons/fa";

const LoginButton = () => {
	const { loginWithRedirect } = useAuth0(); 
	return (
		<Button type="primary" className="m-1" icon={<FaArrowRight />} size="large" onClick={() => loginWithRedirect()}>
			&nbsp;&nbsp;Start
		</Button>
	);
};

export default LoginButton;
