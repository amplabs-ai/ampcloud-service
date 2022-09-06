import { createContext, useContext, useReducer, useRef } from "react";
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
			type: "SET_VALID_FILES_PARSED_DATA",
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

	const setColMapData = (colMapData) => {
		dispatch({
			type: "SET_COL_MAP_DATA",
			payload: {
				colMapData,
			},
		});
	};

	const setFilesFromDropFileInput = (files) => {
		dispatch({
			type: "SET_FILES_FROM_DROP_FILE_INPUT",
			payload: {
				files,
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

	const value = {
		state: state,
		action: {
			setFileType,
			setFilesToMapHeader,
			setTableData,
			setColMapData,
			setFilesFromDropFileInput,
			setShowParsingSpinner,
		},
	};
	return <FileUploadContext.Provider value={value}>{children}</FileUploadContext.Provider>;
};

export const useFileUpload = () => {
	return useContext(FileUploadContext);
};
