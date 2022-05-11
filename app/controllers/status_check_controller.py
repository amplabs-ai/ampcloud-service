
from flask import request
from app.response import Response
from app.utilities.utils import status
import logging

def get_status(cell_id):
    try:
        email = request.cookies.get("userId")
        status_map = status.get(f"{email}|{cell_id[0]}")
        if status_map:
            result = status_map['progress']
            if result['percentage'] in {100, -1}:
                status.pop(f"{email}|{cell_id[0]}", None)
        else:
            result = None
        return Response(200, "Status Received", result).to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500