import React, { useState, useEffect } from "react";
import styles from "./LandingPage.module.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { useAuth } from "../components/auth";

import Cookies from "js-cookie";

import { Spin, Result, Button } from "antd";

const LandingPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();

  // const redirectPath = location.state?.path || "/";

  const [emailValue, setEmailValue] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [loading, setLoading] = useState(true);

  const [internalServerError, setInternalServerError] = useState("");

  useEffect(() => {
    axios
      .post(
        "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/login",
        {
          email: Cookies.get("userId"),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        }
      )
      .then((response) => {
        console.log(response);
        if (response.data.status === 200) {
          // auth.login(emailValue);
          setLoading(false);
          navigate(response.data.detail); // , { replace: true }
        }
      })
      .catch((err) => {
        setLoading(false);
        setInternalServerError("500");
      });
  }, []);

  const validateEmail = (input) => {
    let validRegex = /[a-z0-9]+@[a-z]+\.[a-z]{2,3}/;
    if (input.match(validRegex)) {
      return true;
    } else {
      return false;
    }
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!validateEmail(emailValue)) {
      setErrorMsg("Please enter a valid email!");
    } else {
      axios
        .post(
          "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/login",
          {
            email: emailValue,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
            withCredentials: true,
          }
        )
        .then((response) => {
          console.log(response);
          if (response.data.status === 200) {
            auth.login(emailValue);
            navigate(response.data.detail || "/upload"); // , { replace: true }
          }
        })
        .catch((err) => {
          setErrorMsg("Something went wrong. Please try again!");
        });
    }
  };

  return (
    <div className={styles.wrapper + " container"}>
      {loading ? (
        <Spin size="large" />
      ) : internalServerError ? (
        <Result
          status="500"
          title="500"
          subTitle="Sorry, something went wrong."
          extra={
            <Button type="primary" href="/">
              Reload
            </Button>
          }
        />
      ) : (
        <div className="row">
          <div className="col-md-8 p-2">
            <h1 className="display-4 text-center mb-4 font-weight-normal">
              About
            </h1>
            <div className="px-3">
              <p className="para fw-light" style={{ lineHeight: "1.6" }}>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
                cursus vel diam nec commodo. Suspendisse tincidunt mi at dui
                tincidunt gravida. Duis id mattis magna. Nulla facilisi.
              </p>
              <p className="para fw-light" style={{ lineHeight: "1.6" }}>
                Integer tristique nunc quis semper rutrum. Nulla cursus
                tristique volutpat. Morbi sapien purus, eleifend aliquet libero
                sed, ultrices porta magna. Aliquam erat volutpat. Aenean in
                bibendum arcu, nec condimentum nunc. Suspendisse malesuada
                luctus lacus, et porta tortor fermentum id. Curabitur in gravida
                leo. Etiam vehicula auctor arcu, vitae pharetra ex ultricies
                nec.
              </p>
            </div>
          </div>
          <div className={`col-md-4 p-2 ${styles.formSection}`}>
            <form onSubmit={(e) => handleEmailSubmit(e)}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control mx-0"
                  id="email"
                  placeholder="Enter Email"
                  onChange={(e) => {
                    setErrorMsg("");
                    setEmailValue(e.target.value);
                  }}
                  required
                />
                {errorMsg && (
                  <div className="form-text" style={{ color: "red" }}>
                    {errorMsg}
                  </div>
                )}
              </div>
              <div className="text-center">
                <button type="submit" className="px-4 btn btn-outline-dark">
                  Continue
                </button>
              </div>
            </form>
            <p className="fs-6 mt-4 p-3 fw-light" style={{ lineHeight: "1.6" }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce
              cursus vel diam nec commodo. Suspendisse tincidunt mi at dui
              tincidunt gravida. Duis id mattis magna. Nulla facilisi.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;
