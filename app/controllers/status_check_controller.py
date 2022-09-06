from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.response import Response
from app.utilities.utils import status
import logging
import copy

# @with_authentication()
def get_status(cell_id):
    try:
        email = request.args.to_dict().get('email')
        result = {}
        do_clear = True
        for id in cell_id:
            status_map = copy.deepcopy(status.get(f"{email}|{id}"))
            if status_map:
                for key, value in status_map['progress']['steps'].items():
                    if not status_map['progress']['steps'][key]:
                        status_map['progress']['steps'] = key
                        break
                else:
                    status_map['progress']['steps'] = "COMPLETED"
                result[id] = status_map['progress']
                if result[id]['percentage'] not in {100, -1}:
                    do_clear = False
        if do_clear:
            for id in cell_id:
                status.pop(f"{email}|{id}", None)
        return Response(200, "Status Received", result).to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500
        