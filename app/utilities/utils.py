from decimal import Decimal
import logging
import numpy as np
from pandas import DataFrame, to_numeric, unique
from app.archive_constants import LABEL
from app.utilities.file_status import _get_from_simple_db, _set_status
import warnings
warnings.filterwarnings('ignore')

status = {}


def default(obj):
    if isinstance(obj, Decimal):
        return str(obj)
    raise TypeError("Object of type '%s' is not JSON serializable" % type(obj).__name__)




def sort_timeseries(df_tmerge):
    """
    Sort cycle timeseries data
    :param df_tmerge: dataframe returned after reading cycle timeseries data
    :return: sorted dataframe
    """
    # Arrange the data by date time first, then by test time
    # Rebuild Cycle Index and test time to increment from file to file
    # This method does not depend on data from a specific testers
    if not df_tmerge.empty:
        df_t = df_tmerge.sort_values(
            by=[LABEL.DATE_TIME.value, LABEL.TEST_TIME.value])
        df_t = df_t.reset_index(drop=True)
        cycles = df_t[[
            LABEL.CYCLE_INDEX_FILE.value, LABEL.CYCLE_INDEX.value,
            LABEL.FILENAME.value, LABEL.TEST_TIME.value
        ]].to_numpy()
        max_cycle = 1
        past_index = 1
        max_time = 0
        last_file = ""
        delta_t = 0
        start = 0
        for x in cycles:
            if start == 0:
                last_file = x[2]
                start += 1
            if x[2] != last_file:
                delta_t = max_time
                x[3] += delta_t
                last_file = x[2]
            else:
                x[3] += delta_t
                max_time = x[3]
                last_file = x[2]
            if x[0] < max_cycle:
                if past_index == x[0]:
                    past_index = x[0]
                    x[1] = max_cycle
                else:
                    past_index = x[0]
                    x[1] = max_cycle + 1
                    max_cycle = x[1]
            else:
                past_index = x[0]
                max_cycle = x[0]
                x[1] = x[0]
        df_tmp = DataFrame(data=cycles[:, [1]],
                              columns=[LABEL.CYCLE_INDEX.value])
        df_t[LABEL.CYCLE_INDEX.value] = df_tmp[LABEL.CYCLE_INDEX.value]
        df_tmp = DataFrame(data=cycles[:, [3]],
                              columns=[LABEL.TEST_TIME.value])
        df_t[LABEL.TEST_TIME.value] = to_numeric(
            df_tmp[LABEL.TEST_TIME.value])
        df_ts = df_t.sort_values(by=[LABEL.TEST_TIME.value])
        # Remove quantities only needed to tag files
        df_ts.drop(LABEL.FILENAME.value, axis=1, inplace=True)
        df_ts.drop(LABEL.CYCLE_INDEX_FILE.value, axis=1, inplace=True)
    return df_ts


def calc_cycle_stats(df_t, cell_id=None, email=None):
    """
    Calculate cycle states from cycle timeseries data
    :param cell_id: cell_id for
    :param df_t: cycle timeseries data frame.
    :return: tuple of dataframes of calculated stats and timeseries data
    """
    cycle_index_was_present = True
    if LABEL.CYCLE_INDEX.value not in df_t.columns:
        cycle_index_was_present = False
        df_t[LABEL.CYCLE_INDEX.value] = 1
    df_t = df_t.sort_values(by=[LABEL.CYCLE_INDEX.value, LABEL.TEST_TIME.value]).reset_index(drop=True)
    df_t[LABEL.CYCLE_TIME.value] = 0
    no_cycles = int(df_t[LABEL.CYCLE_INDEX.value].max())
    # Initialize the cycle_data time frame
    df_c = init_stats_df(no_cycles)
    step = 50 / len(df_c.index)
    initial_cycle = True
    reset_test_time_by = 0
    percentage = 25
    for c_ind in df_c.index:
        if email and cell_id:
            percentage += step
            _set_status(email,cell_id,percentage=percentage)
        x = c_ind + 1
        df_f = df_t[df_t[LABEL.CYCLE_INDEX.value] == x]
        if not email:
            df_f[LABEL.AH_C.value] = 0
            df_f[LABEL.E_C.value] = 0
            df_f[LABEL.AH_D.value] = 0
            df_f[LABEL.E_D.value] = 0
        if not df_f.empty:
            try:
                if initial_cycle:
                    prev_cycle_end = df_f['test_time'].max()
                if not initial_cycle and prev_cycle_end > df_f['test_time'].min():
                    reset_test_time_by = reset_test_time_by + prev_cycle_end
                    prev_cycle_end = df_f['test_time'].max()
                initial_cycle = False
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_INDEX.value)] = x
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MAX_V.value)] = df_f.loc[
                    df_f[LABEL.V.value].idxmax()].voltage
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MIN_V.value)] = df_f.loc[
                    df_f[LABEL.V.value].idxmin()].voltage
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MAX_I.value)] = df_f.loc[
                    df_f[LABEL.I.value].idxmax()].current
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MIN_I.value)] = df_f.loc[
                    df_f[LABEL.I.value].idxmin()].current
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.TEST_TIME.value)] = df_f.loc[
                    df_f[LABEL.TEST_TIME.value].idxmax()].test_time
                df_f = calc_cycle_quantities(df_f)

                # get df according to charge/discharge/rest
                df_f_c = df_f[df_f[LABEL.I.value] > 0]
                df_f_d = df_f[df_f[LABEL.I.value] < 0]
                df_f_r = df_f[df_f[LABEL.I.value] == 0]

                # set cycle specific values from calculated quantities
                df_t.loc[df_t.cycle_index == x,
                         LABEL.TEST_TIME.value] = df_f[LABEL.TEST_TIME.value] + reset_test_time_by
                df_t.loc[df_t.cycle_index == x,
                         LABEL.CYCLE_TIME.value] = df_f[LABEL.CYCLE_TIME.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.POWER.value] = df_f[LABEL.POWER.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.AH_C.value] = df_f[LABEL.AH_C.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.CYCLE_CUM_AH_C.value] = df_f[LABEL.CYCLE_CUM_AH_C.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.AH_D.value] = df_f[LABEL.AH_D.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.CYCLE_CUM_AH_D.value] = df_f[LABEL.CYCLE_CUM_AH_D.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.E_C.value] = df_f[LABEL.E_C.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.CYCLE_CUM_E_C.value] = df_f[LABEL.CYCLE_CUM_E_C.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.E_D.value] = df_f[LABEL.E_D.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.CYCLE_CUM_E_D.value] = df_f[LABEL.CYCLE_CUM_E_D.value]
                df_t.loc[df_t.cycle_index == x,
                         LABEL.STEP_TYPE.value] = df_f[LABEL.STEP_TYPE.value]

                if LABEL.STEP_INDEX.value in df_f:
                    df_t.loc[df_t.cycle_index == x,
                             LABEL.STEP_TIME.value] = df_f[LABEL.STEP_TIME.value]
                    # df_t.loc[df_t.cycle_index == x,
                    #          LABEL.STEP_DATAPOINT_ORDINAL.value] = df_f[LABEL.STEP_DATAPOINT_ORDINAL.value]
                    df_c.loc[df_c.cycle_index == x,
                             LABEL.STEP_COUNT.value] = len(unique(df_f[LABEL.STEP_INDEX.value]))
                    df_c.loc[df_c.cycle_index == x,
                             LABEL.CHARGE_STEP_COUNT.value] = len(unique(df_f_c[LABEL.STEP_INDEX.value]))
                    df_c.loc[df_c.cycle_index == x,
                             LABEL.DISCHARGE_STEP_COUNT.value] = len(unique(df_f_d[LABEL.STEP_INDEX.value]))
                    df_c.loc[df_c.cycle_index == x,
                             LABEL.REST_STEP_COUNT.value] = len(unique(df_f_r[LABEL.STEP_INDEX.value]))
                    df_t.loc[df_t.cycle_index == x, LABEL.STEP_DATAPOINT_ORDINAL.value] = df_f.groupby([LABEL.STEP_INDEX.value]).cumcount()+1
                df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_START_TS.value)] = df_f[LABEL.DATE_TIME.value].iloc[0]
                df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_END_TS.value)] = df_f[LABEL.DATE_TIME.value].iloc[-1]
                df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_DURATION.value)] = (
                        df_f[LABEL.DATE_TIME.value].iloc[-1] - df_f[LABEL.DATE_TIME.value].iloc[0]).total_seconds()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_AH_C.value)] = df_f_c[LABEL.AH_C.value].max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_AH_D.value)] = df_f_d[LABEL.AH_D.value].max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_E_C.value)] = df_f_c[LABEL.E_C.value].max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_E_D.value)] = df_f_d[LABEL.E_D.value].max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MAX_P.value)] = df_f[LABEL.POWER.value].abs().max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MAX_C_P.value)] = df_f_c[LABEL.POWER.value].abs().max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MAX_D_P.value)] = df_f_d[LABEL.POWER.value].abs().max()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MIN_P.value)] = df_f[LABEL.POWER.value].abs().min()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MIN_C_P.value)] = df_f_c[LABEL.POWER.value].abs().min()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MIN_D_P.value)] = df_f_d[LABEL.POWER.value].abs().min()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_P.value)] = df_f[LABEL.POWER.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_C_P.value)] = df_f_c[LABEL.POWER.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_D_P.value)] = df_f_d[LABEL.POWER.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_V.value)] = df_f[LABEL.V.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_C_V.value)] = df_f_c[LABEL.V.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.CYCLE_MEAN_D_V.value)] = df_f_d[LABEL.V.value].mean()
                df_c.iloc[c_ind,
                          df_c.columns.get_loc(LABEL.DATAPOINT_COUNT.value)] = len(df_f)

                if not df_f_r.empty:
                    df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_MAX_REST_V.value)] = df_f_r.loc[df_f_r[
                        LABEL.V.value].idxmax()].voltage
                    df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_MIN_REST_V.value)] = df_f_r.loc[df_f_r[
                        LABEL.V.value].idxmin()].voltage
                    df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_TOTAL_REST_TIME.value)] = df_f_r[
                        LABEL.TEST_TIME.value].sum()

                if df_c.iloc[c_ind,
                             df_c.columns.get_loc(LABEL.CYCLE_AH_C.value)] == 0:
                    df_c.iloc[c_ind,
                              df_c.columns.get_loc(LABEL.CYCLE_AH_EFF.value)] = 0
                else:
                    df_c.iloc[c_ind,
                              df_c.columns.get_loc(LABEL.CYCLE_AH_EFF.value)] = (df_c.iloc[c_ind, df_c.columns.get_loc(
                        LABEL.CYCLE_AH_D.value)] / df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_AH_C.value)]) * 100

                if df_c.iloc[c_ind,
                             df_c.columns.get_loc(LABEL.CYCLE_E_C.value)] == 0:
                    df_c.iloc[c_ind,
                              df_c.columns.get_loc(LABEL.CYCLE_E_EFF.value)] = 0
                else:
                    df_c.iloc[c_ind, df_c.columns.get_loc(LABEL.CYCLE_E_EFF.value)] = (df_c.iloc[
                                                                                          c_ind, df_c.columns.get_loc(
                                                                                              LABEL.CYCLE_E_D.value)] / \
                                                                                      df_c.iloc[
                                                                                          c_ind, df_c.columns.get_loc(
                                                                                              LABEL.CYCLE_E_C.value)]) * 100
            except Exception as err:
                logging.error(err)

    # set test specific values
    df_cc = df_c[df_c[LABEL.CYCLE_INDEX.value] > 0]
    df_tt = df_t[df_t[LABEL.CYCLE_INDEX.value] > 0]
    df_tt[LABEL.CUM_AH_C.value] = df_tt[LABEL.AH_C.value].cumsum(axis=0)
    df_tt[LABEL.CUM_AH_D.value] = df_tt[LABEL.AH_D.value].cumsum(axis=0)
    df_tt[LABEL.NET_AH.value] = df_tt[LABEL.CUM_AH_C.value] - df_tt[LABEL.CUM_AH_D.value]
    df_tt[LABEL.CUM_E_C.value] = df_tt[LABEL.E_C.value].cumsum(axis=0)
    df_tt[LABEL.CUM_E_D.value] = df_tt[LABEL.E_D.value].cumsum(axis=0)
    df_tt[LABEL.NET_E.value] = df_tt[LABEL.CUM_E_C.value] - df_tt[LABEL.CUM_E_D.value]
    df_tt[LABEL.NET_E.value] = df_tt[LABEL.CUM_E_C.value] - df_tt[LABEL.CUM_E_D.value]
    df_tt[LABEL.TEST_DATAPOINT_ORDINAL.value] = np.arange(1, len(df_tt) + 1)
    df_tt[LABEL.DATAPOINT_DV.value] = df_tt[LABEL.V.value].diff().fillna(0)
    df_tt[LABEL.DATAPOINT_DI.value] = df_tt[LABEL.I.value].diff().fillna(0)
    df_tt[LABEL.DATAPOINT_DTIME.value] = df_tt[LABEL.TEST_TIME.value].diff().fillna(0)
    df_tt[LABEL.DATAPOINT_DQ.value] = df_tt[LABEL.AH_C.value].where(df_tt[LABEL.STEP_TYPE.value] == 'Charge', df_tt[LABEL.AH_D.value]).diff().fillna(0)
    df_tt[LABEL.DV_DT.value] = (df_tt[LABEL.DATAPOINT_DV.value] / df_tt[LABEL.DATAPOINT_DTIME.value]).replace({np.inf: 0})
    df_tt[LABEL.DQ_DV.value] = (df_tt[LABEL.DATAPOINT_DQ.value] / df_tt[LABEL.DATAPOINT_DV.value]).replace({np.inf: 0})
    df_tt[LABEL.TEST_NET_CAPACITY.value] = (
            (df_tt[LABEL.TEST_TIME.value] - df_tt[LABEL.TEST_TIME.value].iloc[0]) * df_tt[LABEL.I.value]).cumsum()
    df_tt[LABEL.TEST_NET_ENERGY.value] = ((df_tt[LABEL.TEST_TIME.value] - df_tt[LABEL.TEST_TIME.value].iloc[0]) * df_tt[
        LABEL.POWER.value]).cumsum()
    df_tt[LABEL.CAPACITY_THROUGHPUT.value] = df_tt[LABEL.TEST_TIME.value].diff().fillna(0) * df_tt[LABEL.I.value].abs()
    df_tt[LABEL.ENERGY_THROUGHPUT.value] = df_tt[LABEL.TEST_TIME.value].diff().fillna(0) * df_tt[LABEL.POWER.value].abs()

    df_tt_c = df_tt[df_tt[LABEL.STEP_TYPE.value] == "Charge"]
    df_tt_d = df_tt[df_tt[LABEL.STEP_TYPE.value] == "Discharge"]

    if not df_tt_c.empty:
        df_cc[LABEL.DV_START_C.value] = df_tt_c[LABEL.DATAPOINT_DV.value].iloc[
            0]
        df_cc[LABEL.DV_END_C.value] = df_tt_c[LABEL.DATAPOINT_DV.value].iloc[-1]
        df_cc[LABEL.DT_START_C.value] = \
            df_tt_c[LABEL.DATAPOINT_DTIME.value].iloc[0]
        df_cc[LABEL.DT_END_C.value] = df_tt_c[LABEL.DATAPOINT_DTIME.value].iloc[
            -1]
        df_cc[LABEL.CYCLE_R_START_C.value] = df_tt_c[LABEL.I.value].iloc[0] * df_tt_c[LABEL.V.value].iloc[0]
        df_cc[LABEL.CYCLE_R_END_C.value] = df_tt_c[LABEL.I.value].iloc[-1] * df_tt_c[LABEL.V.value].iloc[-1]

    if not df_tt_d.empty:
        df_cc[LABEL.DV_START_D.value] = \
            df_tt_d[LABEL.DATAPOINT_DV.value].iloc[0]
        df_cc[LABEL.DV_END_D.value] = df_tt_d[LABEL.DATAPOINT_DV.value].iloc[
            -1]
        df_cc[LABEL.DT_START_D.value] = \
            df_tt_d[LABEL.DATAPOINT_DTIME.value].iloc[0]
        df_cc[LABEL.DT_END_D.value] = \
            df_tt_d[LABEL.DATAPOINT_DTIME.value].iloc[-1]
        df_cc[LABEL.CYCLE_R_START_D.value] = df_tt_d[LABEL.I.value].iloc[0] * df_tt_d[LABEL.V.value].iloc[0]
        df_cc[LABEL.CYCLE_R_END_D.value] = df_tt_d[LABEL.I.value].iloc[-1] * df_tt_d[LABEL.V.value].iloc[-1]

    # status[f"{email}|{cell_id}"]['progress']['percentage'] = 65
    _set_status(email,cell_id,percentage=65)
    calc_energy_density(df_cc,df_tt)

    if not cycle_index_was_present:
        return None, df_tt
    return df_cc, df_tt

def calc_energy_density(df_cc,df_tt,active_mass = None):
    df_cc[LABEL.CYCLE_ED_C.value] = None
    df_cc[LABEL.CYCLE_ED_D.value] = None
    cycle_indices = df_tt[LABEL.CYCLE_INDEX.value].unique()
    for cycle_index in cycle_indices:
        charge_df = df_tt[(df_tt[LABEL.CYCLE_INDEX.value] == cycle_index) & (df_tt[LABEL.I.value] > 0)]
        discharge_df = df_tt[(df_tt[LABEL.CYCLE_INDEX.value] == cycle_index) & (df_tt[LABEL.I.value] < 0)]
        if active_mass:
            active_mass = float(active_mass)
            charge_df[LABEL.AH_C.value] = (charge_df[LABEL.AH_C.value]/active_mass) * 1000000
            discharge_df[LABEL.AH_D.value] = (discharge_df[LABEL.AH_D.value]/active_mass) * 1000000
        charge_energy_density = np.trapz(charge_df[LABEL.V.value].to_numpy(), charge_df[LABEL.AH_C.value].to_numpy(), dx = 0.01) 
        df_cc.loc[df_cc.cycle_index == cycle_index,
                        LABEL.CYCLE_ED_C.value] = charge_energy_density
        discharge_energy_density = np.trapz(discharge_df[LABEL.V.value].to_numpy(), discharge_df[LABEL.AH_D.value].to_numpy(), dx = 0.01) 
        df_cc.loc[df_cc.cycle_index == cycle_index,
                        LABEL.CYCLE_ED_D.value] = discharge_energy_density


def calc_abuse_stats(df_t, df_test_md, cell_id=None, email=None):
    if "axial_d" in (list(df_t.columns)):
        df_t[LABEL.NORM_D.value] = df_t[LABEL.AXIAL_D.value] - df_t[LABEL.AXIAL_D.value][0]
        _set_status(email,cell_id,percentage=35)
        df_t[LABEL.STRAIN.value] = df_t[LABEL.NORM_D.value] / df_test_md[LABEL.THICKNESS.value]
        _set_status(email,cell_id,percentage=40)
    dt = df_t[LABEL.TEST_TIME.value].diff()
    _set_status(email,cell_id,percentage=45)
    df_t[LABEL.HR_01.value] = df_t[LABEL.temp_1.value].diff() / dt
    df_t[LABEL.HR_02.value] = df_t[LABEL.temp_2.value].diff() / dt
    _set_status(email,cell_id,percentage=50)
    df_t[LABEL.HR_03.value] = df_t[LABEL.temp_3.value].diff() / dt
    df_t[LABEL.HR_04.value] = df_t[LABEL.temp_4.value].diff() / dt
    _set_status(email,cell_id,percentage=55)
    df_t[LABEL.HR_05.value] = df_t[LABEL.temp_5.value].diff() / dt
    df_t[LABEL.HR_06.value] = df_t[LABEL.temp_6.value].diff() / dt
    _set_status(email,cell_id,percentage=60)
    return df_t


# unpack the dataframe and calculate quantities used in statistics
def calc_cycle_quantities(df):
    """
    Helper function to calculat quantities used in cycle statistics
    """
    step_index_present = False
    step_time_present = False
    calc_charge_capacity = False
    calc_discharge_capacity = False
    calc_charge_energy = False
    calc_discharge_energy = False

    if (df[LABEL.AH_C.value] == 0).all():
        calc_charge_capacity = True
    if (df[LABEL.AH_D.value] == 0).all():
        calc_discharge_capacity = True
    if (df[LABEL.E_C.value] == 0).all():
        calc_charge_energy = True
    if (df[LABEL.E_D.value] == 0).all():
        calc_discharge_energy = True

    df[LABEL.STEP_TYPE.value] = "Charge"
    tmp_arr = df[[
        LABEL.TEST_TIME.value, LABEL.I.value, LABEL.V.value, LABEL.AH_C.value,
        LABEL.E_C.value, LABEL.AH_D.value, LABEL.E_D.value,
        LABEL.CYCLE_TIME.value, LABEL.STEP_TYPE.value
    ]].to_numpy()

    if LABEL.STEP_INDEX.value in df:
        tmp_arr = np.c_[tmp_arr, df[[LABEL.STEP_INDEX.value]].to_numpy()]
        step_index_present = True
        if LABEL.STEP_TIME.value in df and not (df[LABEL.STEP_TIME.value].iloc[0]):
            tmp_arr = np.c_[tmp_arr, df[[LABEL.STEP_TIME.value]].to_numpy()]
            step_time_present = True
        else:
            tmp_arr = np.pad(tmp_arr, ((0, 0), (0, 1)), mode='constant', constant_values=0)
        # tmp_arr = np.pad(tmp_arr, ((0, 0), (0, 1)), mode='constant', constant_values=0)

    step_start = -1
    start = 0
    last_time = 0
    last_i_c = 0
    last_v_c = 0
    last_i_d = 0
    last_v_d = 0
    last_ah_c = 0
    last_e_c = 0
    last_ah_d = 0
    last_e_d = 0
    initial_time = 0
    # step_ordinal = 1

    for x in tmp_arr:
        if x[1] < 0:
            x[8] = "Discharge"
        elif x[1] > 0:
            x[8] = "Charge"
        else:
            x[8] = "Rest"
        if step_index_present:
            if not step_time_present:
                if step_start == -1:
                    initial_step_time = x[0]
                    x[10] = 0
                    step_start = 0
                    # x[11] = step_ordinal
                    # step_ordinal = 1
                else:
                    if last_step != x[9]:
                        initial_step_time = x[0]
                        x[10] = 0
                        # x[11] = 1
                        # step_ordinal = 1
                    else:
                        x[10] = x[0] - initial_step_time
                        # x[11] = step_ordinal + 1
                        # step_ordinal = x[11]
                last_step = x[9]

        if start == 0:
            start += 1
            initial_time = x[0]
        else:
            if x[1] >= 0:
                if calc_charge_capacity:
                    x[3] = (x[0] - last_time) * (x[1] + last_i_c) * 0.5 + last_ah_c
                if calc_charge_energy:
                    x[4] = (x[0] - last_time) * (x[1] + last_i_c) * 0.5 * (
                            x[2] + last_v_c) * 0.5 + last_e_c
                last_i_c = x[1]
                last_v_c = x[2]
                last_ah_c = x[3]
                last_e_c = x[4]
            if x[1] <= 0:
                if calc_discharge_capacity:
                    x[5] = (x[0] - last_time) * (x[1] + last_i_d) * 0.5 + last_ah_d
                if calc_discharge_energy:
                    x[6] = (x[0] - last_time) * (x[1] + last_i_d) * 0.5 * (
                            x[2] + last_v_d) * 0.5 + last_e_d
                last_i_d = x[1]
                last_v_d = x[2]
                last_ah_d = x[5]
                last_e_d = x[6]

        x[7] = x[0] - initial_time
        last_time = x[0]

    if calc_charge_capacity:
        df_tmp = DataFrame(data=tmp_arr[:, [3]], columns=[LABEL.AH_C.value])
        df_tmp.index += df.index[0]
        df[LABEL.AH_C.value] = df_tmp[LABEL.AH_C.value] / 3600.0

    if calc_charge_energy:
        df_tmp = DataFrame(data=tmp_arr[:, [4]], columns=[LABEL.E_C.value])
        df_tmp.index += df.index[0]
        df[LABEL.E_C.value] = df_tmp[LABEL.E_C.value] / 3600.0

    if calc_discharge_capacity:
        df_tmp = DataFrame(data=tmp_arr[:, [5]], columns=[LABEL.AH_D.value])
        df_tmp.index += df.index[0]
        df[LABEL.AH_D.value] = -df_tmp[LABEL.AH_D.value] / 3600.0

    if calc_discharge_energy:
        df_tmp = DataFrame(data=tmp_arr[:, [6]], columns=[LABEL.E_D.value])
        df_tmp.index += df.index[0]
        df[LABEL.E_D.value] = -df_tmp[LABEL.E_D.value] / 3600.0

    if step_index_present:
        df_tmp = DataFrame(data=tmp_arr[:, [10]], columns=[LABEL.STEP_TIME.value])
        df_tmp.index += df.index[0]
        df[LABEL.STEP_TIME.value] = df_tmp[LABEL.STEP_TIME.value]
        # df_tmp = DataFrame(data=tmp_arr[:, [11]], columns=[LABEL.STEP_DATAPOINT_ORDINAL.value])
        # df_tmp.index += df.index[0]

    df_tmp = DataFrame(data=tmp_arr[:, [8]], columns=[LABEL.STEP_TYPE.value])
    df_tmp.index += df.index[0]
    df[LABEL.STEP_TYPE.value] = df_tmp[LABEL.STEP_TYPE.value]
    df_tmp = DataFrame(data=tmp_arr[:, [7]],
                          columns=[LABEL.CYCLE_TIME.value])
    df_tmp.index += df.index[0]
    df[LABEL.CYCLE_TIME.value] = df_tmp[LABEL.CYCLE_TIME.value]
    df[LABEL.CYCLE_CUM_AH_C.value] = df[LABEL.AH_C.value].cumsum(axis=0)
    df[LABEL.CYCLE_CUM_AH_D.value] = df[LABEL.AH_D.value].cumsum(axis=0)
    df[LABEL.CYCLE_CUM_E_C.value] = df[LABEL.E_C.value].cumsum(axis=0)
    df[LABEL.CYCLE_CUM_E_D.value] = df[LABEL.E_D.value].cumsum(axis=0)
    df[LABEL.POWER.value] = df[LABEL.I.value] * df[LABEL.V.value]
    return df


def split_cycle_metadata(df_c_md):
    df_cell_md = extract_cell_metdata(df_c_md)
    # Build test metadata
    df_test_md = DataFrame()
    df_test_md[LABEL.CELL_ID.value] = [df_c_md[LABEL.CELL_ID.value]]
    df_test_md[LABEL.CRATE_C.value] = [df_c_md[LABEL.CRATE_C.value]]
    df_test_md[LABEL.CRATE_D.value] = [df_c_md[LABEL.CRATE_D.value]]
    df_test_md[LABEL.SOC_MAX.value] = [df_c_md[LABEL.SOC_MAX.value]]
    df_test_md[LABEL.SOC_MIN.value] = [df_c_md[LABEL.SOC_MIN.value]]
    df_test_md[LABEL.TEMP.value] = [df_c_md[LABEL.TEMP.value]]
    return df_cell_md, df_test_md


def split_abuse_metadata(df_c_md):
    df_cell_md = extract_cell_metdata(df_c_md)
    # Build test metadata
    df_test_md = DataFrame()
    df_test_md[LABEL.CELL_ID.value] = [df_c_md[LABEL.CELL_ID.value]]
    df_test_md[LABEL.THICKNESS.value] = [df_c_md[LABEL.THICKNESS.value]]
    df_test_md[LABEL.V_INIT.value] = [df_c_md[LABEL.V_INIT.value]]
    df_test_md[LABEL.INDENTOR.value] = [df_c_md[LABEL.INDENTOR.value]]
    df_test_md[LABEL.NAIL_SPEED.value] = [df_c_md[LABEL.NAIL_SPEED.value]]
    df_test_md[LABEL.TEMP.value] = [df_c_md[LABEL.TEMP.value]]
    return df_cell_md, df_test_md


def extract_cell_metdata(df_c_md):
    """ Build cell metadata """
    df_cell_md = DataFrame()
    df_cell_md[LABEL.CELL_ID.value] = [df_c_md[LABEL.CELL_ID.value]]
    df_cell_md[LABEL.ANODE.value] = [df_c_md[LABEL.ANODE.value]]
    df_cell_md[LABEL.CATHODE.value] = [df_c_md[LABEL.CATHODE.value]]
    df_cell_md[LABEL.SOURCE.value] = [df_c_md[LABEL.SOURCE.value]]
    df_cell_md[LABEL.AH.value] = [df_c_md[LABEL.AH.value]]
    df_cell_md[LABEL.FORM_FACTOR.value] = [df_c_md[LABEL.FORM_FACTOR.value]]
    df_cell_md[LABEL.TEST.value] = [df_c_md[LABEL.TEST.value]]
    # df_cell_md[LABEL.MAPPING.value] = [df_c_md[LABEL.MAPPING.value]]
    df_cell_md[LABEL.TESTER.value] = [df_c_md[LABEL.TESTER.value]]
    return df_cell_md


def init_stats_df(no_cycles):
    a = [0 for _ in range(no_cycles+1)]  # using loops
    df_c = DataFrame(data=a, columns=[LABEL.CYCLE_INDEX.value])
    df_c[LABEL.CYCLE_INDEX.value] = 0
    df_c[LABEL.CYCLE_MAX_V.value] = 0
    df_c[LABEL.CYCLE_MAX_I.value] = 0
    df_c[LABEL.CYCLE_MIN_V.value] = 0
    df_c[LABEL.CYCLE_MIN_I.value] = 0
    df_c[LABEL.CYCLE_AH_C.value] = 0
    df_c[LABEL.CYCLE_AH_D.value] = 0
    df_c[LABEL.CYCLE_E_C.value] = 0
    df_c[LABEL.CYCLE_E_D.value] = 0
    df_c[LABEL.CYCLE_MEAN_C_V.value] = 0
    df_c[LABEL.CYCLE_MEAN_D_V.value] = 0
    df_c[LABEL.TEST_TIME.value] = 0
    df_c[LABEL.CYCLE_AH_EFF.value] = 0
    df_c[LABEL.CYCLE_E_EFF.value] = 0
    df_c[LABEL.CYCLE_START_TS.value] = 0
    df_c[LABEL.CYCLE_END_TS.value] = 0
    df_c[LABEL.CYCLE_DURATION.value] = 0
    df_c[LABEL.CYCLE_MAX_P.value] = 0
    df_c[LABEL.CYCLE_MAX_C_P.value] = 0
    df_c[LABEL.CYCLE_MAX_D_P.value] = 0
    df_c[LABEL.CYCLE_MIN_P.value] = 0
    df_c[LABEL.CYCLE_MIN_C_P.value] = 0
    df_c[LABEL.CYCLE_MIN_D_P.value] = 0
    df_c[LABEL.CYCLE_MEAN_P.value] = 0
    df_c[LABEL.CYCLE_MEAN_C_P.value] = 0
    df_c[LABEL.CYCLE_MEAN_D_P.value] = 0
    df_c[LABEL.CYCLE_MEAN_V.value] = 0
    df_c[LABEL.CYCLE_MEAN_C_V.value] = 0
    df_c[LABEL.CYCLE_MEAN_D_V.value] = 0
    df_c[LABEL.DATAPOINT_COUNT.value] = 0
    df_c[LABEL.CYCLE_MAX_REST_V.value] = 0
    df_c[LABEL.CYCLE_MIN_REST_V.value] = 0
    df_c[LABEL.CYCLE_TOTAL_REST_TIME.value] = 0
    return df_c


def __generate_filter_string(filters, rf = None):
    filter_string = ""
    reduction_factor = 10
    for filter in filters:
        if filter['column'] == 'reduction_factor':
            reduction_factor = int(filter['filterValue'])
            continue
        if filter['operation'] == '%':
            filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
        else:
            filter_str = f"{filter['column']} {filter['operation']}'{filter['filterValue']}'"
        filter_string = filter_string+f"and {filter_str}"
    if rf:
        return filter_string, reduction_factor
    return filter_string