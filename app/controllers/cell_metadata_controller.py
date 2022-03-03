from marshmallow import ValidationError
from app.services.cell_metadata_service import *
from app.validation_schema.cell_metadata_validation import *
from flask import request
from app.response import Response


def get_cells():
    status, detail, *records = get_cellmeta_service()
    return Response(status, detail, records).to_dict(), status


def get_cell_by_cell_id(cell_id):
    status, detail, *records = get_cellmeta_by_cell_id_service(cell_id)
    return Response(status, detail, records).to_dict(), status


def add_cellmeta():
    request_data = request.json
    cell_meta_add_schema = CellMetadataAddSchema()
    try:
        cell_meta = cell_meta_add_schema.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    status, detail = add_cellmeta_service(cell_meta)
    return Response(status, detail).to_dict(), status


def update_cellmeta(cell_id):
    request_data = request.json
    cell_meta_update_schema = CellMetadataUpdateSchema()
    try:
        cell_meta = cell_meta_update_schema.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    status, detail = update_cellmeta_service(cell_id, cell_meta)
    return Response(status, detail).to_dict(), status


def delete_cellmeta(cell_id):
    status, detail = delete_cellmeta_service(cell_id)
    return Response(status, detail).to_dict(), status


