const dashboardReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case "LOAD_CELL_IDS":
			return {
				...state,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: false,
				shallShowChart: true,
				shallShowMeta: false,
			};
		case "EDIT_CELL_IDS":
			return {
				...state,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: true,
				shallShowChart: false,
				shallShowMeta: false,
			};
		case "PLOT_CELL_IDS":
			return {
				...state,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: false,
				shallShowChart: false,
				shallShowMeta: true,
			};
		case "CLEAR_DASHBOARD":
			return {
				...state,
				selectedCellIds: [],
				shallShowEdit: false,
				shallShowChart: false,
				shallShowMeta: false,
			};
		case "SET_DASHBOARD_ID":
			return {
				...state,
				dashboardId: payload.id,
			};
		case "SET_DASHBOARD_TYPE":
			return {
				...state,
				dashboardType: payload.type,
				shallShowChart: true,
			};
		case "SET_DASHBOARD_ERROR":
			return {
				...state,
				dashboardError: payload.error,
			};
		case "REFRESH_SIDEBAR":
			return {
				...state,
				refreshSidebar: !state.refreshSidebar,
				selectedCellIds: payload.selectedCellIdsAfterRefresh,
				shallShowChart: payload.selectedCellIdsAfterRefresh.length !== 0,
			};
		case "SET_SHARE_DISABLED":
			return {
				...state,
				shareDisabled: payload.shareDisabled,
			};
		case "SET_APPLIED_STEP":
			return {
				...state,
				appliedStep: payload.appliedStep,
			};
		case "SET_CHECKED_CELL_IDS":
			return {
				...state,
				checkedCellIds: payload.checkedCellIds,
			};
		case "SHOW_SUBSCRIPTION_MODAL":
			return {
				...state,
				shallShowSubsModal: payload.shallShowSubsModal,
			};
		default:
			throw new Error(`No case for type ${type} found in dashboardReducer.`);
	}
};

export const initialState = {
	selectedCellIds: [],
	shallShowEdit: false,
	shallShowChart: false,
	shallShowMeta: false,
	dashboardId: null,
	dashboardType: "private",
	dashboardError: "",
	refreshSidebar: false,
	appliedStep: localStorage.getItem("step") || 500,
	shareDisabled: true,
	checkedCellIds: [],
	shallShowSubsModal: false,
};

export default dashboardReducer;
