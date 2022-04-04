import React, { useState, useEffect } from "react";
import DropFileInput from "../components/DropFileInput";
import styles from "./UploadPage.module.css";
import axios from "axios";
import { Radio, Typography, Alert } from "antd";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const UploadPage = () => {
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});
  const [fileUploadType, setFileUploadType] = useState("arbin");

  const [reUpload, setReUpload] = useState(false);

  const [intervalId, setIntervalId] = useState(null);

  const [shallRedirectToDashBoard, setShallRedirectToDashBoard] =
    useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [intervalId]);

  const onFileChange = (files) => {
    console.log(files);
    setUploadProgress({});
    setFiles(files);
  };

  const fileUploadHandler = (e) => {
    let formData = new FormData();
    files.forEach((file) => {
      formData.append("file", file);
    });
    let endpoint = "";
    switch (fileUploadType) {
      case "maccor":
        endpoint =
          "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/upload/cells/maccor";
        break;
      case "generic":
        endpoint =
          "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/upload/cells/generic";
        break;
      default:
        endpoint =
          "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/upload/cells/arbin";
        break;
    }
    let x = getStatus();
    setReUpload(false);
    axios
      .post(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        console.log("file upload finish", response.data.records);
        console.log("uploadProgress", uploadProgress);
        let redirect = true;
        for (const key in response.data.records) {
          const file = response.data.records[key];
          if (file.percentage === -1) {
            redirect = false;
            setReUpload(true);
            setUploadProgress({});
            setTimeout(() => {
              clearInterval(x);
            }, 2000);
            break;
          }
        }
        console.log("redirect", redirect);
        if (redirect) {
          // setShallRedirectToDashBoard(true);
          setTimeout(() => navigate("/dashboard"), 2000);
        }
      })
      .catch((error) => {
        console.log("file upload err", error);
        clearInterval(x);
        setReUpload(true);

        // let redirect = true;
        // for (const key in uploadProgress) {
        //   const file = uploadProgress[key];
        //   if (file.percentage === -1) {
        //     redirect = false;
        //     setReUpload(true);
        //     setUploadProgress({});
        //     setTimeout(() => {
        //       clearInterval(x);
        //     }, 2000);
        //     break;
        //   }
        // }
        // console.log("redirect", redirect);
        // if (redirect) {
        //   // setShallRedirectToDashBoard(true);
        //   setTimeout(() => navigate("/dashboard"), 2000);
        // }
      });
  };

  const getStatus = () => {
    let errorCount = 0;
    let intervalId = setInterval(() => {
      axios
        .get(
          "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/upload/cells/status"
        )
        .then((res) => {
            console.log("status", res.data.records);
            setUploadProgress({ ...uploadProgress, ...res.data.records });
        })
        .catch((err) => {
          if (errorCount > 5) {
            clearInterval(intervalId);
          }
          console.log(err);
          errorCount++;
        });
    }, 2000);
    console.log("intervalID", intervalId);
    setIntervalId(intervalId);
    return intervalId;
  };

  return (
    <div className={styles.wrapper + " container"}>
      <div className="row">
        <div className="col-md-12 p-2">
          <div className="px-3">
            <p className="para fw-light">
            We provide support for Arbin, Maccor cell test files.<br></br>
            Arbin: xlsx format<br></br>
            Maccor: txt format<br></br><br></br>
            We also provide support for generic csv files:<br></br>
            CSV with columns (cycle, test_time, current, voltage)<br></br>
            units for columns = cycle (#), test_time (seconds), current (Amps), voltage (Volts)<br></br> 
            Note: For current (A) charging is Positive
            </p>
          </div>
        </div>
        <div className={`col-md-12 ${styles.uploadSection}`}>
          <div className="mb-2">
            <Title level={5}>File-Type:</Title>
            <Radio.Group
              defaultValue={fileUploadType}
              onChange={(e) => setFileUploadType(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="arbin">arbin</Radio.Button>
              <Radio.Button value="maccor">maccor</Radio.Button>
              <Radio.Button value="generic">generic</Radio.Button>
            </Radio.Group>
          </div>
          <DropFileInput
            onFileChange={(files) => onFileChange(files)}
            fileUploadHandler={fileUploadHandler}
            uploadProgress={uploadProgress}
            shallRedirectToDashBoard={shallRedirectToDashBoard}
            reUpload={reUpload}
          />
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
