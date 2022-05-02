from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator
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
    try:
        ao = ArchiveOperator()
        ao.set_session()
        test_meta = ao.get_all_test_metadata_from_table_with_id(cell_id, test_model, email)
        records = [test.to_dict() for test in test_meta]   
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()