from app.archive_constants import BATTERY_ARCHIVE, DATA_MATR_IO, RESPONSE_MESSAGE, TEST_TYPE, LABEL
from app.model import ArchiveOperator, CycleMeta, AbuseMeta
import logging


def get_testmeta_service(test_model, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        test_meta = ao.get_all_test_metadata_from_table(test_model, email)
        records = [test.to_dict() for test in test_meta]   
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_testmeta_by_cell_id_service(cell_id, test_model, email):
    def add_type(row):
        row_dict = row.to_dict()
        if row.email == BATTERY_ARCHIVE:
            row_dict['type'] = "public/battery-archive"
        elif row.email == DATA_MATR_IO:
            row_dict['type'] = "public/data.matr.io"
        elif row.email != email:
            row_dict['type'] = "public/other"
        elif row.email == email:
            row_dict['type'] = "private"
        return row_dict
    try:
        ao = ArchiveOperator()
        ao.set_session()
        test_meta = ao.get_all_test_metadata_from_table_with_id(cell_id, test_model, email)
        records = [add_type(test) for test in test_meta]   
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def update_test_metadata_service(email, test, request_data):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        for item in request_data:
            if test == TEST_TYPE.CYCLE.value:
                ao.update_table_with_index(CycleMeta, item['index'], item)
            else:
                cell = ao.session.query(AbuseMeta).filter(
                AbuseMeta.index == item['index']).first()
                cell_id = cell.cell_id
                thickness = cell.thickness
                if item.get('thickness') == "":
                    item['thickness'] = None
                ao.update_table_with_index(AbuseMeta, item['index'], item)
                if thickness != item.get('thickness'):
                    __update_with_thickness(item,email,ao)
        return 200, RESPONSE_MESSAGE['METADATA_UPDATED']
    except Exception as err:
        print(err)
        logging.error("User {email} action UPDATE_TEST_METADATA error INTERNAL_SERVER_ERROR".format(email=email))
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()

def __update_with_thickness(item,email,ao):
    df_t = ao.get_data_as_dataframe(email,item.get('cell_id'),type='abuse')
    df_t["strain"] = df_t["norm_d"] / float(item.get('thickness'))
    ao.update_for_strain(df_t)
