import { createContext, useContext, useReducer} from "react";
import fileUploadReducer, { initialState } from "../reducer/fileUploadReducer";

const FileUploadContext = createContext();

export const FileUploadProvider = ({ children }) => {
	const [state, dispatch] = useReducer(fileUploadReducer, initialState);

	const setFileType = (fileType) => {
		dispatch({
			type: "SET_FILE_TYPE",
			payload: {
				fileType,
			},
		});
	};

	const setFilesToMapHeader = (filesToMapHeader) => {
		dispatch({
			type: "SET_FILES_TO_MAP_HEADER",
			payload: {
				filesToMapHeader,
			},
		});
	};

	const setTableData = (tableData) => {
		dispatch({
			type: "SET_TABLE_DATA",
			payload: {
				tableData,
			},
		});
	};

	const setShowParsingSpinner = (val) => {
		dispatch({
			type: "SET_SHOW_PARSING_SPINNER",
			payload: {
				showParsingSpinner: val,
			},
		});
	};

	const setSupportedColumns = (supportedColumns) => {
		dispatch({
			type: "SET_SUPPORTED_COLUMNS",
			payload: {
				supportedColumns,
			},
		});
	};

	const setShowColMapModal = (val) => {
		dispatch({
			type: "SET_SHOW_COL_MAP_MODAL",
			payload: {
				showColMapModal: val,
			},
		});
	};

	const setShowPackDataCellInput = (val) => {
		dispatch({
			type: "SET_SHOW_PACK_DATA_INPUT",
			payload: {
				showPackDataCellInput: val,
			},
		});
	};

	const setUploadType = (type) => {
		dispatch({
			type: "SET_UPLOAD_TYPE",
			payload: {
				uploadType: type,
			},
		});
	};

	const editFile = (key) => {
		let index = state.tableData.findIndex((data) => data.key === key);
		let filesToMapHeader = [structuredClone(state.tableData[index])];
		setFilesToMapHeader(filesToMapHeader);
		setShowColMapModal(true);
	};

	const value = {
		state: state,
		action: {
			setFileType,
			setFilesToMapHeader,
			setTableData,
			setShowParsingSpinner,
			setShowColMapModal,
			setSupportedColumns,
			editFile,
			setShowPackDataCellInput,
			setUploadType,
		},
	};

	return <FileUploadContext.Provider value={value}>{children}</FileUploadContext.Provider>;
};

export const useFileUpload = () => {
	return useContext(FileUploadContext);
};
