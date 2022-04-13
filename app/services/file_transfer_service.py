import pandas as pd
from app import archive_constants
from app.archive_constants import OUTPUT_LABELS, RESPONSE_MESSAGE, TEST_TYPE, TESTER
from app.model import AbuseMeta, AbuseTimeSeries, CellMeta, CycleMeta, ArchiveOperator, CycleStats, CycleTimeSeries
from app.utilities.file_reader import read_generic, read_maccor, read_arbin, read_ornlabuse, read_snlabuse
from app.utilities.utils import calc_abuse_stats, status, calc_cycle_stats, sort_timeseries

def init_file_upload_service(email, data):
    cell_id = data['cell_id']
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if ao.get_all_cell_meta_with_id(cell_id, email, data['test_type']):
            return 400, RESPONSE_MESSAGE['CELL_ID_EXISTS'].format(cell_id)
    except ValueError as err:
        print(err)
        return 400, "Unsupported value"
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()
    test_type = data['test_type']
    cell_metadata = pd.DataFrame([{
            "cell_id": data['cell_id'],
            "anode": data['anode'],
            "cathode": data['cathode'],
            "source": data['source'],
            "ah": float(data['ah']),
            "form_factor": data['form_factor'],
            "test": data['test_type'],
            "email": email
        }])
    if test_type == archive_constants.TEST_TYPE.CYCLE.value:
        test_metadata = pd.DataFrame([{
            "cell_id": data['cell_id'],
            "temperature": float(data['temperature']),
            "soc_max": float(data['soc_max']),
            "soc_min": float(data['soc_min']),
            "crate_c": float(data['crate_c']),
            "crate_d": float(data['crate_d']),
            "email": email
        }])
    else:
        test_metadata = pd.DataFrame([{
            "cell_id": data['cell_id'],
            "thickness": float(data['thickness']),
            "temperature": float(data['temperature']),
            "v_init": float(data['v_init']),
            "nail_speed": float(data['nail_speed']),
            "indentor": float(data['indentor']),
            "email": email
        }])

    status[f"{email}|{data['cell_id']}"] = {
        "dataframes":[],
        "progress": {'percentage':0, 'message': "IN PROGRESS"},
        "file_count":int(data['file_count']),
        "test_type": data['test_type'],
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
        ao.add_all(cell_metadata, CellMeta)

        if status[f"{email}|{cell_id}"]['test_type'] == TEST_TYPE.CYCLE.value:
            df_tmerge_sorted = sort_timeseries(df_tmerge)
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 25
            stat_df, final_df = calc_cycle_stats(df_tmerge_sorted, cell_id, email)
            stat_df['cell_id'] = cell_id
            stat_df['email'] = email
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 66

            ao.add_all(test_metadata, CycleMeta)
            ao.add_all(stat_df, CycleStats)
            ao.add_all(final_df, CycleTimeSeries)
        else:
            final_df = calc_abuse_stats(df_tmerge, test_metadata, cell_id, email)
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[f"{email}|{cell_id}"]['progress']['percentage'] = 66
            ao.add_all(test_metadata, AbuseMeta)
            ao.add_all(final_df, AbuseTimeSeries)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 78   
        ao.commit()
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 100
        status[f"{email}|{cell_id}"]['progress']['message'] = "COMPLETED"

    except Exception as err:
        print(err)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = -1
        status[f"{email}|{cell_id}"]['progress']['message'] = "FAILED"
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
