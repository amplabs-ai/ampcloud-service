import React from "react";
import { Result, Button } from "antd";

const PageNotFound = () => {
	return (
		<div style={{ paddingTop: "75px" }}>
			<Result
				status="404"
				title="404"
				subTitle="Sorry, the page you visited does not exist."
				extra={
					<Button type="link" onClick={() => window.location.replace("/")}>
						Back Home
					</Button>
				}
			/>
		</div>
	);
};

export default PageNotFound;
