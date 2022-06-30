import React from 'react'
import { Col, Row } from 'antd';
import image from "../assets/images/communityImage.png"

const Community = () => {

    return (
        <>
            <div className='Container-fluid' style={{ marginTop: "8rem" }}>
                <div className='min-vh-100'>
                    <div >
                        <Row justify="center">
                            <Col >
                                <h1 className='display-3'><b>Dedicated to community development</b></h1>
                            </Col>
                        </Row>
                        <Row justify="center" className='mt-5'>
                            <Col >
                                <button style={{ padding: "1rem 2.2rem" }} className="btn btn-dark rounded-0" ><b>Join AmpLabs Community</b> </button>
                            </Col>

                        </Row>
                    </div>
                    <div >
                        <Row className='mt-2'>
                            <Col>
                                <img src={image} className='img-fluid shadow-4' alt='Community AmpLabs' style={{ zIndex: -1 }} />
                            </Col>
                        </Row>
                    </div>
                </div>
                <div className="vh-100">
                    <div style={{ paddingTop: '9rem' }}>
                        <Row style={{ paddingBottom: "18rem" }}>
                            <Col span={4} offset={6}>
                                <h3 className="text-secondary">Our Story</h3>
                                <h1 className='display-4'> <b>Build great software together</b></h1>
                            </Col>
                            <Col span={6} offset={1} className="mt-1">
                                <p className='mt-5 fw-normal ' style={{ fontSize: "1.5rem" }}>We are a community of software developers building better tools to improve the Clean Energy Ecosystem</p>
                                <p className='mt-5 fw-normal' style={{ fontSize: "1.5rem" }}>Beginning with software to help Battery Analysts, we strive to help bridge the gap between industry and academia to build better batteries.</p>
                                <p className='mt-5 fw-normal' style={{ fontSize: "1.5rem" }}>We believe everyone can play a role in building a clean energy future. Whether you are new to software development or a seasoned veteran there’s a place for you in the community</p>
                            </Col>
                        </Row>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Community