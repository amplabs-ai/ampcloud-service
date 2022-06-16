const PlotterReducer = (state, action) => {
	const { type, payload } = action;
	switch (type) {
		case "LOAD_CELL_IDS":
			return {
				...state,
				selectedCellIds: payload.selectedCellIds,
			};
		case "SET_CHECKED_CELL_IDS":
			return {
				...state,
				checkedCellIds: payload.checkedCellIds,
			};
		case "CLEAR_DASHBOARD":
			return {
				...state,
				selectedCellIds: [],
			};
		case "REFRESH_SIDEBAR":
			return {
				...state,
				refreshSidebar: !state.refreshSidebar,
			};
		default:
			throw new Error(`No case for type ${type} found in PlotterReducer.`);
	}
};

export const initialState = {
	selectedCellIds: [],
	refreshSidebar: false,
	checkedCellIds: [],
};

export default PlotterReducer;
