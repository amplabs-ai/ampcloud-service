
from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.response import Response
from app.utilities.utils import status
import logging

# @with_authentication()
def get_status(cell_id):
    try:
        email = request.args.to_dict().get('email')
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
