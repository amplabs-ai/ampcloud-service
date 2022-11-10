import logging
import pandas as pd
from app import archive_constants
from app.archive_constants import BATTERY_ARCHIVE, DATA_MATR_IO, LABEL, RESPONSE_MESSAGE, TEST_TYPE, TESTER
from app.model import ArchiveOperator
from app.utilities.file_reader import read_generic, read_maccor, read_arbin, read_ornlabuse, read_snlabuse
from app.utilities.utils import calc_abuse_stats, status, calc_cycle_stats
from collections import OrderedDict
from sqlalchemy.exc import DataError


def init_file_upload_service(email, request):
    cell_ids = [cell['cell_id'] for cell in request]
    try:
        ao = ArchiveOperator()
        ao.set_session()
        existing_public_cell_id = ao.get_public_cell_meta(cell_ids)
        if existing_public_cell_id:
            return 400, RESPONSE_MESSAGE['RESERVED_PUBLIC_CELL_ID'].format(existing_public_cell_id.cell_id)
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()
    for data in request:
        test_type = data.get('test_type')
        cell_metadata = pd.DataFrame([{
            "cell_id": data.get('cell_id'),
            "anode": data.get('anode'),
            "cathode": data.get('cathode'),
            "source": data.get('source'),
            "ah": float(data.get('ah'))if data.get('active_mass') else None,
            "form_factor": data.get('form_factor'),
            "test": data.get('test_type'),
            "email": email,
            "is_public": data.get('is_public'),
            "active_mass":  float(data['active_mass']) if data.get('active_mass') else None
        }])
        if test_type == archive_constants.TEST_TYPE.CYCLE.value:
            test_metadata = pd.DataFrame([{
                "cell_id": data.get('cell_id'),
                "temperature": float(data.get('temperature'))if data.get('temperature') else None,
                "soc_max": float(data.get('soc_max'))if data.get('soc_max') else None,
                "soc_min": float(data.get('soc_min'))if data.get('soc_min') else None,
                "crate_c": float(data.get('crate_c'))if data.get('crate_c') else None,
                "crate_d": float(data.get('crate_d'))if data.get('crate_d') else None,       
                "email": email
            }])
        else:
            test_metadata = pd.DataFrame([{
                "cell_id": data.get('cell_id'),
                "thickness": float(data.get('thickness'))if data.get('active_mass') else None,
                "temperature": float(data.get('temperature'))if data.get('active_mass') else None,
                "v_init": float(data.get('v_init'))if data.get('active_mass') else None,
                "nail_speed": float(data.get('nail_speed'))if data.get('active_mass') else None,
                "indentor": float(data.get('indentor'))if data.get('active_mass') else None,
                "email": email
            }])

        status[f"{email}|{data.get('cell_id')}"] = {
            "dataframes": [],
            "template": data.get('template'),
            "progress": {'percentage': 1, 'message': "IN PROGRESS", "steps": OrderedDict([
                ("READ FILE", False),
                ("STATS CALCULATION", False),
                ("WRITING TO DATABASE", False)
            ])},
            "file_count": 1,
            "test_type": data.get('test_type'),
            "cell_metadata": cell_metadata,
            "test_metadata": test_metadata}
    return 200, "Success"


def file_data_read_service(tester, file,template,email):
    if tester == TESTER.ARBIN.value:
        data = read_arbin(file)
    if tester == TESTER.MACCOR.value:
        data = read_maccor(file)
    if tester == TESTER.GENERIC.value:
        data = read_generic(file,template,email)
    if tester == TESTER.ORNL.value:
        data = read_ornlabuse(file)
    if tester == TESTER.SNL.value:
        data = read_snlabuse(file)
    return data


def file_data_process_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 2
        df_tmerge = pd.DataFrame()
        for df in status[f"{email}|{cell_id}"]['dataframes']:
            df_tmerge = df_tmerge.append(df, ignore_index=True)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 10
        cell_metadata = status[f"{email}|{cell_id}"]['cell_metadata']
        test_metadata = status[f"{email}|{cell_id}"]['test_metadata']
        ao.remove_cell_from_archive(cell_id, email)
        ao.add_all(cell_metadata, 'cell_metadata')
        if status[f"{email}|{cell_id}"]['test_type'] == TEST_TYPE.CYCLE.value:
            # df_tmerge_sorted = sort_timeseries(df_tmerge)
            # status[f"{email}|{cell_id}"]['progress']['percentage'] = 25
            stat_df, final_df = calc_cycle_stats(df_tmerge, cell_id, email)
            status[f"{email}|{cell_id}"]['progress']['steps']["STATS CALCULATION"] = True
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 70
            ao.add_all(test_metadata, 'cycle_metadata')
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 75
            if stat_df is not None:
                stat_df['cell_id'] = cell_id
                stat_df['email'] = email
                ao.add_all(stat_df, 'cycle_stats')
            else:
                final_df.drop(['cycle_index'], axis=1, inplace=True)
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 80
            ao.add_all(final_df, 'cycle_timeseries')
        else:
            final_df = calc_abuse_stats(df_tmerge, test_metadata, cell_id, email)
            status[f"{email}|{cell_id}"]['progress']['steps']["STATS CALCULATION"] = True
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 70
            ao.add_all(test_metadata, 'abuse_metadata')
            ao.add_all(final_df, 'abuse_timeseries')
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 78
        # ao.commit()
        status[f"{email}|{cell_id}"]['progress']['steps']["WRITING TO DATABASE"] = True
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 100
        status[f"{email}|{cell_id}"]['progress']['message'] = "COMPLETED"
    except Exception as err:
        logging.error(err)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = -1
        for key, value in status[f"{email}|{cell_id}"]['progress']['steps'].items():
            if not value:
                status[f"{email}|{cell_id}"]['progress']['message'] = f"{key} FAILED"
                break
        # status[f"{email}|{cell_id}"]['progress']['message'] = "FAILED"
    finally:
        ao.release_session()


def download_cycle_timeseries_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_cycle_ts_with_cell_id(cell_id, email)
    df.drop(LABEL.EMAIL.value, inplace=True, axis=1)
    df.drop(LABEL.INDEX.value, inplace=True, axis=1)
    df.drop(LABEL.CELL_ID.value, inplace=True, axis=1)
    ao.release_session()
    return 200, "Records Retrieved", df


def download_cycle_data_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_cycle_data_with_cell_id(cell_id, email)
    df.drop(LABEL.EMAIL.value, inplace=True, axis=1)
    df.drop(LABEL.INDEX.value, inplace=True, axis=1)
    df.drop(LABEL.CELL_ID.value, inplace=True, axis=1)
    ao.release_session()
    return 200, "Records Retrieved", df


def download_abuse_timeseries_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_abuse_ts_with_cell_id(cell_id, email)
    ao.release_session()
    return 200, "Records Retrieved", df


def download_timeseries_plot_data_service(data, email):
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
        df = ao.get_all_data_from_timeseries_query(columns, cell_ids, email, filters, get_df = True)
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], df
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def download_stats_plot_data_service(data, email):
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
        df = ao.get_all_data_from_stats_query(columns, cell_ids, email, filters, get_df = True)
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], df
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()
