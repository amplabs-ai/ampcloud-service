import { createContext, useContext, useReducer, useRef } from "react";
import dashboardReducer, { initialState } from "../reducer/dashboardReducer";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
	const [state, dispatch] = useReducer(dashboardReducer, initialState);

	const loadCellData = (selectedCellIds) => {
		dispatch({
			type: "LOAD_CELL_IDS",
			payload: {
				selectedCellIds,
			},
		});
	};
	const plotCellData = (selectedCellIds) => {
		dispatch({
			type: "PLOT_CELL_IDS",
			payload: {
				selectedCellIds,
			},
		});
	};

	const editCellData = (selectedCellIds) => {
		dispatch({
			type: "EDIT_CELL_IDS",
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

	const setDashboardId = (id) => {
		dispatch({
			type: "SET_DASHBOARD_ID",
			payload: { id },
		});
	};

	const setDashboardType = (type) => {
		dispatch({
			type: "SET_DASHBOARD_TYPE",
			payload: { type },
		});
	};

	const setDashboardError = (error) => {
		dispatch({
			type: "SET_DASHBOARD_ERROR",
			payload: { error },
		});
	};

	const refreshSidebar = (cellIdDeleted) => {
		let selectedCellIdsAfterRefresh = state.selectedCellIds;
		if (cellIdDeleted) {
			selectedCellIdsAfterRefresh = selectedCellIdsAfterRefresh.findIndex((cell) => !cell.includes(cellIdDeleted));
		}
		dispatch({
			type: "REFRESH_SIDEBAR",
			payload: { selectedCellIdsAfterRefresh },
		});
	};

	const setShareDisabled = (shareDisabled) => {
		dispatch({
			type: "SET_SHARE_DISABLED",
			payload: { shareDisabled },
		});
	};

	const setAppliedStep = (appliedStep) => {
		dispatch({
			type: "SET_APPLIED_STEP",
			payload: { appliedStep },
		});
	};
	const setCheckedCellIds = (checkedCellIds) => {
		dispatch({
			type: "SET_CHECKED_CELL_IDS",
			payload: { checkedCellIds },
		});
	};

	const value = {
		state: state,
		action: {
			loadCellData,
			plotCellData,
			editCellData,
			clearDashboard,
			setDashboardId,
			setDashboardType,
			setDashboardError,
			refreshSidebar,
			setShareDisabled,
			setAppliedStep,
			setCheckedCellIds,
		},
		dashboardRef: useRef(null),
	};
	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
	return useContext(DashboardContext);
};
