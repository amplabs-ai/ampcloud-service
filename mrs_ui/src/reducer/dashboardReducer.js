const _cleanCellIds = (cellIds) => {
	let x = [];
	cellIds.map((k) => {
		x.push({ cell_id: k });
	});
	return x;
};

const setCheckedCellIds = (selectedCellIds) => {
	let data;
	data = _cleanCellIds(selectedCellIds);
	let cellIdData = [];
	if (data.length) {
		data.forEach((cellId, i) => {
			cellIdData.push({
				key: i,
				cell_id: cellId.cell_id.split("_").slice(2).join("_"),
				index: cellId.cell_id.split("_", 3)[0],
			});
		});
	return cellIdData
}
}

const dashboardReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case "LOAD_CELL_IDS_SECOND_DASHBOARD":	
			return {
				...state,
				shallShowFilterBar: payload.selectedCellIds.length !== 0,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: false,
				shallShowChart: false,
				shallShowSecondChart: true,
				shallShowMeta: false,
				checkedCellIds: setCheckedCellIds(payload.selectedCellIds)
			};
		case "LOAD_CELL_IDS":
			return {
				...state,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: false,
				shallShowChart: true,
				shallShowSecondChart: false,
				shallShowMeta: false,
			};
		case "EDIT_CELL_IDS":
			return {
				...state,
				refreshFilterBar: !state.refreshFilterBar,
				shallShowFilterBar: payload.selectedCellIds.length !== 0,
				selectedCellIds: payload.selectedCellIds,
				shallShowEdit: true,
				shallShowChart: false,
				shallShowSecondChart: false,
				shallShowMeta: false,
				checkedCellIds: setCheckedCellIds(payload.selectedCellIds)
			};
		case "PLOT_CELL_IDS":
			return {
				...state,
				refreshFilterBar: !state.refreshFilterBar,
				shallShowFilterBar: payload.selectedCellIds.length !== 0,
				selectedCellIds: payload.selectedCellIds,
				checkedCellIds: setCheckedCellIds(payload.selectedCellIds),
				shallShowEdit: false,
				shallShowChart: false,
				shallShowSecondChart: false,
				shallShowMeta: true,
				disableSelection: false
			};
		case "CLEAR_DASHBOARD":
			return {
				...state,
				shallShowFilterBar: false,
				selectedCellIds: [],
				shallShowEdit: false,
				shallShowChart: false,
				shallShowMeta: false,
				shallShowSecondChart: false,
				checkedCellIds: []
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
				shallShowFilterBar: payload.selectedCellIdsAfterRefresh.length !== 0,
				refreshSidebar: !state.refreshSidebar,
				selectedCellIds: payload.selectedCellIdsAfterRefresh,
				checkedCellIds: setCheckedCellIds(payload.selectedCellIdsAfterRefresh),
				refreshFilterBar: !state.refreshFilterBar,
				shallShowEdit: payload.selectedCellIdsAfterRefresh.length === 0 ? false: state.shallShowEdit,
				shallShowMeta: payload.selectedCellIdsAfterRefresh.length === 0 ? false: state.shallShowMeta,
				shallShowSecondChart: payload.selectedCellIdsAfterRefresh.length === 0 ? false: state.shallShowSecondChart,
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
		case "SET_DISABLE_SELECTION":
			return {
				...state,
				disableSelection: payload.disableSelection
			}
		default:
			throw new Error(`No case for type ${type} found in dashboardReducer.`);
	}
};

export const initialState = {
	selectedCellIds: [],
	shallShowEdit: false,
	shallShowChart: false,
	shallShowSecondChart: false,
	shallShowMeta: false,
	dashboardId: null,
	dashboardType: "private",
	dashboardError: "",
	refreshSidebar: false,
	appliedStep: localStorage.getItem("step") || 500,
	shareDisabled: true,
	checkedCellIds: [],
	shallShowSubsModal: false,
	shallShowFilterBar: false,
	disableSelection: true,
	refreshFilterBar: true
};

export default dashboardReducer;
