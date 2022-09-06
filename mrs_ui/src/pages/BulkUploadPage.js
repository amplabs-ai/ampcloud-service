import React from "react";
import BulkUpload from "../components/bulkUpload/BulkUpload";
import { FileUploadProvider } from "../context/FileUploadContext";

const BulkUploadPage = () => {
	return (
		<FileUploadProvider>
			<div style={{ paddingTop: "1.1rem" }}>
				<BulkUpload />
			</div>
		</FileUploadProvider>
	);
};

export default BulkUploadPage;
