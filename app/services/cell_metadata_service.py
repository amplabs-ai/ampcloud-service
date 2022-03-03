
import pandas as pd
from app.model import AbuseMeta, AbuseTimeSeries, CellMeta, CycleMeta, CycleStats, CycleTimeSeries
from app.archive_constants import LABEL, RESPONSE_MESSAGE
from app.model import ArchiveOperator


def get_cellmeta_service():
    ao = ArchiveOperator()
    archive_cells = ao.get_all_cell_meta()
    records = [cell.to_dict() for cell in archive_cells]
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def get_cellmeta_by_cell_id_service(cell_id):
    ao = ArchiveOperator()
    archive_cells = ao.get_all_cell_meta_with_id(cell_id)
    records = [cell.to_dict() for cell in archive_cells]
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def add_cellmeta_service(cell_meta):
    try:
        ao = ArchiveOperator()
        cell_id = cell_meta[LABEL.CELL_ID.value]
        if ao.get_all_cell_meta_with_id(cell_meta[LABEL.CELL_ID.value]):
            return 400, RESPONSE_MESSAGE['CELL_ID_EXISTS'].format(cell_id)
        cell_meta_df = pd.DataFrame(cell_meta, index=[0])
        ao.add(cell_meta_df, CellMeta)
        ao.commit()
        return 200, RESPONSE_MESSAGE['CELL_METADATA_ADDED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']

    
def update_cellmeta_service(cell_id, cell_meta):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_cell_meta_with_id(cell_id):
            return 400, RESPONSE_MESSAGE['CELL_ID_NOT_EXISTS'].format(cell_id)
        ao.update_table_with_cell_id(CellMeta, cell_id, cell_meta)
        if cell_meta.get(LABEL.CELL_ID.value) and not cell_id == cell_meta.get(LABEL.CELL_ID.value):
            data = {LABEL.CELL_ID.value: cell_meta[LABEL.CELL_ID.value]} 
            ao.update_table_with_cell_id(AbuseMeta, cell_id, data)
            ao.update_table_with_cell_id(AbuseTimeSeries, cell_id, data)
            ao.update_table_with_cell_id(CycleMeta, cell_id, data)
            ao.update_table_with_cell_id(CycleTimeSeries, cell_id, data)
            ao.update_table_with_cell_id(CycleStats, cell_id, data)
        ao.commit()
        return 200, RESPONSE_MESSAGE['CELL_METADATA_UPDATED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def delete_cellmeta_service(cell_id):
    try:
        ao = ArchiveOperator()
        if not ao.get_all_cell_meta_with_id(cell_id):
            return 400, RESPONSE_MESSAGE['CELL_ID_NOT_EXISTS'].format(cell_id)
        ao.remove_cell_from_archive(cell_id)
        ao.commit()
        return 200, RESPONSE_MESSAGE['CELL_METADATA_DELETED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
