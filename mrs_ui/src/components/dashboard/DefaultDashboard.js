import { useAuth0 } from "@auth0/auth0-react";
import { Button, Card, Statistic, Typography } from "antd";
import React, { useEffect, useState } from "react";
import "antd/dist/antd.css";
import Table from "ant-responsive-table";
import Tutorial from "../tutorial/Tutorial";
import SummaryChart from "../summary-charts/SummaryChart";
import axios from "axios";

const { Title } = Typography;

const DefaultDashboard = () => {
	const [summaryData, setSummaryData] = useState({});
	const { user } = useAuth0();
	const name = user.email.split("@")[0];
	const cardTitle = <div className="text-center">Summary</div>;

	const dummy = [
		{
			cathode_stats: [
				{
					cathode: "NMC",
					count: 2,
				},
			],
			cell_id_count: 53,
			cycle_count: 10968,
			form_factor_stats: [
				{
					count: 2,
					form_factor: "NA",
				},
			],
			size: 2.13594067,
		},
	];

	useEffect(() => {
		const getSummaryData = () => {
			axios
				.get("/echarts/metadataSummary")
				.then((res) => {
					console.log("summaryData", res);
					let summaryData = res.data.records[0];
					setSummaryData(summaryData);
				})
				.catch((error) => {
					console.log("error :>> ", error);
				});
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
				<Card title={cardTitle} bordered={false} loading={!Object.keys(summaryData).length}>
					<div className="row">
						<div className="col-md-4 text-center">
							<Statistic title="Cells" value={summaryData.cell_id_count} />
						</div>
						<div className="col-md-4 text-center">
							<Statistic title="Cycles" value={summaryData.cycle_count} />
						</div>
						<div className="col-md-4 text-center">
							<Statistic title="GBs" value={Math.round(summaryData.size * 100) / 100} />
						</div>
					</div>
					<div className="row justify-content-around my-3">
						<div className="col-md-6">
							<SummaryChart data={summaryData.cathode_stats} title="Cathode" type="cathode_stats" />
						</div>
						<div className="col-md-6">
							<SummaryChart data={summaryData.form_factor_stats} title="Form-Factor" type="form_factor_stats" />
						</div>
					</div>
				</Card>
			</div>
		</>
	);
};

export default DefaultDashboard;
