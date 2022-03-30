from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator, CellMeta


def login_service(email):
    try:
        ao = ArchiveOperator()
        archive_cells = ao.select_data_from_table(CellMeta, email)
        if archive_cells:
            redirect_url = "/dashboard"
        else:
            redirect_url = "/upload"
        return 200, redirect_url
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']