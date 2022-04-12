import threading
from app.services.file_transfer_service import *
from app.utilities.utils import status
from flask import make_response, request
from app.response import Response

lock = threading.Lock()

def init_file_upload():
    try:
        email = request.cookies.get("userId")
        data = request.form.to_dict()
        status, detail = init_file_upload_service(email, data)
        return Response(status, detail).to_dict(), status
    except Exception as err:
        print(err)
        return Response(500, "Failed").to_dict(), 500

def upload_file(tester):
    try:
        email = request.cookies.get("userId")
        data = request.form.to_dict()
        file = request.files['file']
        df = file_data_read_service(tester, file)
        with lock:
            status[f"{email}|{data['cell_id']}"]['dataframes'].append(df)
            status[f"{email}|{data['cell_id']}"]['file_count'] -= 1
        if not status[f"{email}|{data['cell_id']}"]['file_count']:
            threading.Thread(target = file_data_process_service, args = (data['cell_id'], email)).start()
        return Response(200, "Success").to_dict(), 200
    except Exception as err:
        status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
        status[f"{email}|{data['cell_id']}"]['progress']['message'] = "FAILED"
        return Response(500, "Failed").to_dict(), 500


def download_cycle_timeseries(cell_id):
    try:
        email = request.cookies.get("userId")
        df = download_cycle_timeseries_service(cell_id, email)
        resp = make_response(df.to_csv(index=False))
        resp.headers["Content-Disposition"] = "attachment; filename={}".format(
            f"{cell_id}_cycle_timeseries.csv")
        resp.headers["Content-Type"] = "text/csv"
        return resp
    except:
        return Response(500, "Failed").to_dict(), 500


def download_cycle_data(cell_id):
    try:
        email = request.cookies.get("userId")
        df = download_cycle_data_service(cell_id, email)
        resp = make_response(df.to_csv(index=False))
        resp.headers["Content-Disposition"] = "attachment; filename={}".format(
            f"{cell_id}_cycle_data.csv")
        resp.headers["Content-Type"] = "text/csv"
        return resp
    except:
        return Response(500, "Failed").to_dict(), 500

def get_cycle_data_json(cell_id):
    try:
        email = request.cookies.get("userId")
        df = download_cycle_data_service(cell_id, email)
        resp = df.to_dict('records')
        return Response(200, "Records Retrieved", resp).to_dict(), 200
    except Exception as err:
        return Response(500, "Failed").to_dict(), 500


def get_cycle_timeseries_json(cell_id):
    try:
        email = request.cookies.get("userId")
        df = download_cycle_timeseries_service(cell_id, email)
        resp = df.to_dict('records')
        return Response(200, "Records Retrieved", resp).to_dict(), 200
    except Exception as err:
        return Response(500, "Failed").to_dict(), 500
