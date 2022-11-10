from app.services.filter_data_service import *
from app.response import Response
import logging
from flask import g
from app.utilities.with_authentication import with_authentication


@with_authentication()
def get_filter_data():
    try:
        email = g.user
        status, detail, *records = get_filter_data_service(email)
        return Response(status, detail, records).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500