
import pandas as pd
from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator


def get_testmeta_service(test_model):
    a = ArchiveOperator()
    test_meta = ArchiveOperator().get_all_data_from_table(test_model)
    records = [test.to_dict() for test in test_meta]   
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def get_testmeta_by_cell_id_service(cell_id, test_model):
    ao = ArchiveOperator()
    test_meta = ao.get_all_data_from_table_with_id(test_model, cell_id)
    records = [test.to_dict() for test in test_meta]      
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def add_testmeta_service(cell_id, test_meta, model):
    try:   
        ao = ArchiveOperator()
        if not ao.get_all_cell_meta_with_id(cell_id):
            return 400, RESPONSE_MESSAGE['CELL_ID_NOT_EXISTS'].format(cell_id)
        if ao.get_all_data_from_table_with_id(model, cell_id):
            return 400, RESPONSE_MESSAGE['TEST_EXISTS'].format(cell_id)
        test_meta_df = pd.DataFrame(test_meta, index=[0])       
        test_meta_df['cell_id'] = cell_id
        ao.add(test_meta_df, model)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TEST_METADATA_ADDED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def update_testmeta_servcie(cell_id, test_meta, meta_model):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_data_from_table_with_id(meta_model, cell_id):
            return 400, RESPONSE_MESSAGE['TEST_NOT_EXISTS'].format(cell_id)
        ao.update_table_with_cell_id(meta_model, cell_id, test_meta)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TEST_METADATA_UPDATED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def delete_testmeta_service(cell_id, meta_model, ts_model, stats_model):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_data_from_table_with_id(meta_model, cell_id):
            return 400, RESPONSE_MESSAGE['TEST_NOT_EXISTS'].format(cell_id)
        ao.remove_cell_from_table(meta_model, cell_id)
        ao.remove_cell_from_table(ts_model, cell_id)
        if stats_model:
            ao.remove_cell_from_table(stats_model, cell_id)
        ao.commit()
        return 200, RESPONSE_MESSAGE['TEST_METADATA_DELETED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']    
        


