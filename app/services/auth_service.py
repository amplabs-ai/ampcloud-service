from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator, CellMeta
import logging


def login_service(email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if ao.select_data_from_table(CellMeta, email, 'cycle'):
            redirect_url = "/dashboard/cycle-test"
        elif ao.select_data_from_table(CellMeta, email, 'abuse'):
            redirect_url = "/dashboard/abuse-test"
        else:
            redirect_url = "/upload"
        return 200, redirect_url
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()
