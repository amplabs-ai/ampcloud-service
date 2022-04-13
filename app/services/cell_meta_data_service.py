
import pandas as pd
from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator


def get_cellmeta_service(email, test):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        archive_cells = ao.get_all_cell_meta(email, test)
        records = [cell.to_dict() for cell in archive_cells]
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()

def delete_cell_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        ao.remove_cell_from_archive(cell_id, email)
        ao.commit()
        return 200, RESPONSE_MESSAGE['CELL_METADATA_DELETED'].format(cell_id)
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()