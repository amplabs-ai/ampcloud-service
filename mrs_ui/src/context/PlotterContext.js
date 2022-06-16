import { createContext, useContext, useReducer } from "react";
import plotterReducer, { initialState } from "../reducer/plotterReducer";

const PlotterContext = createContext();

export const PlotterProvider = ({ children }) => {
	const [state, dispatch] = useReducer(plotterReducer, initialState);

	const loadCellData = (selectedCellIds) => {
		dispatch({
			type: "LOAD_CELL_IDS",
			payload: {
				selectedCellIds,
			},
		});
	};

	const clearDashboard = () => {
		dispatch({
			type: "CLEAR_DASHBOARD",
		});
	};

	const refreshSidebar = () => {
		dispatch({
			type: "REFRESH_SIDEBAR",
		});
	};

	const setCheckedCellIds = (checkedCellIds) => {
		dispatch({
			type: "SET_CHECKED_CELL_IDS",
			payload: { checkedCellIds },
		});
	};

	const value = {
		state,
		action: {
			loadCellData,
			clearDashboard,
			refreshSidebar,
			setCheckedCellIds,
		},
	};
	return <PlotterContext.Provider value={value}>{children}</PlotterContext.Provider>;
};

export const usePlotter = () => {
	return useContext(PlotterContext);
};
