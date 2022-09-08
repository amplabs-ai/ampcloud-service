const fileUploadReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case "SET_FILE_TYPE":
			return {
				...state,
				fileType: payload.fileType,
			};
		case "SET_FILES_TO_MAP_HEADER":
			return {
				...state,
				filesToMapHeader: payload.filesToMapHeader,
			};
		case "SET_TABLE_DATA":
			return {
				...state,
				tableData: payload.tableData,
			};
		case "SET_SHOW_PARSING_SPINNER":
			return {
				...state,
				showParsingSpinner: payload.showParsingSpinner,
			};
		case "SET_SHOW_COL_MAP_MODAL":
			return {
				...state,
				showColMapModal: payload.showColMapModal,
				filesToMapHeader: !payload.showColMapModal ? [] : state.filesToMapHeader,
				showPackDataCellInput: !payload.showColMapModal ? false : state.showPackDataCellInput,
			};
		case "SET_COL_MAP_DATA":
			return {
				...state,
				colMapData: payload.colMapData,
			};
		case "SET_SUPPORTED_COLUMNS":
			return {
				...state,
				supportedColumns: payload.supportedColumns,
			};
		case "SET_SHOW_PACK_DATA_INPUT":
			return {
				...state,
				showPackDataCellInput: payload.showPackDataCellInput,
			};
		default:
			throw new Error(`No case for type ${type} found in fileUploadReducer.`);
	}
};

export const initialState = {
	colMapData: {},
	fileType: "normalTest",
	filesToMapHeader: [],
	showParsingSpinner: false,
	showColMapModal: false,
	tableData: [],
	supportedColumns: {},
	showPackDataCellInput: false,
};

export default fileUploadReducer;
