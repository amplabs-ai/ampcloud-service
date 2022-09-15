import { createContext, useContext, useReducer, useRef } from "react";
import dashboardReducer, { initialState } from "../reducer/dashboardReducer";
import { useUserPlan } from "./UserPlanContext";

const DashboardContext = createContext();

export const DashboardProvider = ({ children }) => {
	const [state, dispatch] = useReducer(dashboardReducer, initialState);
	const userPlan = useUserPlan();

	const loadCellData = (selectedCellIds, dashboardType) => {
		if (dashboardType === "type-2") {
			let cellIdsChanged = !(
				state.selectedCellIds.every((v) => selectedCellIds.includes(v)) &&
				state.selectedCellIds.length === selectedCellIds.length
			);
			if (cellIdsChanged || !state.shallShowSecondChart) {
				dispatch({
					type: "LOAD_CELL_IDS_SECOND_DASHBOARD",
					payload: {
						selectedCellIds,
					},
				});
			}
		} else {
			dispatch({
				type: "LOAD_CELL_IDS",
				payload: {
					selectedCellIds,
				},
			});
		}
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

	const refreshSidebar = (cellIdDeleted, cellIdUpdated, cellIdVisibilityUpdated, dashboardType) => {
		let selectedCellIdsAfterRefresh = state.selectedCellIds;
		if (cellIdDeleted) {
			selectedCellIdsAfterRefresh = selectedCellIdsAfterRefresh.filter((cell) => !cell.includes(cellIdDeleted));
		}

		if (cellIdVisibilityUpdated) {
			selectedCellIdsAfterRefresh = selectedCellIdsAfterRefresh.map((element) =>
				element.split("_")[0] === cellIdVisibilityUpdated.index
					? `${cellIdVisibilityUpdated.index}_${cellIdVisibilityUpdated.visibility}_${cellIdVisibilityUpdated.cell_id}`
					: element
			);
		}
		if (cellIdUpdated) {
			selectedCellIdsAfterRefresh = cellIdUpdated.map((element) => {
				let cell = selectedCellIdsAfterRefresh.find((item) => {
					return item.split("_")[0] == element.index;
				});
				return `${element.index}_${cell.split("_")[1]}_${element.cell_id}`;
			});
		}
		dispatch({
			type: "REFRESH_SIDEBAR",
			payload: { selectedCellIdsAfterRefresh, dashboardType },
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

	const setDisableSelection = (value) => {
		dispatch({
			type: "SET_DISABLE_SELECTION",
			payload: {
				disableSelection: value,
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
			setDisableSelection,
		},
		dashboardRef: useRef(null),
	};
	return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
};

export const useDashboard = () => {
	return useContext(DashboardContext);
};
