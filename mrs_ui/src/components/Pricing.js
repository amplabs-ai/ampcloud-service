import React from 'react'
import { Col, Row, Table, Card, Button } from 'antd';
import { CheckCircleTwoTone } from "@ant-design/icons";
import background from "../assets/images/pricingCardBg.png"

const columns = [
    {
        title: 'Features',
        dataIndex: 'Features',
        width: 300,
    },
    {
        title: <Card>
            <h3 >Community</h3>
            <h4><b>Free</b></h4>
            <Button type="primary" href='/dashboard' ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "#DEE9F3" }}><b>Get Started</b>
            </Button>
        </Card>,
        dataIndex: 'Community',
        width: 150,
        align: "center"
    },
    {
        title: <Card style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover', width: 220 }} className="text-white">
            <h3 className="text-white" >Analyst</h3>
            <h4 className="text-white"><b>$25/month</b></h4>
            <Button type="primary" onClick={() => window.open("https://buy.stripe.com/test_eVa00Zefu0BCeBi3cd", "_blank")} ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "white" }}><b>Try For Free</b>
            </Button>
        </Card>,
        dataIndex: 'Analyst',
        width: 150,
        align: "center"
    },
    {
        title: <Card >
            <h3 >Team</h3>
            <h4><b>Custom</b></h4>
            <Button type="primary" ghost style={{ borderRadius: "4px", paddingBottom: "10px", padding: "5px 45px", backgroundColor: "#DEE9F3" }}><b>Contact Us</b>
            </Button>
        </Card>,
        dataIndex: 'Team',
        align: "center"
    },
];
const data = [];
data.push({
    key: "Private Data Storage",
    Features: `Private Data Storage`,
    Community: `N/A(Public data only)`,
    Analyst: `250MB`,
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
    // const stripeGateway = () => {
    //     window.open("https://buy.stripe.com/test_eVa00Zefu0BCeBi3cd");
    // };
    return (
        <>

            <div style={{ marginTop: "75px", paddingBottom: "100px" }}>
                <Row>
                    <Col span={4} offset={5}>
                        <h2>Pricing</h2>
                    </Col>
                </Row>
                <Row justify='center'>
                    <Col span={10} >
                        <p className='fw-light bg-light p-4 fs-5' style={{ lineHeight: '2rem' }}>At AmpLabs we're committed to providing value for the <b>Clean Energy community</b>. We will always provide Community features for free to all. Consider subscribing to <b>Analyst tier</b> to help bring Battery Data tools to the world. For people with custom requirements please <b>reach out to us</b> and we can figure out a solution that works best for you.</p>
                    </Col>
                </Row>
                <Row justify="center">
                    <Col span={10}  >
                        <Col  >
                            <h3 className='text-center mt-1 mb-3'>Pick the plan that works <br />for you</h3>
                        </Col>
                    </Col>
                </Row>
                <Row justify="center">
                    <Col span={11} >
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