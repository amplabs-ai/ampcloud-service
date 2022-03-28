from flask import request
from app.services.echarts_service import *
from app.response import Response

def get_cycle_quantities_by_step(cell_id, step):
    email = request.cookies.get("userId")
    status, detail, *records = get_cycle_quantities_by_step_service(cell_id, step, email)
    return Response(status, detail, records).to_dict(), status

def get_energy_and_capacity_decay(cell_id):
    email = request.cookies.get("userId") 
    status, detail, *records = get_energy_and_capacity_decay_service(cell_id, email)
    return Response(status, detail, records).to_dict(), status

def get_efficiency(cell_id):
    email = request.cookies.get("userId") 
    status, detail, *records = get_efficiency_service(cell_id, email)
    return Response(status, detail, records).to_dict(), status

def get_compare_by_cycle_time(cell_id):
    email = request.cookies.get("userId")
    status, detail, *records = get_compare_by_cycle_time_service(cell_id, email)
    return Response(status, detail, records).to_dict(), status
    