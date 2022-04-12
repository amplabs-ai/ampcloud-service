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
    
def get_force_and_displacement(cell_id, sample):
    email = request.cookies.get("userId")
    status, detail, *records = get_force_and_displacement_service(cell_id, email, sample)
    return Response(status, detail, records).to_dict(), status

def get_test_tempratures(cell_id, sample):
    email = request.cookies.get("userId")
    status, detail, *records = get_test_tempratures_service(cell_id, email, sample)
    return Response(status, detail, records).to_dict(), status

def get_voltage(cell_id, sample):
    email = request.cookies.get("userId")
    status, detail, *records = get_voltage_service(cell_id, email, sample)
    return Response(status, detail, records).to_dict(), status
