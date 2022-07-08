import React from "react";
import mixpanel from "mixpanel-browser";
import { Button } from "antd";
import { useAuth0 } from "@auth0/auth0-react";

mixpanel.init("1808e36e2fdfd13139a1df86c970aa1b", { debug: true });

const MixpanelTest = () => {
	const auth = useAuth0();
	const handleBtnClick = () => {
		console.log(auth);
		mixpanel.track("Test", {
			email: auth.user.email,
		});
	};

	return (
		<div className="mt-5">
			MixpanelTest
			<Button onClick={handleBtnClick}>Click me</Button>
		</div>
	);
};

export default MixpanelTest;
