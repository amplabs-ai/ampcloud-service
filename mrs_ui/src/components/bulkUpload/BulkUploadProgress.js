import Avatar from "antd/es/avatar";
import List from "antd/es/list";
import Progress from "antd/es/progress";
import Spin from "antd/es/spin";
import React, { useEffect, useState } from "react";
import blankFileImage from "../../../src/assets/images/file-blank-solid-240.png";
import "./drop-file-input.css";

function BulkUploadProgress(props) {
  const [fileList, setFileList] = useState([]);
  useEffect(() => {
    if (props.files && props.files.length) {
      setFileList(props.files);
    }
  }, [props.files]);

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
