import pandas as pd
from app import archive_constants
from app.archive_constants import OUTPUT_LABELS, RESPONSE_MESSAGE, TEST_TYPE, TESTER
from app.model import AbuseMeta, AbuseTimeSeries, CellMeta, CycleMeta, ArchiveOperator, CycleStats, CycleTimeSeries
from app.utilities.file_reader import read_generic, read_maccor, read_arbin, read_ornlabuse, read_snlabuse
from app.utilities.utils import calc_abuse_stats, status, calc_cycle_stats, sort_timeseries
from collections import OrderedDict
import logging

def init_file_upload_service(email, data):
    cell_id = data.get('cell_id')
    # try:
    #     ao = ArchiveOperator()
    #     ao.set_session()
    #     if ao.get_all_cell_meta_with_id(cell_id, email, data.get('test_type')):
    #         return 400, RESPONSE_MESSAGE['CELL_ID_EXISTS'].format(cell_id)
    # except ValueError as err:
    #     print(err)
    #     return 400, "Unsupported value"
    # except Exception as err:
    #     print(err)
    #     return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    # finally:
    #     ao.release_session()
    test_type = data.get('test_type')
    cell_metadata = pd.DataFrame([{
            "cell_id": data.get('cell_id'),
            "anode": data.get('anode'),
            "cathode": data.get('cathode'),
            "source": data.get('source'),
            "ah": float(data.get('ah') or 0.0),
            "form_factor": data.get('form_factor'),
            "test": data.get('test_type'),
            "email": email
        }])
    if test_type == archive_constants.TEST_TYPE.CYCLE.value:
        test_metadata = pd.DataFrame([{
            "cell_id": data.get('cell_id'),
            "temperature": float(data.get('temperature') or 0.0),
            "soc_max": float(data.get('soc_max') or 0.0),
            "soc_min": float(data.get('soc_min') or 0.0),
            "crate_c": float(data.get('crate_c') or 0.0),
            "crate_d": float(data.get('crate_d') or 0.0),
            "email": email
        }])
    else:
        test_metadata = pd.DataFrame([{
            "cell_id": data.get('cell_id'),
            "thickness": float(data.get('thickness') or 0.0),
            "temperature": float(data.get('temperature') or 0.0),
            "v_init": float(data.get('v_init') or 0.0),
            "nail_speed": float(data.get('nail_speed') or 0.0),
            "indentor": float(data.get('indentor') or 0.0),
            "email": email
        }])

    status[f"{email}|{data.get('cell_id')}"] = {
        "dataframes":[],
        "progress": {'percentage':0, 'message': "IN PROGRESS", "steps":OrderedDict([
            ("READ FILE", False),
            ("STATS CALCULATION", False),
            ("WRITING TO DATABASE", False)
        ])},
        "file_count":int(data.get('file_count')),
        "test_type": data.get('test_type'),
        "cell_metadata": cell_metadata,
        "test_metadata": test_metadata}
    return 200, "Success"


def file_data_read_service(tester, file):
    if tester == TESTER.ARBIN.value:
        data = read_arbin(file)
    if tester == TESTER.MACCOR.value:
        data = read_maccor(file)
    if tester == TESTER.GENERIC.value:
        data = read_generic(file)
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
            stat_df['cell_id'] = cell_id
            stat_df['email'] = email
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 70

            ao.add_all(test_metadata, 'cycle_metadata')
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 75
            ao.add_all(stat_df, 'cycle_stats')
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
        logging.debug(err)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = -1
        for key, value in status[f"{email}|{cell_id}"]['progress']['steps'].items():
            if not value:
                status[f"{email}|{cell_id}"]['progress']['message'] = f"{key} FAILED"
                break
        # status[f"{email}|{cell_id}"]['progress']['message'] = "FAILED"
    finally:
        ao.release_session()


def download_cycle_timeseries_service(cell_id, email):
    ao = ArchiveOperator()
    ao.set_session()
    data = ao.get_df_cycle_ts_with_cell_id(cell_id, email)
    ao.release_session()
    return data


def download_cycle_data_service(cell_id, email):
    ao = ArchiveOperator()
    ao.set_session()
    df = ao.get_df_cycle_data_with_cell_id(cell_id, email)
    df.insert(1, OUTPUT_LABELS.START_TIME.value, None)
    df.insert(2, OUTPUT_LABELS.END_TIME.value, None)
    ao.release_session()
    return df
