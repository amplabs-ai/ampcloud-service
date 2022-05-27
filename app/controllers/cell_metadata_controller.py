import gzip
import json
from app.services.cell_meta_data_service import *
from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.response import Response

@with_authentication(allow_public = True)
def get_cells(test):
    email = g.user
    status, detail, *records = get_cellmeta_service(email, test)
    return Response(status, detail, records).to_dict(), status

@with_authentication(allow_public = True)
def get_cell_with_id(test, cell_id):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    status, detail, *records = get_cellmeta_with_id_service(cell_id, email, test, dashboard_id)
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def update_cell_metadata(test):
    email = g.user
    request_data = request.get_json()
    status, detail, *records = update_cell_metadata_service(email, test, request_data)
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def delete_cell(cell_id):
    email = g.user
    status, detail = delete_cell_service(cell_id[0], email)
    return Response(status, detail).to_dict(), status

