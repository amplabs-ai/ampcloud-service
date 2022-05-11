import gzip
import json
from app.services.cell_meta_data_service import *
from flask import request, make_response, jsonify
from app.response import Response

def get_cells(test):
    email = request.cookies.get("userId")
    status, detail, *records = get_cellmeta_service(email, test)
    return Response(status, detail, records).to_dict(), status

def get_cell_with_id(cell_id):
    email = request.cookies.get("userId")
    status, detail, *records = get_cellmeta_with_id_service(cell_id[0], email)
    return Response(status, detail, records).to_dict(), status

def delete_cell(cell_id):
    email = request.cookies.get("userId")
    status, detail = delete_cell_service(cell_id[0], email)
    return Response(status, detail).to_dict(), status

