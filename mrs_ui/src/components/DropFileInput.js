import React, { useRef, useState, useEffect } from "react";
import PropTypes from "prop-types";
import blankFileImage from "../assets/file-blank-solid-240.png";
import uploadImg from "../assets/cloud-upload-regular-240.png";
import "./drop-file-input.css";
import { Progress, Typography, Alert, List, Avatar, Button } from "antd";
import { FaTimes } from "react-icons/fa";
import { FaCloudUploadAlt, FaExclamationCircle } from "react-icons/fa";
import Papa from "papaparse";

const { Text } = Typography;

const REQUIRED_HEADERS = ["test_time", "cycle", "current", "voltage"];

const DropFileInput = (props) => {
  console.log("props.uploadProgress", props.uploadProgress);
  const wrapperRef = useRef(null);
  const [fileList, setFileList] = useState([]);
  const [uploadBtnDisabled, setUploadBtnDisabled] = useState(false);
  const [fileValidationErrs, setFileValidationErrs] = useState([]);

  useEffect(() => {
    if (fileValidationErrs.length) {
      setUploadBtnDisabled(true);
    } else {
      setUploadBtnDisabled(false);
    }
  }, [fileValidationErrs]);

  const onDragEnter = () => wrapperRef.current.classList.add("dragover");
  const onDragLeave = () => wrapperRef.current.classList.remove("dragover");
  const onDrop = () => wrapperRef.current.classList.remove("dragover");

  const onFileDrop = (e) => {
    let updatedList = []; // props.reUpload ? [] : [...fileList];
    setUploadBtnDisabled(false);
    for (let i = 0; i < e.target.files.length; i++) {
      let file = e.target.files[i];
      if (file) {
        updatedList.push(file);
      }
    }
    props.onFileChange(updatedList);
    setFileList(updatedList);

    // Passing file data (event.target.files[0]) to parse using Papa.parse
    Papa.parse(e.target.files[0], {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.data.length) {
          console.log("papaparse", results.data);
          if (props.pageType === "cycle-test") {
            _validateCycleTestCsv(results.data);
          }
        } else {
          console.log("file is empty!");
        }
      },
    });
  };

  const _validateCycleTestCsv = (data) => {
    setFileValidationErrs([]); // reset err, file_preview_icon
    setUploadBtnDisabled(true); // disable button
    _checkHeaders(data);
    _checkCycleIndex(data);
    _checkTestTime(data);
  };

  const _checkHeaders = (data) => {
    let headers = Object.keys(data[0]).map((h) => h.toLowerCase());
    let missingHeaders = [];
    // check missing headers
    missingHeaders = REQUIRED_HEADERS.filter(function (v) {
      // allowed headers for cycle index
      if (
        [
          "cycle",
          "cycle_index",
          "cycle_id",
          "cycle_number",
          "cycle_count",
        ].includes(v)
      ) {
        return false;
      } else {
        return headers.indexOf(v) == -1;
      }
    });
    console.log("Missing Headers: ", missingHeaders);
    if (missingHeaders.length)
      setFileValidationErrs((prev) => [
        ...prev,
        `Missing column headers: ${missingHeaders
          .map((h) => h)
          .join(", ")} [Required Headers: cycle, test_time, current, voltage]`,
      ]);
  };

  const _checkCycleIndex = (data) => {
    let x = data.every(function (e, i, a) {
      if (i)
        return (
          e["cycle"] >= a[i - 1]["cycle"] && e["cycle"] - a[i - 1]["cycle"] <= 1
        );
      else return true;
    });
    if (!x) {
      setFileValidationErrs((prev) => [
        ...prev,
        "Cycle Index should be monotonically increasing at most by factor of one.",
      ]);
    }
  };

  const _checkTestTime = (data) => {
    let x = data.every(function (e, i, a) {
      if (i) return e["test_time"] >= a[i - 1]["test_time"];
      else return true;
    });
    if (!x) {
      setFileValidationErrs((prev) => [
        ...prev,
        "Time Series should be monotonically increasing.",
      ]);
    }
  };

  const fileRemove = (file) => {
    const updatedList = [...fileList];
    updatedList.splice(fileList.indexOf(file), 1);
    props.onFileChange(updatedList);
    setFileList(updatedList);
  };

  const bytesToSize = (bytes) => {
    let sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (bytes === 0) return "0 Byte";
    let i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i), 2) + " " + sizes[i];
  };

  const getProgress = (fileName) => {
    if (Object.keys(props.uploadProgress).length) {
      let progress = parseInt(props.uploadProgress[fileName]?.percentage || 0);

      return {
        value: progress,
        status:
          progress === 100 ? "" : progress === -1 ? "exception" : "active",
        message: progress === -1 ? props.uploadProgress[fileName].detail : "",
      };
    } else {
      return {
        value: 0,
        status: "",
      };
    }
  };

  // const shallRedirectToDashBoard = () => {
  // 	if (props.shallRedirectToDashBoard) {
  // 		setTimeout(() => navigate("/dashboard"), 1000);
  // 	}
  // };
  // shallRedirectToDashBoard();

  return (
    <>
      {fileList.length < 1 && (
        <div
          ref={wrapperRef}
          className="drop-file-input shadow-sm"
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
        >
          <div className="drop-file-input__label">
            <img src={uploadImg} alt="" />
            <p>Click or drag file to this area to upload</p>
          </div>
          <input
            type="file"
            value=""
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, .txt"
            onChange={onFileDrop}
            // multiple
          />
        </div>
      )}
      {fileList.length > 0 ? (
        <div className="drop-file-preview">
          <div className="mb-1 d-flex justify-content-between">
            <Text type="secondary">Ready to upload</Text>
            <Button
              type="primary"
              onClick={(e) => {
                props.fileUploadHandler(e);
              }}
              icon={<FaCloudUploadAlt />}
              size="large"
              disabled={uploadBtnDisabled}
              // loading={uploadBtnDisatrybled}
            >
              &nbsp;&nbsp;Upload
            </Button>
          </div>
          <div className="mb-4">
            <List
              dataSource={fileList}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  extra={
                    !Object.keys(props.uploadProgress).length && (
                      <span
                        title="Remove File"
                        style={{ cursor: "pointer" }}
                        onClick={() => fileRemove(item)}
                      >
                        <FaTimes />
                      </span>
                    )
                  }
                >
                  <List.Item.Meta
                    avatar={
                      fileValidationErrs.length ? (
                        <FaExclamationCircle color="red" size="30px" />
                      ) : (
                        <Avatar src={blankFileImage} />
                      )
                    }
                    title={item.name}
                    description={
                      getProgress(item.name).value ? (
                        <>
                          {getProgress(item.name).message ? (
                            <Alert
                              message={getProgress(item.name).message}
                              type="error"
                              showIcon
                            />
                          ) : (
                            <Progress
                              percent={getProgress(item.name).value}
                              status={getProgress(item.name).status}
                            />
                          )}
                        </>
                      ) : (
                        bytesToSize(item.size)
                      )
                    }
                  />
                  <br />
                  {fileValidationErrs.length ? (
                    <div
                      style={{ position: "absolute", top: "90%", color: "red" }}
                    >
                      <ul>
                        {fileValidationErrs.map((err) => (
                          <li key={err}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div></div>
                  )}
                </List.Item>
              )}
            />
          </div>
        </div>
      ) : null}
    </>
  );
};

DropFileInput.propTypes = {
  onFileChange: PropTypes.func,
};

export default React.memo(DropFileInput);
