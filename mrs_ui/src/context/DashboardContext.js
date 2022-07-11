import { createContext, useContext, useReducer, useRef } from "react";
import dashboardReducer, { initialState } from "../reducer/dashboardReducer";
import { useUserPlan } from "./UserPlanContext";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
	const [state, dispatch] = useReducer(dashboardReducer, initialState);
	const userPlan = useUserPlan();

	const loadCellData = (selectedCellIds) => {
		dispatch({
			type: "LOAD_CELL_IDS",
			payload: {
				selectedCellIds,
			},
		});
	};

	const checkUserPlanOnPlot = (selectedCellIds) => {
		if (userPlan === "BETA") {
			for (let i = 0; i < selectedCellIds.length; i++) {
				if (selectedCellIds[i].includes("private_")) {
					return false;
				}
			}
		}
		return true;
	};

	const plotCellData = (selectedCellIds) => {
		if (checkUserPlanOnPlot(selectedCellIds)) {
			dispatch({
				type: "PLOT_CELL_IDS",
				payload: {
					selectedCellIds,
				},
			});
		} else {
			setSubsPromptModalVisible(true);
		}
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
			selectedCellIdsAfterRefresh = selectedCellIdsAfterRefresh.filter((cell) => !cell.includes(cellIdDeleted));
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

	const setSubsPromptModalVisible = (value) => {
		dispatch({
			type: "SHOW_SUBSCRIPTION_MODAL",
			payload: {
				shallShowSubsModal: value,
			},
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
			setSubsPromptModalVisible,
		},
		dashboardRef: useRef(null),
	};
	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
	return useContext(DashboardContext);
};
