import React from 'react'
import { Col, Row, Table, Card, Button, Layout } from 'antd';
import { CheckCircleTwoTone } from "@ant-design/icons";
import background from "../assets/images/pricingCardBg.png";
import mixpanel from "mixpanel-browser";
const { Footer } = Layout;

const pricingMail = () => {
  window.location.href = "mailto:ask@amplabs.ai";
  mixpanel.track("user_route_pricing_mail");
};

const stripePricing = () => {
  window.open(
    process.env.REACT_APP_ENV === "development"
      ? process.env.REACT_APP_DEV_STRIPE_URI
      : process.env.REACT_APP_PROD_STRIPE_URI,
    "_blank"
  );
  mixpanel.track("user_route_stripe");
};
const columns = [
  {
    title: "Features",
    dataIndex: "Features",
    width: 350,
  },
  {
    title: (
      <Card>
        <h3>Community</h3>
        <h4>
          <b>Free</b>
        </h4>
        <Button
          type="primary"
          href="/dashboard"
          onClick={() => {
            mixpanel.track("user_route_signup");
          }}
          ghost
          style={{
            borderRadius: "4px",
            paddingBottom: "10px",
            padding: "5px 45px",
            backgroundColor: "#DEE9F3",
          }}
        >
          <b>Get Started</b>
        </Button>
      </Card>
    ),
    dataIndex: "Community",
    width: 180,
    align: "center",
  },
  // {
  //   title: (
  //     <Card
  //       style={{
  //         backgroundImage: `url(${background})`,
  //         backgroundSize: "cover",
  //         width: 220,
  //       }}
  //       className="text-white"
  //     >
  //       <h3 className="text-white">Pro</h3>
  //       <h4 className="text-white">
  //         <b>$25/Month</b>
  //       </h4>

  //       <Button
  //         type="primary"
  //         onClick={() => stripePricing()}
  //         ghost
  //         style={{
  //           borderRadius: "4px",
  //           paddingBottom: "10px",
  //           padding: "5px 45px",
  //           backgroundColor: "white",
  //         }}
  //       >
  //         <b>Try For Free</b>
  //       </Button>
  //     </Card>
  //   ),
  //   dataIndex: "Pro",
  //   width: 180,
  //   align: "center",
  // },
  {
    title: (
      <Card>
        <h3>Team</h3>
        <h4>
          <b>Custom</b>
        </h4>
        <Button
          type="primary"
          onClick={() => pricingMail()}
          ghost
          style={{
            borderRadius: "4px",
            paddingBottom: "10px",
            padding: "5px 45px",
            backgroundColor: "#DEE9F3",
          }}
        >
          <b>Contact Us</b>
        </Button>
      </Card>
    ),
    dataIndex: "Team",
    align: "center",
  },
];
const data = [];
data.push(
  {
    key: "Subscription to AmpLabs Battery Insights Newsletter",
    Features: `Subscription to AmpLabs Battery Insights Newsletter`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    // Pro: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
  },
  {
    key: "Data Storage",
    Features: `Data Storage`,
    Community: `Unlimited Storage for Public Data Only`,
    // Pro: `Unlimited Public Data Storage + 250MB Storage for Private Data`,
    Team: `Custom`,
  },
  {
    key: "Plotting Tool",
    Features: ` Plotting Tool`,
    Community: ` Simple Controls`,
    // Pro: ` Advanced Controls`,
    Team: `Custom`,
  },
  {
    key: "Dashboards",
    Features: ` Dashboards`,
    Community: ` Single Standard Dashboard`,
    // Pro: ` No-Code Dashboard Builder`,
    Team: `Custom`,
  },
  {
    key: "Templates	",
    Features: ` Templates	`,
    Community: `Standard Templates`,
    // Pro: `Custom Templates`,
    Team: `Custom`,
  },
  {
    key: "Metadata",
    Features: ` Metadata`,
    Community: `Standard Schema`,
    // Pro: `Flexible Definitions`,
    Team: `Custom`,
  },
  {
    key: "Data Sharing",
    Features: ` Data Sharing`,
    Community: `Public Sharing Only`,
    // Pro: `Private Sharing`,
    Team: `Custom`,
  },
  {
    key: "Authentication",
    Features: ` Authentication`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    // Pro: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
  },
  {
    key: "Access to Public Research Data",
    Features: ` Access to Public Research Data`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    // Pro: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
  },
  {
    key: "Support Major Battery Cyclers",
    Features: ` Support Major Battery Cyclers`,
    Community: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    // Pro: <CheckCircleTwoTone style={{ fontSize: "25px" }} />,
    Team: `Custom`,
  }
);

const Pricing = () => {
  return (
    <>
      <div style={{ marginTop: "75px", paddingBottom: "100px" }}>
        <Row>
          <Col span={4} offset={5}>
            <h2>Pricing</h2>
          </Col>
        </Row>
        <Row justify="center">
          <Col span={10}>
            <p
              className="fw-light bg-light p-4 fs-5"
              style={{ lineHeight: "2rem" }}
            >
              At AmpLabs, we're committed to providing value for the{" "}
              <b>Battery Professionals Community</b>. We will always provide{" "}
              <b>Community features for free to all</b>. Consider{" "}
              <b>subscribing to Pro tier</b> to help bring Battery Data tools to
              the world. For people with custom requirements{" "}
              <b>please reach out to us</b> and we can figure out a solution
              that works best for you.
            </p>
          </Col>
        </Row>
        <Row justify="center">
          <Col span={10}>
            <Col>
              <h3 className="text-center mt-1 mb-3">
                Pick the plan that works <br />
                for you
              </h3>
            </Col>
          </Col>
        </Row>
        <Row justify="center">
          <Col span={12}>
            <Table columns={columns} dataSource={data} pagination={false} />
          </Col>
        </Row>
      </div>
      <Footer style={{ textAlign: "center" }} className="bg-dark text-white">
        Find a bug, request a feature, or desire a change, please report any
        requests to <a href="mailto:ask@amplabs.ai">ask@amplabs.ai</a>
      </Footer>
    </>
  );
};

export default Pricing;
