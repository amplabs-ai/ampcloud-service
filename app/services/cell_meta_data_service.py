import logging
import pandas as pd
from sqlalchemy import text
from app.archive_constants import ARCHIVE_TABLE, RESPONSE_MESSAGE, BATTERY_ARCHIVE, DATA_MATR_IO, TEST_TYPE
from app.model import AbuseMeta, AbuseTimeSeries, ArchiveOperator, CellMeta, CycleMeta, CycleStats, CycleTimeSeries


def get_cellmeta_service(email, test, dashboard_id = None):

    def add_type(row, key, value):
        row[key] = value
        return row

    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not(dashboard_data) or not (dashboard_data.is_public or email in dashboard_data.shared_to):
                return 401, "Unauthorised Access"
            else:
                cell_id = dashboard_data.cell_id.split(',')
                email = dashboard_data.shared_by
                archive_cells = ao.get_all_cell_meta_from_table_with_id(cell_id, email, test)
                records = [cell.to_dict() for cell in archive_cells]
                return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records

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

def get_cellmeta_with_id_service(cell_id, email, test, dashboard_id = None):
    def add_type(row):
        row_dict = row.to_dict()
        if row.email == BATTERY_ARCHIVE:
            row_dict['type'] = "public/battery-archive"
        elif row.email == DATA_MATR_IO:
            row_dict['type'] = "public/data.matr.io"
        else:
            row_dict['type'] = "private"
        return row_dict
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not(dashboard_data) or not (dashboard_data.is_public or email in dashboard_data.shared_to) or not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data.shared_by
                test = dashboard_data.test
        archive_cells = ao.get_all_cell_meta_from_table_with_id(cell_id, email, test)
        records = [add_type(cell) for cell in archive_cells]
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
        query = "select index, cell_id from cell_metadata where test = '{}' and email = '{}'".format(test, email)
        private_cell_ids = ao.session.execute(query)
        private_cell_ids_dict = dict()
        for row in private_cell_ids:
            private_cell_ids_dict[row.cell_id] = row.index

        edited_cell_ids = {}
        for item in request_data:
            try:
                if private_cell_ids_dict[item['cell_id']] != item['index']:
                    return 400, RESPONSE_MESSAGE['CELL_ID_EXISTS'].format(item['cell_id'])
            except KeyError:
                edited_cell_ids[item['cell_id']] = True

        for item in request_data:
            cell_id = ao.session.query(CellMeta).filter(CellMeta.index == item['index']).first().cell_id
            if not cell_id:
                continue
            ao.update_table_with_index(CellMeta, item['index'], item)
            if test == TEST_TYPE.CYCLE.value:
                if edited_cell_ids.get(item['cell_id']):
                    ao.update_table_with_cell_id_email(CycleTimeSeries, cell_id, email, {'cell_id': item['cell_id']})
                    ao.update_table_with_cell_id_email(CycleStats, cell_id, email, {'cell_id': item['cell_id']})
                    ao.update_table_with_cell_id_email(CycleMeta, cell_id, email, {'cell_id': item['cell_id']})
            else:
                if edited_cell_ids.get(item['cell_id']):
                    ao.update_table_with_cell_id_email(AbuseTimeSeries, cell_id, email, {'cell_id': item['cell_id']})
                    ao.update_table_with_cell_id_email(AbuseMeta, cell_id, email, {'cell_id': item['cell_id']})
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