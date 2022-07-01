import React from 'react'
import { Col, Row, Table, Card, Button } from 'antd';
import { CheckCircleFilled, CheckCircleTwoTone } from "@ant-design/icons";
import background from "../assets/images/pricingCardBg.png"

const columns = [
    {
        title: 'Features',
        dataIndex: 'Features',
        width: 300,
    },
    {
        title: 'Community',
        dataIndex: 'Community',
        width: 150,
    },
    {
        title: 'Analyst',
        dataIndex: 'Analyst',
        width: 150,
    },
    {
        title: 'Team',
        dataIndex: 'Team',
    },
];
const data = [];
data.push({
    key: "Private Data Storage",
    Features: `Private Data Storage`,
    Community: `N/A(Public data only)`,
    Analyst: `1 GB`,
    Team: `Custom`,
}, {
    key: "Plotting Tool",
    Features: `Plotting Tool`,
    Community: `Support Public Data only`,
    Analyst: `Support Public and Private data`,
    Team: `Custom`,
}, {
    key: "Dashboards",
    Features: `Dashboards`,
    Community: `Single Dashboard`,
    Analyst: `Multiple Dashboards`,
    Team: `Custom`,
}, {
    key: "Templates",
    Features: ` Templates`,
    Community: ` Standard Templates`,
    Analyst: ` Custom Templates`,
    Team: `Custom`,
}, {
    key: "Data Sharing",
    Features: ` Data Sharing`,
    Community: ` Public Sharing Only`,
    Analyst: ` Private Sharing`,
    Team: `Custom`,
}, {
    key: "Authentication",
    Features: ` Authentication`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Analyst: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
}, {
    key: "Access to Public Data",
    Features: ` Access to Public Data`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Analyst: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
}, {
    key: "Support Battery Cyclers",
    Features: ` Support Battery Cyclers`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Analyst: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
});

const Pricing = () => {
    const Box = {
        marginTop: 25,
        minHeight: 240,
        padding: 24,
        background: "#e7f7ff",
    }
    return (
        <>

            <div style={{ marginTop: "75px", paddingBottom: "100px" }}>
                <Row>
                    <Col span={4} offset={4}>
                        <h2>Pricing</h2>
                    </Col>
                </Row>
                <Row>
                    <Col span={10} offset={7}>
                        <p className='fw-light bg-light p-4 fs-5' style={{ lineHeight: '2rem' }}>At AmpLabs we're committed to providing value for the <b>Clean Energy community</b>. We will always provide Community features for free to all. Consider subscribing to <b>Analyst tier</b> to help bring Battery Data tools to the world. For people with custom requirements please <b>reach out to us</b> and we can figure out a solution that works best for you.</p>
                    </Col>
                </Row>
                <Row>
                    <Col span={10} offset={7} style={Box}>
                        <Col justify="center" >
                            <h3 className='text-center mt-1 mb-3'>Pick the plan that works <br />for you</h3>
                            <div className="site-card-wrapper mt-2" style={{ display: "flex", position: "absolute" }}>
                                <Row gutter={40}>
                                    <Col span={8}>
                                        <Card style={{ width: 220 }} className="shadow">
                                            <h3 style={{ textAlign: "left" }}>Community</h3>
                                            {/* <p className='justify-content'>Use our most basic plan at no cost.See Features Below</p> */}
                                            <h4><b>Free</b></h4>
                                            <Button type="primary" ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "#DEE9F3" }}><b>Get Started</b>
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col span={8} >
                                        <Card style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', width: 220 }} className="text-white shadow-lg">
                                            <h3 className="text-white" style={{ textAlign: "left" }}>Analyst</h3>
                                            {/* <p className='justify-content'>Use our most popular plan! See Features Below</p> */}
                                            <h4 className="text-white"><b>$25/month</b></h4>
                                            <Button type="primary" ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "white" }}><b>Try For Free</b>
                                            </Button>
                                        </Card>
                                    </Col>
                                    <Col span={8}>
                                        <Card style={{ width: 220 }} className="shadow">
                                            <h3 style={{ textAlign: "left" }}>Team</h3>
                                            {/* <p className='justify-content'>Customize a plan centered around your team needs!</p> */}
                                            <h4><b>Custom</b></h4>
                                            <Button type="primary" ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "#DEE9F3" }}><b>Contact Us</b>
                                            </Button>
                                        </Card>
                                    </Col>
                                </Row>

                            </div>
                        </Col>
                    </Col>
                </Row>
                <Row style={{ marginTop: 125 }}>
                    <Col span={10} offset={7}>
                        <Table
                            columns={columns}
                            dataSource={data}
                            pagination={false}

                        />
                    </Col>
                </Row>
            </div>
        </>
    )
}

export default Pricing
