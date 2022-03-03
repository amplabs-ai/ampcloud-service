
import pandas as pd
from app.archive_constants import RESPONSE_MESSAGE, LABEL
from app.model import ArchiveOperator, CycleStats


def get_ts_service(ts_model):
    ts = ArchiveOperator().get_all_data_from_table(ts_model)
    records = [data.to_dict() for data in ts]      
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def get_ts_by_cell_id_service(cell_id, ts_model):
    ao = ArchiveOperator()
    test_meta = ao.get_all_data_from_table_with_id(ts_model, cell_id)
    records = [test.to_dict() for test in test_meta]      
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def add_ts_service(cell_id, ts, ts_table, ts_model, ts_meta_model, ts_stats_table):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_cell_meta_with_id(cell_id):
             return 400, RESPONSE_MESSAGE['CELL_ID_NOT_EXISTS'].format(cell_id)

        if not ao.get_all_data_from_table_with_id(ts_meta_model, cell_id):
            return 400, RESPONSE_MESSAGE['TEST_META_NOT_EXISTS'].format(cell_id)
        if ao.get_all_data_from_table_with_id(ts_model, cell_id):
            return 400, RESPONSE_MESSAGE['TS_EXISTS'].format(cell_id)

        ts_df = pd.DataFrame.from_records(ts['timeseries_data'])
        ts_df[LABEL.CELL_ID.value] = cell_id 

        if ts_stats_table:
            stats = pd.DataFrame([ts['stats']])
            stats[LABEL.CELL_ID.value] = cell_id
            ao.add_all(stats, CycleStats)

        ao.add_all(ts_df, ts_model)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TS_ADDED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def update_ts_service(cell_id, ts, ts_model, ts_meta_model, ts_stats_model):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_data_from_table_with_id(ts_model, cell_id):
            return 400, RESPONSE_MESSAGE['TS_NOT_EXISTS'].format(cell_id)
        if ts_stats_model:
            ao.remove_cell_from_table(ts_stats_model, cell_id)
        ao.remove_cell_from_table(ts_model, cell_id)

        ts_df = pd.DataFrame.from_records(ts['timeseries_data'])
        ts_df[LABEL.CELL_ID.value] = cell_id 

        if ts_stats_model:
            stats = pd.DataFrame([ts['stats']])
            stats[LABEL.CELL_ID.value] = cell_id
            ao.add_all(stats, ts_stats_model)
 
        ao.add_all(ts_df, ts_model)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TS_UPDATED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    

def delete_ts_service(cell_id, ts_model, ts_stats_model):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_data_from_table_with_id(ts_model, cell_id):
            return 400, RESPONSE_MESSAGE['TS_NOT_EXISTS'].format(cell_id)
        if ts_stats_model:
            ao.remove_cell_from_table(ts_stats_model, cell_id)
        ao.remove_cell_from_table(ts_model, cell_id)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TS_DELETED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']