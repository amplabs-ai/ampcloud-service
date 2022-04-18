from builtins import float, print
import datetime
import threading
from app.services.file_transfer_service import *
from app.utilities.utils import status
from flask import make_response, request
from app.response import Response
import logging
import time

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
        start_time = datetime.datetime.now()
        email = request.cookies.get("userId")
        data = request.form.to_dict()
        file = request.files['file']
        df = file_data_read_service(tester, file)
        end_time = datetime.datetime.now()
        read_time = (end_time - start_time).total_seconds()*1000

        with lock:
            status[f"{email}|{data['cell_id']}"]['dataframes'].append(df)
            status[f"{email}|{data['cell_id']}"]['file_count'] -= 1
        if not status[f"{email}|{data['cell_id']}"]['file_count']:
            threading.Thread(target = file_data_process_service, args = (data['cell_id'], email)).start()
        
        end_time = datetime.datetime.now()
        processing_time = (end_time - start_time).total_seconds()*1000
        upload_time = processing_time + read_time
        size = float((df.memory_usage(index=True).sum())/1000)
        logging.info("User {email} Action UPLOAD_FILE file {file_name} size {size} read_time {read_time} processing_time {proc_time} upload_time {upload_time}".format(
            email = email, file_name=file.filename, size=size, read_time=read_time, proc_time=processing_time, upload_time=upload_time
        ))
        return Response(200, "Success").to_dict(), 200
    except KeyError as err:
        logging.error("User {email} Action UPLOAD_FILE error KEY_ERROR".format(email = email))
        return Response(500, "Failed").to_dict(), 500
    except Exception as err:
        status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
        status[f"{email}|{data['cell_id']}"]['progress']['message'] = "FAILED"
        logging.error("User {email} Action UPLOAD_FILE error UNKNOWN".format(email = email))
        return Response(500, "Failed").to_dict(), 500


def download_cycle_timeseries(cell_id):
    try:
        email = request.cookies.get("userId")
        start_time = datetime.datetime.now()
        df = download_cycle_timeseries_service(cell_id, email)
        resp = make_response(df.to_csv(index=False))
        resp.headers["Content-Disposition"] = "attachment; filename={}".format(
            f"{cell_id}_cycle_timeseries.csv")
        resp.headers["Content-Type"] = "text/csv"
        end_time = datetime.datetime.now()
        size = float(resp.content_length/1000)
        logging.info("User {email} Action DOWNLOAD_CYCLE_TIMESERIES file {filename} size {size} type CYCLE_TIMESERIES download_time {time}".format(
                email=email, filename=f"{cell_id}_cycle_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
        return resp
    except:
        logging.error("User {email} Action DOWNLOAD_CYCLE_TIMESERIES error UNKNOWN".format(email=email))
        return Response(500, "Failed").to_dict(), 500


def download_cycle_data(cell_id):
    try:
        email = request.cookies.get("userId")
        start_time = datetime.datetime.now()
        df = download_cycle_data_service(cell_id, email)
        resp = make_response(df.to_csv(index=False))
        resp.headers["Content-Disposition"] = "attachment; filename={}".format(
            f"{cell_id}_cycle_data.csv")
        resp.headers["Content-Type"] = "text/csv"
        end_time = datetime.datetime.now()
        size = float(resp.content_length/1000)
        logging.info("User {email} Action DOWNLOAD_CYCLE_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                email=email, filename=f"{cell_id}_cycle_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
        return resp
    except:
        logging.error("User {email} Action DOWNLOAD_CYCLE_DATA error UNKNOWN".format(email=email))
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
