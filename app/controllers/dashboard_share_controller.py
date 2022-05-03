
import logging
from app.response import Response
from flask import request

def dashboard_share():
    try:
        email = request.cookies.get('userId')
        logging.info("User {} Action SHARE_DASHBOARD".format(email))
        return Response(200, "Success").to_dict(), 200
    except Exception as err:
        logging.debug(err)
        return Response(500, "Internal Server Error").to_dict(), 500
