from builtins import float, print
import datetime
import threading
from app.services.file_transfer_service import *
from app.utilities.utils import status
from app.utilities.with_authentication import with_authentication
from flask import make_response, request, g
from app.response import Response
import logging

lock = threading.Lock()


@with_authentication()
def init_file_upload():
    try:
        email = g.user
        data = request.form.to_dict()
        status, detail = init_file_upload_service(email, data)
        return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
def upload_file(tester):
    email = g.user
    data = request.form.to_dict()
    try:
        start_time = datetime.datetime.now()
        file = request.files['file']
        df = file_data_read_service(tester, file)
        end_time = datetime.datetime.now()
        read_time = (end_time - start_time).total_seconds()*1000

        with lock:
            status[f"{email}|{data['cell_id']}"]['dataframes'].append(df)
            status[f"{email}|{data['cell_id']}"]['file_count'] -= 1
        if not status[f"{email}|{data['cell_id']}"]['file_count']:
            status[f"{email}|{data['cell_id']}"]['progress']['steps']['READ FILE'] = True
            threading.Thread(target=file_data_process_service, args=(data['cell_id'], email)).start()

        end_time = datetime.datetime.now()
        processing_time = (end_time - start_time).total_seconds()*1000
        upload_time = processing_time + read_time
        size = float((df.memory_usage(index=True).sum())/1000)
        logging.info("User {email} Action UPLOAD_FILE file {file_name} size {size} read_time {read_time} processing_time {proc_time} upload_time {upload_time}".format
                     (email=email, file_name=file.filename, size=size, read_time=read_time, proc_time=processing_time, upload_time=upload_time))
        return Response(200, "SUCCESS").to_dict(), 200
    except KeyError as err:
        print(err)
        if 'not present' in err.args[0]:
            status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
            status[f"{email}|{data['cell_id']}"]['progress']['message'] = err.args[0]
        logging.error("User {email} Action UPLOAD_FILE error KEY_ERROR".format(email=email))
        return Response(500, "INTERNAL SERVER ERROR").to_dict(), 500
    except Exception as err:
        status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
        status[f"{email}|{data['cell_id']}"]['progress']['message'] = "READ FILE FAILED"
        logging.error("User {email} Action UPLOAD_FILE error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "READ FILE FAILED").to_dict(), 500


@with_authentication(allow_public=True)
def download_cycle_timeseries(cell_id):
    email = g.user
    try:

        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = datetime.datetime.now()
        status, detail, *resp = download_cycle_timeseries_service(cell_id[0], email, dashboard_id)
        if resp:
            resp = make_response(resp[0].to_csv(index=False))
            resp.headers["Content-Disposition"] = "attachment; filename={}".format(
                f"{cell_id[0]}_cycle_timeseries.csv")
            resp.headers["Content-Type"] = "text/csv"
            end_time = datetime.datetime.now()
            size = float(resp.content_length/1000)
            logging.info("User {email} Action DOWNLOAD_CYCLE_TIMESERIES file {filename} size {size} type CYCLE_TIMESERIES download_time {time}".format(
                    email=email, filename=f"{cell_id[0]}_cycle_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return resp
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error("User {email} Action DOWNLOAD_CYCLE_TIMESERIES error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def download_cycle_data(cell_id):
    email = g.user
    try:
        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = datetime.datetime.now()
        status, detail, *resp = download_cycle_data_service(cell_id[0], email, dashboard_id)
        if resp:
            resp = make_response(resp[0].to_csv(index=False))
            resp.headers["Content-Disposition"] = "attachment; filename={}".format(
                f"{cell_id[0]}_cycle_data.csv")
            resp.headers["Content-Type"] = "text/csv"
            end_time = datetime.datetime.now()
            size = float(resp.content_length/1000)
            logging.info("User {email} Action DOWNLOAD_CYCLE_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                    email=email, filename=f"{cell_id[0]}_cycle_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return resp
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error("User {email} Action DOWNLOAD_CYCLE_DATA error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def get_cycle_data_json(cell_id):
    try:
        email = g.user
        dashboard_id = request.args.to_dict().get('dashboard_id')
        status, detail, *resp = download_cycle_data_service(cell_id[0], email, dashboard_id)
        if resp:
            resp[0] = resp[0].to_dict('records')
        return Response(status, detail, resp).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def get_cycle_timeseries_json(cell_id):
    try:
        email = g.user
        dashboard_id = request.args.to_dict().get('dashboard_id')
        status, detail, *resp = download_cycle_timeseries_service(cell_id[0], email, dashboard_id)
        if resp:
            resp[0] = resp[0].to_dict('records')
        return Response(status, detail, resp).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def download_abuse_timeseries(cell_id):
    email = g.user
    try:
        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = datetime.datetime.now()
        status, detail, *resp = download_abuse_timeseries_service(cell_id[0], email, dashboard_id)
        if resp:
            resp = make_response(resp[0].to_csv(index=False))
            resp.headers["Content-Disposition"] = "attachment; filename={}".format(
                f"{cell_id[0]}_abuse_timeseries.csv")
            resp.headers["Content-Type"] = "text/csv"
            end_time = datetime.datetime.now()
            size = float(resp.content_length/1000)
            logging.info("User {email} Action DOWNLOAD_ABUSE_TIMESERIES file {filename} size {size} type ABUSE_TIMESERIES download_time {time}".format(
                    email=email, filename=f"{cell_id[0]}_abuse_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return resp
        return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error("User {email} Action DOWNLOAD_ABUSE_TIMESERIES error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def get_abuse_timeseries_json(cell_id):
    try:
        email = g.user
        dashboard_id = request.args.to_dict().get('dashboard_id')
        status, detail, *resp = download_abuse_timeseries_service(cell_id[0], email, dashboard_id)
        if resp:
            resp[0] = resp[0].to_dict('records')
        return Response(status, detail, resp).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500
