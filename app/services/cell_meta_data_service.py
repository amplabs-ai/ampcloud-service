import logging
import pandas as pd
from sqlalchemy import text
from app.archive_constants import ARCHIVE_TABLE, RESPONSE_MESSAGE, BATTERY_ARCHIVE, DATA_MATR_IO, TEST_TYPE
from app.model import AbuseMeta, AbuseTimeSeries, ArchiveOperator, CellMeta, CycleMeta, CycleStats, CycleTimeSeries


def get_cellmeta_service(email, test):

    def add_type(row, key, value):
        row[key] = value
        return row

    try:
        ao = ArchiveOperator()
        ao.set_session()
        archive_cells = ao.get_all_cell_meta(email, test)
        records = [add_type(cell.to_dict(), "type", "private") for cell in archive_cells]
        archive_cells_ba = ao.get_all_cell_meta(BATTERY_ARCHIVE, test)
        records.extend([add_type(cell.to_dict(), "type", "public/battery-archive") for cell in archive_cells_ba])
        archive_cells_dm = ao.get_all_cell_meta(DATA_MATR_IO, test)
        records.extend([add_type(cell.to_dict(), "type", "public/data.matr.io") for cell in archive_cells_dm])
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()

def get_cellmeta_with_id_service(cell_id, email, test):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        archive_cells = ao.get_all_cell_meta_from_table_with_id(cell_id, email, test)
        records = [cell.to_dict() for cell in archive_cells]
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()

def update_cell_metadata_service(email, test, request_data):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        for item in request_data:
            cell_id = ao.session.query(CellMeta).filter(CellMeta.index == item['index']).first().cell_id
            if not cell_id:
                continue
            ao.update_table_with_index(CellMeta, item['index'], item)
            if test == TEST_TYPE.CYCLE.value:
                if cell_id != item['cell_id']:
                    ao.update_table_with_cell_id_email(CycleTimeSeries, cell_id, email, {'cell_id': item['cell_id']})
                    ao.update_table_with_cell_id_email(CycleStats, cell_id, email, {'cell_id': item['cell_id']})  
            else:
                if cell_id != item['cell_id']:
                    ao.update_table_with_cell_id_email(AbuseTimeSeries, cell_id, email, {'cell_id': item['cell_id']})
        return 200, RESPONSE_MESSAGE['METADATA_UPDATED']
    except Exception as err:
        print(err)
        logging.error("User {email} action UPDATE_CELL_METADATA error INTERNAL_SERVER_ERROR".format(email=email))
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()  


def delete_cell_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if not ao.get_all_cell_meta_with_id(cell_id, email):
            logging.warn("User {email} action DELETE cell_id {cell_id} do not exixts")
            return 400, RESPONSE_MESSAGE['CELL_ID_NOT_EXISTS'].format(cell_id)
        ao.remove_cell_from_archive(cell_id, email)
        # ao.commit()
        logging.info("User {email} action DELETE cell_id {cell_id}".format(email=email, cell_id=cell_id))
        return 200, RESPONSE_MESSAGE['CELL_METADATA_DELETED'].format(cell_id)
    except Exception as err:
        logging.error("User {email} action DELETE error INTERNAL_SERVER_ERROR".format(email=email))
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()