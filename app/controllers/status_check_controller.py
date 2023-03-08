from flask import request
from app.response import Response
import logging
from app.utilities.file_status import _delete_status, _get_from_simple_db


def get_status(cell_id):
    try:
        email = request.args.to_dict().get('email')
        result = {}
        do_clear = True
        for id in cell_id:
            status_map = _get_from_simple_db(email,id,key="progress")
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
            _delete_status(email,cell_id)
        return Response(200, "Status Received", records=result).to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500
        