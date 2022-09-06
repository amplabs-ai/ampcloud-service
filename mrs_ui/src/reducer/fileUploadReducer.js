const fileUploadReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case "SET_FILE_TYPE":
			return {
				...state,
				fileType: payload.fileType,
			};
		case "SET_VALID_FILES_PARSED_DATA":
			return {
				...state,
				filesToMapHeader: payload.filesToMapHeader,
			};
		case "SET_TABLE_DATA":
			return {
				...state,
				tableData: payload.tableData,
			};
		case "SET_FILES_FROM_DROP_FILE_INPUT":
			return {
				...state,
				filesFromDropFileInput: payload.files,
			};
		case "SET_SHOW_PARSING_SPINNER":
			return {
				...state,
				showParsingSpinner: payload.showParsingSpinner,
			};
		default:
			throw new Error(`No case for type ${type} found in fileUploadReducer.`);
	}
};

export const initialState = {
	fileType: "normalTest",
	filesToMapHeader: [],
	tableData: [],
	filesFromDropFileInput: [],
	showParsingSpinner: false,
};

export default fileUploadReducer;
