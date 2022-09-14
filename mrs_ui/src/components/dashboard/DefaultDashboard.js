import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card, Statistic, Typography } from "antd";
import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import Table from "ant-responsive-table";
import Tutorial from "../tutorial/Tutorial";
import SummaryChart from "../summary-charts/SummaryChart";

const { Title } = Typography;

const DefaultDashboard = () => {
	const [cathodeTypesSummary, setCathodeTypesSummary] = useState([]);
	const [formFactorTypesSummary, setFormFactorTypesSummary] = useState([]);
	const { user } = useAuth0();
	const name = user.email.split("@")[0];
	const cardTitle = <div className="text-center">Summary</div>;

	useEffect(() => {
		const getSummaryData = () => {
			setTimeout(() => {
				setCathodeTypesSummary([
					{
						name: "type1",
						count: 12,
					},
					{
						name: "type12",
						count: 1000,
					},
				]);
			}, 4000);
			setTimeout(() => {
				setFormFactorTypesSummary([
					{
						name: "type1",
						count: 12,
					},
					{
						name: "type12",
						count: 1000,
					},
				]);
			}, 2000);
		};
		getSummaryData();
	}, []);

	return (
		<>
			<div className="p-4">
				<p className="fs-2">Welcome {name.charAt(0).toUpperCase() + name.slice(1)},</p>
				<div className="text-center">
					<p className="fs-3">Explore, analyze, and share quality battery data</p>
				</div>
				<div className="row justify-content-center">
					<Card
						bordered={false}
						style={{
							width: "fit-content",
							padding: 10,
						}}
					>
						<div className="text-center">
							<Title level={2}>New to AmpLabs? Try our Tutorial</Title>
						</div>
						<div className="d-flex justify-content-center">
							<Tutorial />
						</div>
					</Card>
				</div>
				<div className="text-center mt-4 text-muted">
					<p>
						Select a cell from the list on the left to view time series and cycle series information about the battery
						cell.
					</p>
				</div>
				<Card title={cardTitle} bordered={false} loading={!cathodeTypesSummary.length}>
					<div className="row">
						<div className="col-md-4 text-center">
							<Statistic title="Cells" value={112893} />
						</div>
						<div className="col-md-4 text-center">
							<Statistic title="Cycles" value={112893} />
						</div>
						<div className="col-md-4 text-center">
							<Statistic title="GBs" value={112893} />
						</div>
					</div>
					<div className="row justify-content-around my-3">
						<div className="col-md-6">
							<SummaryChart data={cathodeTypesSummary} title="Cathode Types" />
						</div>
						<div className="col-md-6">
							<SummaryChart data={formFactorTypesSummary} title="Form-Factor Types" />
						</div>
					</div>
				</Card>
			</div>
		</>
	);
};

export default DefaultDashboard;
