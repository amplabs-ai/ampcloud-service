import React from 'react'
import { Col, Row } from 'antd';

const Cloud = () => {

    return (
        <>
            <div style={{ marginTop: "8rem" }}>
                <div>
                    <Row justify='center'>
                        <Col>
                            <p className='display-3 text-center mt-5'>A faster way to collaborate on<br />data projects</p>
                        </Col>
                    </Row>
                    <Row justify='center'>
                        <Col span={6} offset={3}>
                            <button style={{ padding: "1rem 2.2rem" }} className="btn btn-dark rounded-0 mt-5" ><b>Try AmpLabs Cloud</b> </button>
                        </Col>
                    </Row>
                </div>
                <h2 className='text-center mt-5 pb-4'>
                    <span>Features</span>
                </h2>
                <div className='pb-5'>
                    <Row >
                        <Col span={8} offset={4} style={{ paddingLeft: "45px" }}><h2>Privacy & Security</h2></Col>
                    </Row>
                    <Row>
                        <Col span={8} offset={8} className="mb-5 mt-3">
                            <h4 className="text-secondary mt-2">Storage</h4>
                            <h5 className='fw-normal'>Scalable cloud storage to support your workload. Ask us about using your own storage for additional privacy</h5>
                            <h4 className="text-secondary mt-3">Data Accessibility</h4>
                            <h5 className='fw-normal'>No matter what plan you choose, you are the one who controls your data.</h5>
                            <h4 className="text-secondary mt-3"  >Encryption</h4>
                            <h5 className='fw-normal'>Data is encrypted at rest and in-flight following industry best practices</h5>
                        </Col>
                    </Row>
                </div>
                <div className='pt-5 mb-5 '>
                    <Row >
                        <Col span={6} offset={6} style={{ paddingLeft: "20px" }}><h2 >Analysis</h2></Col>
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
                    <Row >
                        <Col span={6} offset={5} style={{ paddingLeft: "50px" }}><h2>Integrations</h2></Col>
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


        </>
    )
}

export default Cloud