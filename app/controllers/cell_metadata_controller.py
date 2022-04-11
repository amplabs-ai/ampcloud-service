import gzip
import json
from app.services.cell_meta_data_service import *
from flask import request, make_response, jsonify
from app.response import Response


def get_cells():
    email = request.cookies.get("userId")
    status, detail, *records = get_cellmeta_service(email)
    return Response(status, detail, records).to_dict(), status

def delete_cell(cell_id):
    email = request.cookies.get("userId")
    status, detail = delete_cell_service(cell_id, email)
    return Response(status, detail).to_dict(), status

