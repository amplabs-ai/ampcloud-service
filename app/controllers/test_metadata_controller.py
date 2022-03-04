from flask import request
from marshmallow import ValidationError
from app.model import AbuseMeta, AbuseTimeSeries, CycleMeta, CycleTimeSeries, CycleStats
from app.archive_constants import TEST_TYPE
from app.response import Response
from app.services.test_metadata_service import add_testmeta_service, delete_testmeta_service, get_testmeta_by_cell_id_service, get_testmeta_service, update_testmeta_servcie
from app.validation_schema.test_metadata_validation import AbuseMetaSchema, CycleMetaSchema


def get_testmeta(test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        test_model = CycleMeta
    if test_name == TEST_TYPE.ABUSE.value:
        test_model = AbuseMeta      
    status, detail, *records = get_testmeta_service(test_model)
    return Response(status, detail, records).to_dict(), status

def get_testmeta_by_cell_id(cell_id, test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        table = CycleMeta
    if test_name == TEST_TYPE.ABUSE.value:
        table = AbuseMeta
    status, detail, *records = get_testmeta_by_cell_id_service(cell_id, table)
    return Response(status, detail, records).to_dict(), status


def add_testmeta(cell_id, test_name):
    request_data = request.json
    if test_name == TEST_TYPE.CYCLE.value:
        test_meta = CycleMetaSchema()
        model = CycleMeta
    if test_name == TEST_TYPE.ABUSE.value:
        test_meta = AbuseMetaSchema()
        model = AbuseMeta

    try:
        test_meta = test_meta.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    status, detail = add_testmeta_service(cell_id, test_meta, model)
    return Response(status, detail).to_dict(), status


def update_testmeta(cell_id, test_name):
    request_data = request.json
    if test_name == TEST_TYPE.CYCLE.value:
        test_meta = CycleMetaSchema()
        meta_model = CycleMeta
    if test_name == TEST_TYPE.ABUSE.value:
        test_meta = AbuseMetaSchema()
        meta_model = AbuseMeta
    
    try:
        test_meta = test_meta.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    status, detail = update_testmeta_servcie(cell_id, test_meta, meta_model)
    return Response(status, detail).to_dict(), status


def delete_testmeta(cell_id, test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        meta_model = CycleMeta
        ts_model = CycleTimeSeries
        stats_model = CycleStats
    if test_name == TEST_TYPE.ABUSE.value:
        meta_model = AbuseMeta
        ts_model = AbuseTimeSeries
        stats_model = None

    status, detail = delete_testmeta_service(cell_id, meta_model, ts_model, stats_model)
    return Response(status, detail).to_dict(), status

