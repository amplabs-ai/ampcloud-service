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

def get_all_records(cell_id, step):
    email = request.cookies.get('userId')
    status = []
    detail = []
    records = []
    status1, detail1, *records = get_cycle_quantities_by_step_service(cell_id, step, email)
    status2, detail2, *records2 = get_energy_and_capacity_decay_service(cell_id, email)
    status3, detail3, *records3 = get_efficiency_service(cell_id, email)
    status = status1 + status2 + status3
    detail = detail1 + detail2 + detail3
    records = records + records2 + records3
    print(records)

    return Response(status, detail, records).to_dict(), status
    