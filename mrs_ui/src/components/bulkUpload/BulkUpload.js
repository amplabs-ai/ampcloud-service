import React, { useEffect, useRef, useState } from "react";
import AWS from "aws-sdk";
import message from 'antd/es/message';
import PageHeader from "antd/es/page-header";
import { useAuth0 } from "@auth0/auth0-react";
import { useAuth0Token } from "../../utility/useAuth0Token";
import { useFileUpload } from "../../context/FileUploadContext";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import BulkUploadDropFileInput from "./BulkUploadDropFileInput";
import BulkUploadPageTable from "./BulkUploadPageTable";
import BulkUploadProgress from "./BulkUploadProgress";
import pako from "pako";

const S3_BUCKET = process.env.REACT_APP_ENV === "development" ? process.env.REACT_APP_DEV_UPLOAD_S3_BUCKET : process.env.REACT_APP_PROD_UPLOAD_S3_BUCKET;
const REGION = process.env.REACT_APP_AWS_REGION;
const AWS_ACCESS_KEY_ID = process.env.REACT_APP_AWS_ACCESS_KEY_ID
const AWS_SECRET_ACCESS_KEY = process.env.REACT_APP_AWS_SECRET_ACCESS_KEY

const BulkUpload = () => {
	const [showProgress, setShowProgress] = useState(false);
	const [uploadProgress, setUploadProgress] = useState({});
	const [getStatusIntervalId, setGetStatusIntervalId] = useState(null);

	const navigate = useNavigate();
	const location = useLocation();
	const controller = useRef(new AbortController());
	const { user } = useAuth0();
	const accessToken = useAuth0Token();

	const {
		state: { tableData, uploadType,},action
	} = useFileUpload();

	AWS.config.update({
		accessKeyId: AWS_ACCESS_KEY_ID,
		secretAccessKey: AWS_SECRET_ACCESS_KEY,
	});

	const myBucket = new AWS.S3({
		params: { Bucket: S3_BUCKET },
		region: REGION,
	});

	const doFileUpload = () => {
    for (const eachFile of tableData) {
		console.log(eachFile)
      let prog = {
        detail: "",
        percentage: 1,
        cellId: eachFile.cellId,
        size: eachFile.file.size,
      };
      setUploadProgress((prev) => {
        return {
          ...prev,
          [eachFile.cellId]: prog,
        };
      });
      const formData = new FormData();
      const reader = new FileReader();
      /* eslint-disable */
      reader.onload = (e) => {
        const fileAsArray = new Uint8Array(e.target.result);
        const compressedFileArray = pako.gzip(fileAsArray);
        const compressedFile = compressedFileArray.buffer;
        const dataToUpload = new Blob([compressedFile], {
          type: eachFile.type,
        });
        const fileToUpload = new Blob([dataToUpload], { type: eachFile.type });
        formData.append("cell_id", eachFile.cellId);
        const params = {
          Body: fileToUpload,
          Bucket: S3_BUCKET,
          Key: `raw/${user.email}/${eachFile.cellId}`,
        };

        myBucket
          .putObject(params)
          .on("httpUploadProgress", (evt) => {
            let percentage = Math.ceil((evt.loaded / evt.total) * 100);
            prog = {
              detail: percentage === 100 ? "completed" : "in progress",
              percentage: percentage,
              cellId: eachFile.cellId,
              step: "Uploading",
              size: eachFile.file.size,
            };
            setUploadProgress((prev) => {
              return {
                ...prev,
                [eachFile.cellId]: prog,
              };
            });
          })
          .send((err, data) => {
            if (!err) {
              axios
			  .post(uploadType === "cycle" ? `/upload/cells/generic`:`/upload/cells/${uploadType}`, formData, {
                  signal: controller.current.signal,
                  headers: {
                    Authorization: `Bearer ${accessToken}`,
                  },
                  onUploadProgress: (progressEvent) => {
                    let percentage = Math.ceil(
                      (progressEvent.loaded / progressEvent.total) * 100
                    );
                    if (percentage === 100) {
                      getStatus(eachFile.cellId);
                    }
                  },
                })
                .then((response) => {
                  if (response.data.status === 200) {
                    if (response.data.detail === "Success") {
                    }
                  }
                })
                .catch((error) => {
                  console.error("file upload err", error);
                });
            }
            if (err) console.log(err);
          });
      };
      reader.readAsArrayBuffer(eachFile.file);
    }
  };

	const getStatus = (cellId) => {
		let errorCount = 0;
		let params = new URLSearchParams();
		params.append("cell_id", cellId);
		params.append("email", user.email);

		const idInterval = setInterval(() => {
			axios
				.get(`/upload/cells/status`, {
					params: params,
				})
				.then((res) => {
					const { percentage, steps, message } = res.data.records?.[cellId];
					setUploadProgress((prev) => {
						return {
							...prev,
							[cellId]: {
								cellId: cellId,
								getStatus: true,
								percentage: percentage,
								step: steps,
								message: message,
							},
						};
					});
					if (parseInt(percentage) === 100) {
						clearInterval(idInterval);
					} else if (parseInt(percentage) === -1) {
						setUploadProgress((prev) => {
							return {
								...prev,
								[cellId]: {
									cellId: cellId,
									getStatus: true,
									percentage: percentage,
									step: steps,
									message: message,
								},
							};
						});
						clearInterval(idInterval);
					}
				})
				.catch((error) => {
					errorCount++;
					if (errorCount > 1) clearInterval(idInterval);
					console.error(error);
				});
		}, 5000);
		setGetStatusIntervalId(idInterval);
	};

	const handleUpload = () => {
		setShowProgress(true);
		const initialRequestBody = tableData.map((file) => {
			return {
				cell_id: file.cellId,
				is_public: file.isPublic,
				template:file.template,
				column_mappings: file.mappings,
				test_type: uploadType,
			};
		});
		axios
			.post("/upload/cells/initialize", JSON.stringify(initialRequestBody), {
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			})
			.then((response) => {
				if (response.status !== 200) return;
				doFileUpload();
			})
			.catch((error) => {
				console.error("init file upload err", error.response.data.detail);
				message.error(error.response.data.detail);
				message.error(error.response.data.detail);
			});
	};

	const isRedirection = () => {
		const valuesArray = Object.values(uploadProgress);
		function isValid(element) {
			const { getStatus, message, percentage, step } = element;
			return getStatus === true && message === "COMPLETED" && percentage === 100 && step === "COMPLETED";
		}
		return valuesArray.every(isValid) && !!valuesArray.length;
	};

	useEffect(() => {
		if (isRedirection()) {
			setTimeout(
				() => navigate(`/dashboard/${uploadType}`, { state: { cellIds: tableData.map((t) => t.cellId), from: "upload" } }),
				1000
			);
		}
	}, [uploadProgress]);

	useEffect(() => {
		const abort = controller.current;
		if (location.pathname === "/upload/cycle") {
			action.setUploadType("cycle")
		}
		else {
			action.setUploadType("abuse")
		}
		return () => {
			if (!getStatusIntervalId) return;
			abort.abort();
			clearInterval(getStatusIntervalId);
		};
	}, [location.pathname]);

	return (
		<div className="p-2 mt-1">
			<PageHeader className="site-page-header mb-1 " title="Upload" ghost={false}></PageHeader>
			{showProgress ? (
				<BulkUploadProgress progressObject={uploadProgress} />
			) : (
				<div>
					<div className="container mt-3">
						<BulkUploadDropFileInput />
					</div>
					<div>
						<BulkUploadPageTable onUpload={handleUpload} />
					</div>
				</div>
			)}
		</div>
	);
};

export default BulkUpload;
