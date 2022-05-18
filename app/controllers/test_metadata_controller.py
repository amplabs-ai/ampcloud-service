from app.archive_constants import TEST_TYPE
from app.model import AbuseMeta, CycleMeta
from app.response import Response
from app.services.test_metadata_service import *
from flask import request


def get_testmeta(test):
    email = request.cookies.get("userId")
    if test == TEST_TYPE.CYCLE.value:
        test_model = CycleMeta
    if test == TEST_TYPE.ABUSE.value:
        test_model = AbuseMeta
    status, detail, *records = get_testmeta_service(test_model, email)
    return Response(status, detail, records).to_dict(), status

def update_test_metadata(test):
    email = request.cookies.get("userId")
    request_data = request.get_json()
    status, detail, *records = update_test_metadata_service(email, test, request_data)
    return Response(status, detail, records).to_dict(), status

def get_testmeta_by_cell_id(test, cell_id):
    email = request.cookies.get("userId")
    if test == TEST_TYPE.CYCLE.value:
        table = CycleMeta
    if test == TEST_TYPE.ABUSE.value:
        table = AbuseMeta
    status, detail, *records = get_testmeta_by_cell_id_service(cell_id, table, email)
    return Response(status, detail, records).to_dict(), status