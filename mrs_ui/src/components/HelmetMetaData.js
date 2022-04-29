import React from "react";
import { Helmet } from "react-helmet";
export default function HelmetMetaData(props) {
	let currentUrl = props.currentUrl ? props.currentUrl : "http://www.amplabs.ai";
	let quote = props.quote !== undefined ? props.quote : "";
	let title = props.title !== undefined ? props.title : "amplabs.ai";
	let image =
		props.image !== undefined
			? props.image
			: "https://storage.googleapis.com/cmperstribe_storage_usha/Banner/IMG_3640.JPG";
	let description =
		props.description !== undefined
			? props.description
			: "Tools for scientists, researchers, and engineers to analyze, publish, and collaborate in order to reinvent our energy systems.";
	let hashtag = props.hashtag !== undefined ? props.hashtag : "#amplabs";
	return (
		<Helmet>
			<title>{title}</title>
			<meta charset="utf-8" />
			<meta http-equiv="X-UA-Compatible" content="IE=edge" />
			<meta name="csrf_token" content="" />
			<meta property="type" content="website" />
			<meta property="url" content={currentUrl} />
			<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
			<meta name="msapplication-TileColor" content="#ffffff" />
			<meta name="msapplication-TileImage" content="/apple-touch-icon.png" />
			<meta name="theme-color" content="#ffffff" />
			<meta name="_token" content="" />
			<meta name="robots" content="noodp" />
			<meta property="title" content={title} />
			<meta property="quote" content={quote} />
			<meta name="description" content={description} />
			<meta property="image" content={image} />
			<meta property="og:locale" content="en_US" />
			<meta property="og:type" content="website" />
			<meta property="og:title" content={title} />
			<meta property="og:quote" content={quote} />
			<meta property="og:hashtag" content={hashtag} />
			<meta property="og:image" content={image} />
			<meta content="image/*" property="og:image:type" />
			<meta property="og:url" content={currentUrl} />
			<meta property="og:site_name" content="AmpLabs" />
			<meta property="og:description" content={description} />
		</Helmet>
	);
}
