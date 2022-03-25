import pandas as pd
from app.archive_constants import OUTPUT_LABELS
from app.model import CellMeta
from app.utilities.file_reader import read_generic, read_maccor, read_arbin
from app.model import ArchiveOperator, CycleStats, CycleTimeSeries
from app.utilities.utils import status, calc_cycle_stats, sort_timeseries


def file_data_upload_service(tester, files, email):
    
    for file in files:
        filename = file.filename
        cell_id = file.filename.split(".")[0]
        try:
            status[email][filename] = 5

            if tester == 'arbin':
                df_merge = read_arbin(file=file)
            elif tester == 'maccor': 
                df_merge = read_maccor(file)
            if tester == 'generic':
                df_merge = read_generic(file)

            status[email][filename] = 20
            df_calc = sort_timeseries(df_merge)

            status[email][filename] = 25
            stat_df, final_df = calc_cycle_stats(df_calc, filename, email)
            cell_meta = pd.DataFrame(data = {'cell_id': cell_id, 'email':[email]})

            stat_df['cell_id'] = cell_id
            stat_df['email'] = email
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            status[email][filename] = 66
            ao = ArchiveOperator()
            ao.remove_cell_from_archive(cell_id, email)
            ao.add_all(cell_meta, CellMeta)
            ao.add_all(stat_df, CycleStats)
            ao.add_all(final_df,CycleTimeSeries)
            status[email][filename] = 78
            ao.commit()
            status[email][filename] = 100

        except Exception as err:
            status[email][filename] = -1
            print(err)


def download_cycle_timeseries_service(cell_id, email):
    return ArchiveOperator().get_df_cycle_ts_with_cell_id(cell_id, email)


def download_cycle_data_service(cell_id, email):
    df = ArchiveOperator().get_df_cycle_data_with_cell_id(cell_id, email)
    df.insert(1, OUTPUT_LABELS.START_TIME.value, None)
    df.insert(2, OUTPUT_LABELS.END_TIME.value, None)
    return df


