import React from 'react'
import styles from "../pages/LandingPage.module.css";
import { Col, Row } from 'antd';

const Cloud = () => {

    return (
        <>

            <div className={styles.wrapper + " container-fluid "} style={{ marginTop: "37rem" }} >
                <div className="row">
                    <div className="col-md-12 p-2 text-center" >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                height: "auto",
                                flexDirection: "column",
                            }}
                        >
                            <span className="display-1 text-center mb-3" ><b>A Faster way to collaborate<br />data Projects</b></span>

                            <div className="text-center mt-5 " >
                                <button style={{ padding: '1rem 2.5rem ' }} className="btn btn-dark rounded-0"><b> Try AmpLabs Cloud</b></button>
                            </div>
                        </div>
                    </div>
                    <h2 className='text-center mt-5 pb-4'>
                        <span>Features</span>
                    </h2>
                    <div className='pb-5'>
                        <Row gutter={250}>
                            <Col span={6} offset={4}><h2>Privacy & Security</h2></Col>
                        </Row>
                        <Row>
                            <Col span={8} offset={8} className="mb-5 mt-3">
                                <h4 className="text-secondary mt-2">Storage</h4>
                                <h5 className='fw-normal'>Scalable cloud storage to support your workload. Ask us about using your own storage for additional privacy</h5>
                                <h4 className="text-secondary mt-3">Data Accessibility</h4>
                                <h5 className='fw-normal'>No matter what plan you choose, you are the one who controls your data.</h5>
                                <h4 className="text-secondary mt-3"  >Encryption</h4>
                                <h5 className='fw-normal'>Data is encrypted at rest and in-flight following industry best practices
                                    Analysis</h5>
                            </Col>
                        </Row>
                    </div>
                    <div className='pt-5 mb-5 '>
                        <Row gutter={80}>
                            <Col span={6} offset={6}><h2 >Analysis</h2></Col>
                        </Row>
                        <Row>
                            <Col span={8} offset={8} className="mb-5 mt-3">
                                <h4 className="text-secondary mt-2">Process Statistic on Data</h4>
                                <h5 className='fw-normal'>Compute 100s of time series and cycle statistics to improve your analysis</h5>
                                <h4 className="text-secondary mt-3">Plotting Tool</h4>
                                <h5 className='fw-normal'>Build new visualizations with your data using AmpLabs Plotter</h5>
                                <h4 className="text-secondary mt-3"  >Dashboard Tool</h4>
                                <h5 className='fw-normal'>Build standard dashboards for your team
                                </h5>
                            </Col>
                        </Row>
                    </div>
                    <div className='pt-5 mb-5' >
                        <Row gutter={220}>
                            <Col span={6} offset={5}><h2>Integrations</h2></Col>
                        </Row>
                        <Row>
                            <Col span={8} offset={8} className="mb-5 mt-3">
                                <h4 className="text-secondary mt-2">Support Major File Formats</h4>
                                <h5 className='fw-normal'>Support for major Battery Cycler formats means we can process data from anywhere</h5>
                                <h4 className="text-secondary mt-3">Connects to your existing workflow</h4>
                                <h5 className='fw-normal'>With AmpLabs API, data is accessible from any language</h5>
                            </Col>
                        </Row>
                    </div>


                </div>
            </div>
        </>
    )
}

export default Cloud