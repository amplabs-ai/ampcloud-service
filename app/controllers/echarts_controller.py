from decimal import Decimal
import gzip
import json
from app.utilities.utils import default
from flask import request, make_response
from app.services.echarts_service import *
from app.response import Response

def get_cycle_quantities_by_step(cell_id, step):
    email = request.cookies.get("userId")
    status, detail, *records = get_cycle_quantities_by_step_service(cell_id, step, email)
    data = Response(status, detail, records).__dict__
    content = gzip.compress(json.dumps(data, default=default).encode('utf8'), 5)
    resp =  make_response(content)
    resp.headers['Content-Encoding'] = 'gzip'
    return resp, status

def get_energy_and_capacity_decay(cell_id):
    email = request.cookies.get("userId") 
    status, detail, *records = get_energy_and_capacity_decay_service(cell_id, email)
    data = Response(status, detail, records).__dict__
    content = gzip.compress(json.dumps(data, default=default).encode('utf8'), 5)
    resp =  make_response(content)
    resp.headers['Content-Encoding'] = 'gzip'
    return resp, status

def get_efficiency(cell_id):
    email = request.cookies.get("userId") 
    status, detail, *records = get_efficiency_service(cell_id, email)
    data = Response(status, detail, records).__dict__
    content = gzip.compress(json.dumps(data, default=default).encode('utf8'), 5)
    resp =  make_response(content)
    resp.headers['Content-Encoding'] = 'gzip'
    return resp, status

def get_compare_by_cycle_time(cell_id):
    email = request.cookies.get("userId")
    status, detail, *records = get_compare_by_cycle_time_service(cell_id, email)
    data = Response(status, detail, records).__dict__
    content = gzip.compress(json.dumps(data, default=default).encode('utf8'), 5)
    resp =  make_response(content)
    resp.headers['Content-Encoding'] = 'gzip'
    return resp, status
    