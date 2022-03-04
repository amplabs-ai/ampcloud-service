from flask import request
from marshmallow import ValidationError
from app.model import AbuseMeta, CycleMeta, CycleStats, AbuseTimeSeries, CycleTimeSeries
from app.validation_schema.timeseries_validation import CycleTimeseriesSchema, AbuseTimeseriesSchema
from app.archive_constants import ARCHIVE_TABLE, TEST_TYPE
from app.response import Response
from app.services.timeseries_service import *


def get_ts(test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        ts_model = CycleTimeSeries
    if test_name == TEST_TYPE.ABUSE.value:
        ts_model = AbuseTimeSeries
    status, detail, *records = get_ts_service(ts_model)
    return Response(status, detail, records).to_dict(), status

def get_ts_by_cell_id(cell_id, test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        ts_model = CycleTimeSeries
    if test_name == TEST_TYPE.ABUSE.value:
        ts_model = AbuseTimeSeries
    status, detail, *records = get_ts_by_cell_id_service(cell_id, ts_model)
    return Response(status, detail, records).to_dict(), status

def add_ts(cell_id, test_name):
    request_data = request.json
    if test_name == TEST_TYPE.CYCLE.value:
        ts = CycleTimeseriesSchema()
        ts_table = ARCHIVE_TABLE.CYCLE_TS.value
        ts_model = CycleTimeSeries
        ts_meta_model = CycleMeta
        ts_stats_table = ARCHIVE_TABLE.CYCLE_STATS.value
    else:
        ts = AbuseTimeseriesSchema()
        ts_table = ARCHIVE_TABLE.ABUSE_TS.value
        ts_model = AbuseTimeSeries
        ts_meta_model = AbuseMeta
        ts_stats_table = None
    
    try:
        ts = ts.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    
    status, detail = add_ts_service(cell_id, ts, ts_table, ts_model, ts_meta_model, ts_stats_table)
    return Response(status, detail).to_dict(), status

def update_ts(cell_id, test_name):
    request_data = request.json
    if test_name == TEST_TYPE.CYCLE.value:
        ts = CycleTimeseriesSchema()
        ts_model = CycleTimeSeries
        ts_meta_model = CycleMeta
        ts_stats_model = CycleStats
    if test_name == TEST_TYPE.ABUSE.value:
        ts = AbuseTimeseriesSchema()
        ts_model = AbuseTimeSeries
        ts_meta_model = AbuseMeta
        ts_stats_model = None
    
    try:
        ts = ts.load(request_data)
    except ValidationError as err:
        return Response(400, err.messages).to_dict(), 400
    
    status, detail = update_ts_service(cell_id, ts, ts_model, ts_meta_model, ts_stats_model)
    return Response(status, detail).to_dict(), status

def delete_ts(cell_id, test_name):
    if test_name == TEST_TYPE.CYCLE.value:
        ts_model = CycleTimeSeries
        ts_stats_model = CycleStats
    if test_name == TEST_TYPE.ABUSE.value:
        ts_model = AbuseTimeSeries
        ts_stats_model = None

    status, detail = delete_ts_service(cell_id, ts_model, ts_stats_model)
    return Response(status, detail).to_dict(), status
