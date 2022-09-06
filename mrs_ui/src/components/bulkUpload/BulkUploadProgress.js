import { Avatar, List, Progress, Spin } from "antd";
import React, { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import blankFileImage from "../../../src/assets/images/file-blank-solid-240.png";
import "./drop-file-input.css";

function BulkUploadProgress(props) {
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    if (props.files && props.files.length) {
      setFileList(props.files);
    }
  }, [props.files]);

  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    // props.onFileChange(updatedList);
    setFileList(updatedList);
  };
  const getProgress = (uploadProgress) => {
    if (uploadProgress) {
      let progress = parseInt(uploadProgress?.percentage || 0);

      return {
        value: progress,
        status:
          progress === 100 ? "" : progress === -1 ? "exception" : "active",
        message: uploadProgress.getStatus
          ? `STEP 2/2 - ${uploadProgress.step}`
          : `STEP 1/2 - ${
              progress === 100 ? "Uploaded Successfully" : "Uploading"
            }`,
      };
    } else {
      return {
        value: 0,
        status: "",
      };
    }
  };

  const bytesToSize = (bytes) => {
    let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };
  return (
    <div>
      <div
        className="container"
        style={{
          height: "80vh",
          display: "flex",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        {Object.values(props.progressObject).length ? (
          <List
            dataSource={Object.values(props.progressObject)}
            renderItem={(item) => (
              <List.Item
                key={item.cellId}
                // delete mechanism and retry mechanism

                // extra={
                //   <span
                //     title="Remove File"
                //     style={{ cursor: "pointer", marginLeft: "3%" }}
                //     // onClick={() => fileRemove(item)}
                //   >
                //     <FaTimes />
                //   </span>
                // }
              >
                <List.Item.Meta
                  avatar={<Avatar src={blankFileImage} />}
                  title={item.cellId}
                  description={
                    getProgress(item).value ? (
                      <div
                        className={`${
                          getProgress(item).value === -1 ? "error_Message" : ""
                        }`}
                      >
                        <Progress
                          percent={getProgress(item).value}
                          status={getProgress(item).status}
                        />
                        {getProgress(item).value === -1
                          ? `ERROR - ${
                              item.message ||
                              "Oops! Error occured while processing uploads..."
                            } `
                          : getProgress(item).message}
                      </div>
                    ) : (
                      // bytesToSize(item.size)
                      "uploading"
                    )
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <Spin size="large" />
        )}
      </div>
    </div>
  );
}

export default BulkUploadProgress;
