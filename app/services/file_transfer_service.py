import pandas as pd
from app import archive_constants
from app.archive_constants import OUTPUT_LABELS, RESPONSE_MESSAGE, TESTER
from app.model import CellMeta
from app.utilities.file_reader import read_generic, read_maccor, read_arbin
from app.model import ArchiveOperator, CycleStats, CycleTimeSeries
from app.utilities.utils import status, calc_cycle_stats, sort_timeseries


def file_data_read_service(tester, file):
    if tester == TESTER.ARBIN.value:
        data = read_arbin(file)
    if tester == TESTER.MACCOR.value:
        data = read_maccor(file)
    if tester == TESTER.GENERIC.value:
        data = read_generic(file)
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
        df_tmerge_sorted = sort_timeseries(df_tmerge)
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 25
        stat_df, final_df = calc_cycle_stats(df_tmerge_sorted, cell_id, email)
        cell_meta = pd.DataFrame(
                data={'cell_id': cell_id, 'email': [email]})

        stat_df['cell_id'] = cell_id
        stat_df['email'] = email
        final_df['cell_id'] = cell_id
        final_df['email'] = email
        status[f"{email}|{cell_id}"]['progress']['percentage'] = 66
        ao.remove_cell_from_archive(cell_id, email)
        ao.add_all(cell_meta, CellMeta)
        ao.add_all(stat_df, CycleStats)
        ao.add_all(final_df, CycleTimeSeries)
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
