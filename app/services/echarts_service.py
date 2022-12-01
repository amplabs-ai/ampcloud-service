import numpy as np
import pandas as pd
from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator
import logging
from sqlalchemy.exc import DataError
from skimage.measure import block_reduce
from app.utilities.utils import __generate_filter_string
import traceback
import multiprocessing


def get_cycle_quantities_by_step_service(cell_id, step, email, mod_step, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_CQBS_query(cell_id, step, email, mod_step)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_galvanostatic_plot_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_GalvanoPlot_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        traceback.print_exc()
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_energy_and_capacity_decay_service(cell_id, email, mod_step, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_ECAD_query(cell_id, email, mod_step)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_efficiency_service(cell_id, email, mod_step, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_Eff_query(cell_id, email, mod_step)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_coulombic_efficiency_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:    
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_AhEff_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)
        for key, value in series.items():
            records.append({"id": key, "cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_compare_by_cycle_time_service(cell_id, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_CCVC_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series_2']}||{row['cell_id']}"):
                series[f"{row['series_2']}||{row['cell_id']}"] = []
            series[f"{row['series_2']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()

def charge_computation(series_list,result_df,reduction_factor):
    rec = []
    for series in series_list:
        try:
            charge_Q = result_df[(result_df['series'] == series) & (result_df['current'] >0)]['charge_capacity'].to_numpy()
            charge_voltage = result_df[(result_df['series'] == series) & (result_df['current'] >0)]['voltage'].to_numpy()
            charge_Q_reduced = block_reduce(charge_Q, block_size=(reduction_factor,), func=np.mean, cval=charge_Q[-1])
            charge_voltage_reduced = block_reduce(charge_voltage, block_size=(reduction_factor,), func=np.mean, cval=charge_voltage[-1])
            dQdV_charge = np.diff(charge_Q_reduced) / np.diff(charge_voltage_reduced)
            df_charge = pd.DataFrame()
            df_charge['dq_dv'] = pd.Series(dQdV_charge)
            df_charge['voltage'] = pd.Series(charge_voltage_reduced[:-1])
            df_charge['series'] = series+ " c"
            df_charge = df_charge.sort_values(by = ['voltage'])
            df_charge = df_charge.replace([np.inf, -np.inf], np.NaN)
            rec.append({"id": f"{series}, charge", "cell_id": series.split(' ')[0], "source": df_charge.to_dict('records')})
        except Exception as e:
            print(e)
            pass
    return rec


def discharge_computation(series_list,result_df,reduction_factor):
    rec = []
    for series in series_list:
        try:
            discharge_Q = result_df[(result_df['series'] == series) & (result_df['current'] <0)]['discharge_capacity'].to_numpy()
            discharge_voltage = result_df[(result_df['series'] == series) & (result_df['current'] <0)]['voltage'].to_numpy()
            discharge_Q_reduced = block_reduce(discharge_Q, block_size=(reduction_factor,), func=np.mean, cval=discharge_Q[-1])
            discharge_voltage_reduced = block_reduce(discharge_voltage, block_size=(reduction_factor,), func=np.mean, cval=discharge_voltage[-1])
            dQdV_discharge = np.diff(discharge_Q_reduced) / np.diff(discharge_voltage_reduced)
            df_discharge = pd.DataFrame()
            df_discharge['dq_dv'] = pd.Series(dQdV_discharge)
            df_discharge['voltage'] = pd.Series(discharge_voltage_reduced[:-1]) 
            df_discharge['series'] = series+ " d"
            df_discharge = df_discharge.sort_values(by = ['voltage'])
            df_discharge = df_discharge.replace([np.inf, -np.inf], np.NaN)
            rec.append({"id": f"{series}, discharge", "cell_id": series.split(' ')[0], "source": df_discharge.to_dict('records')})
        except Exception as e:
            print(e)
            pass
    return rec


def get_differential_capacity_service(req_data, email, dashboard_id=None):
    try:
        mp = multiprocessing.get_context('spawn')
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        reduction_factor = 1
        filter_string = ""
        if req_data.get('filters'):
            filter_string, reduction_factor = __generate_filter_string(req_data.get('filters'), rf = True)
        result_df = ao.get_all_data_from_DiffCapacity_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series_list= result_df['series'].dropna().unique()
        with mp.Pool(4) as pool:
            p1 = pool.apply_async(charge_computation,(series_list[:(len(series_list)//2)],result_df,reduction_factor,))
            p2 = pool.apply_async(charge_computation,(series_list[(len(series_list)//2):],result_df,reduction_factor,))
            p3 = pool.apply_async(discharge_computation,(series_list[:(len(series_list)//2)],result_df,reduction_factor,))
            p4 = pool.apply_async(discharge_computation,(series_list[(len(series_list)//2):],result_df,reduction_factor,))
            records = p1.get() + p2.get() + p3.get() + p4.get()
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


# def get_differential_capacity_service(req_data, email, dashboard_id=None):
#     try:
#         ao = ArchiveOperator()
#         ao.set_session()
#         if len(req_data.get('cell_ids')) > 5:
#             return 400, "Not allowed, please add fewer cell ids"
#         if dashboard_id:# and email != "public":
#             dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
#             # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
#             if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
#                 return 401, "Unauthorised Access"
#             else:
#                 email = dashboard_data['shared_by']
#         reduction_factor = 1
#         filter_string = ""
#         if req_data.get('filters'):
#             filter_string, reduction_factor = __generate_filter_string(req_data.get('filters'), rf = True)
#         start = time.time()
#         result_df = ao.get_all_data_from_DiffCapacity_query(req_data.get('cell_ids'), email, filter_string)
#         print("Fetch for diff ",time.time()-start)
#         records = []
#         start = time.time()
#         series_list= result_df['series'].dropna().unique()
#         for series in series_list:
#             try:
#                 charge_Q = result_df[(result_df['series'] == series) & (result_df['current'] >0)]['charge_capacity'].to_numpy()
#                 charge_voltage = result_df[(result_df['series'] == series) & (result_df['current'] >0)]['voltage'].to_numpy()
#                 charge_Q_reduced = block_reduce(charge_Q, block_size=(reduction_factor,), func=np.mean, cval=charge_Q[-1])
#                 charge_voltage_reduced = block_reduce(charge_voltage, block_size=(reduction_factor,), func=np.mean, cval=charge_voltage[-1])
#                 dQdV_charge = np.diff(charge_Q_reduced) / np.diff(charge_voltage_reduced)
#                 df_charge = pd.DataFrame()
#                 df_charge['dq_dv'] = pd.Series(dQdV_charge)
#                 df_charge['voltage'] = pd.Series(charge_voltage_reduced[:-1])
#                 df_charge['series'] = series+ " c"
#                 df_charge = df_charge.sort_values(by = ['voltage'])
#                 df_charge = df_charge.replace([np.inf, -np.inf], np.NaN)
#                 records.append({"id": f"{series}, charge", "cell_id": series.split(' ')[0], "source": df_charge.to_dict('records')})
#             except Exception as e:
#                 print(e)
#                 pass
#             try:
#                 discharge_Q = result_df[(result_df['series'] == series) & (result_df['current'] <0)]['discharge_capacity'].to_numpy()
#                 discharge_voltage = result_df[(result_df['series'] == series) & (result_df['current'] <0)]['voltage'].to_numpy()
#                 discharge_Q_reduced = block_reduce(discharge_Q, block_size=(reduction_factor,), func=np.mean, cval=discharge_Q[-1])
#                 discharge_voltage_reduced = block_reduce(discharge_voltage, block_size=(reduction_factor,), func=np.mean, cval=discharge_voltage[-1])
#                 dQdV_discharge = np.diff(discharge_Q_reduced) / np.diff(discharge_voltage_reduced)
#                 df_discharge = pd.DataFrame()
#                 df_discharge['dq_dv'] = pd.Series(dQdV_discharge)
#                 df_discharge['voltage'] = pd.Series(discharge_voltage_reduced[:-1]) 
#                 df_discharge['series'] = series+ " d"
#                 df_discharge = df_discharge.sort_values(by = ['voltage'])
#                 df_discharge = df_discharge.replace([np.inf, -np.inf], np.NaN)
#                 records.append({"id": f"{series}, discharge", "cell_id": series.split(' ')[0], "source": df_discharge.to_dict('records')})
#             except Exception as e:
#                 print(e)
#                 pass
#         print("Process for diff ",time.time()-start)
#         return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
#     except DataError as err:
#         return 400, str(err.__dict__['orig']).split('\n')[0]
#     except Exception as err:
#         logging.error(err)
#         return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
#     finally:
#         ao.release_session()


def get_voltage_time_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_VoltageTime_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)
        for key, value in series.items():
            records.append({"id": key, "cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_current_time_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_CurrentTime_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)
        for key, value in series.items():
            records.append({"id": key, "cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_energy_density_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        records = []
        archive_cells = ao.get_all_data_from_EnergyDensity_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_force_and_displacement_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_AFD_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_test_tempratures_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_ATT_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series_1']}||{row['cell_id']}"):
                series[f"{row['series_1']}||{row['cell_id']}"] = []
            series[f"{row['series_1']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_voltage_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
            if not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_AV_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_capacity_retention_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_CR_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)
        for key, value in series.items():
            records.append({"id": key, "cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_capacity_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_Capacity_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_operating_potential_service(req_data, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if len(req_data.get('cell_ids')) > 5:
            return 400, "Not allowed, please add fewer cell ids"
        if dashboard_id:# and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            # if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
            if not(set(req_data.get('cell_ids')).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        filter_string = ""
        if req_data.get('filters'):
            filter_string = __generate_filter_string(req_data.get('filters'))
        archive_cells = ao.get_all_data_from_operating_potential_query(req_data.get('cell_ids'), email, filter_string)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)
        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_timeseries_columns_data_service(data, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        columns = (',').join(data['columns'])
        cell_ids =", ".join("'{0}'".format(i) for i in data['cell_ids'])
        filters = ""
        is_diff_capacity_plot = False
        for filter in data['filters']:
            #if reduction factor is applied 
            if filter['column'] == "reduction_factor" and (filter["operation"] != "=" or not(all( x in {"voltage", "dq_dv"}for x in data['columns']))):
                return 400, "Reduction Factor is only applicable while plotting DQ_DV vs Voltage. It only supports = operation."
            elif filter['column'] == "reduction_factor":
                reduction_factor = int(filter['filterValue'])
                is_diff_capacity_plot = True
                continue
            #for other plots
            if filter['operation'] == '%':
                filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
            else:
                filter_str = f"{filter['column']}{filter['operation']}'{filter['filterValue']}'"
            filters = filters+f"and {filter_str}"
        archive_cells = ao.get_all_data_from_timeseries_query(columns, cell_ids, email, filters, get_df=is_diff_capacity_plot)
        records = []
        if is_diff_capacity_plot:
            for cell_id in data["cell_ids"]:
                df = archive_cells[archive_cells['cell_id'] == cell_id]
                df = df.groupby(df.index//reduction_factor).mean()
                if 'dq_dv' not in df:
                    df['dq_dv'] = None
                df['cell_id'] = cell_id
                df = df.sort_values(by = ['voltage'])
                df = df.replace([np.inf, -np.inf], np.NaN)
                records.append({"id": cell_id, "cell_id": cell_id, "source": df.to_dict('records')})
        else:
            series = {}
            for row in archive_cells:
                row = dict(row)
                if not series.get(row['cell_id']):
                    series[row['cell_id']] = []
                series[row['cell_id']].append(row)
            for key, value in series.items():
                records.append({"id": key,"cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        print(err)
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_stats_columns_data_service(data, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        columns = (',').join(data['columns'])
        cell_ids =", ".join("'{0}'".format(i) for i in data['cell_ids'])
        filters = ""
        for filter in data['filters']:
            if filter['operation'] == '%':
                filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
            else:
                filter_str = f"{filter['column']}{filter['operation']}'{filter['filterValue']}'"
            filters = filters+f"and {filter_str}"
        archive_cells = ao.get_all_data_from_stats_query(columns, cell_ids, email, filters)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)
        for key, value in series.items():
            records.append({"id": key,"cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_metadata_summary_service(email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        records = {}
        archive_cells = ao.get_cathode_count_files_query(email)
        cathode_values = []
        for row in archive_cells:
            row = dict(row)
            cathode_values.append(row)
        records['cathode_stats'] = cathode_values
        form_factor_values = []
        archive_cells = ao.get_form_factor_count_files_query(email)
        for row in archive_cells:
            row = dict(row)
            form_factor_values.append(row)
        records['form_factor_stats'] = form_factor_values
        archive_cells = ao.get_files_count_query(email)
        for row in archive_cells:
            row = dict(row)
            records['cell_id_count'] = row['count']
        archive_cells = ao.get_cycle_index_count_query(email)
        for row in archive_cells:
            row = dict(row)
            records['cycle_count'] = row['count']
        size = 0
        archive_cells = ao.get_size_cell_metadata_query(email)
        for row in archive_cells:
            row = dict(row)
            size += row['size']
        archive_cells = ao.get_size_cycle_stats_query(email)
        for row in archive_cells:
            row = dict(row)
            size += row['size']
        archive_cells = ao.get_size_cycle_timeseries_query(email)
        for row in archive_cells:
            row = dict(row)
            size += row['size']
        records['size'] = size/1000000000
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()