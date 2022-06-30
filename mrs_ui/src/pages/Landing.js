import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useSpring } from "react-spring";
import styles from "./LandingPage.module.css";

const Landing = () => {
    const auth = useAuth0();
    const { loginWithRedirect } = useAuth0();
    console.log("from context", auth);
    const aboutAnim = useSpring({
        delay: 500,
        from: { x: -900, opacity: 0 },
        to: { x: 0, opacity: 1 },
    });
    return (
        <>
            <div className={styles.wrapper + " container"} >
                <div className="row">
                    <div className="col-md-12 p-2 text-center" style={aboutAnim}>
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "100%",
                                flexDirection: "column",
                            }}
                        >
                            <span className="display-4 text-center mb-3" style={{ fontSize: 80 }}><b>Harmonize, Manage, Analyze  <br />Battery Data</b></span>
                            <p className="para" style={{ lineHeight: "1.6", padding: "0px 90px" }}>
                                AmpLabs builds tools for scientists, researchers, and engineers to modernize our energy systems.
                            </p>
                            <div className="text-center">
                                <button className="btn btn-dark rounded-0" style={{ padding: "15px 35px" }} onClick={() => loginWithRedirect()}><b>Try AmpLabs Cloud</b> </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Landing;
