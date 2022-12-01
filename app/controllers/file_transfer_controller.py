from builtins import float, print
import datetime
import threading
from app.amplabs_exception.amplabs_exception import AmplabsException
from app.archive_constants import TRI_BUCKET_NAME
from app.services.file_transfer_service import *
from app.utilities.user_plan import set_user_plan
from app.utilities.utils import status
from app.utilities.with_authentication import with_authentication
from flask import make_response, request, g
from app.response import Response
import logging
from io import BytesIO
import zipfile
from flask import send_file, Response as res
from app.utilities.aws_connection import s3_client

lock = threading.Lock()


@with_authentication()
@set_user_plan()
def init_file_upload():
    try:
        email = g.user
        data = request.get_json()
        status, detail = init_file_upload_service(email, data)
        return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
@set_user_plan()
def upload_file(tester):
    if g.user_plan == 'BETA':
        return Response(405, "Not Allowed").to_dict(), 405
    email = g.user
    data = request.form.to_dict()
    try:
        start_time = datetime.datetime.now()
        file = request.files['file']
        template = status[f"{email}|{data['cell_id']}"]['template']
        df = file_data_read_service(tester, file, template, email)
        end_time = datetime.datetime.now()
        read_time = (end_time - start_time).total_seconds()*1000
        with lock:
            status[f"{email}|{data['cell_id']}"]['dataframes'].append(df)
            status[f"{email}|{data['cell_id']}"]['file_count'] -= 1
        if not status[f"{email}|{data['cell_id']}"]['file_count']:
            status[f"{email}|{data['cell_id']}"]['progress']['steps']['READ FILE'] = True
            threading.Thread(target=file_data_process_service,
                            args=(data['cell_id'], email)).start()
        end_time = datetime.datetime.now()
        processing_time = (end_time - start_time).total_seconds()*1000
        upload_time = processing_time + read_time
        size = float((df.memory_usage(index=True).sum())/1000)
        logging.info("User {email} Action UPLOAD_FILE file {file_name} size {size} read_time {read_time} processing_time {proc_time} upload_time {upload_time}".format
                    (email=email, file_name=file.filename, size=size, read_time=read_time, 
                        proc_time=processing_time, upload_time=upload_time))
        return Response(200, "SUCCESS").to_dict(), 200
    except AmplabsException as err:
        status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
        status[f"{email}|{data['cell_id']}"]['progress']['message'] = err.message
        logging.error(
            "User {email} Action UPLOAD_FILE error PARSING_ERROR".format(email=email))
        return Response(400, "BAD REQUEST").to_dict(), 400
    except KeyError as err:
        print(err)
        if 'not present' in err.args[0]:
            status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
            status[f"{email}|{data['cell_id']}"]['progress']['message'] = err.args[0]
        logging.error(
            "User {email} Action UPLOAD_FILE error KEY_ERROR".format(email=email))
        return Response(500, "INTERNAL SERVER ERROR").to_dict(), 500
    except Exception as err:
        status[f"{email}|{data['cell_id']}"]['progress']['percentage'] = -1
        status[f"{email}|{data['cell_id']}"]['progress']['message'] = "READ FILE FAILED"
        logging.error(
            "User {email} Action UPLOAD_FILE error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "READ FILE FAILED").to_dict(), 500


@with_authentication(allow_public=True)
def download_cycle_timeseries(cell_id):
    email = g.user
    try:
        memory_file = BytesIO()
        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = datetime.datetime.now()
        status, detail, * \
            resp = download_cycle_timeseries_service(
                cell_id[0], email, dashboard_id)
        if resp:
            with zipfile.ZipFile(memory_file, 'w') as zf:
                zip_info = zipfile.ZipInfo(
                    f"{cell_id[0]}_cycle_timeseries.csv")
                zip_info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = datetime.datetime.now()
            logging.info("User {email} Action DOWNLOAD_CYCLE_TIMESERIES file {filename} size {size} type CYCLE_TIMESERIES download_time {time}".format(
                email=email, filename=f"{cell_id[0]}_cycle_timeseries.csv", 
                    size=size, time=(end_time-start_time).total_seconds()*1000))
            return send_file(memory_file, attachment_filename=f"{cell_id[0]}_cycle_timeseries.zip", as_attachment=True)
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(
            "User {email} Action DOWNLOAD_CYCLE_TIMESERIES error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def download_tri_data():

    def get_total_bytes(fileName):
        result = s3_client.list_objects(Bucket=TRI_BUCKET_NAME)
        for item in result['Contents']:
            if item['Key'] == fileName:
                return item['Size']

    def get_object(fileName, total_bytes):
        if total_bytes > 1000000:
            return get_object_range(fileName, total_bytes)
        return s3_client.get_object(Bucket=TRI_BUCKET_NAME, Key=fileName)['Body'].read()

    def get_object_range(fileName, total_bytes):
        offset = 0
        while total_bytes > 0:
            end = offset + 999999 if total_bytes > 1000000 else ""
            total_bytes -= 1000000
            byte_range = 'bytes={offset}-{end}'.format(offset=offset, end=end)
            offset = end + 1 if not isinstance(end, str) else None
            yield s3_client.get_object(Bucket=TRI_BUCKET_NAME, Key=fileName, Range=byte_range)['Body'].read()

    try:
        email = g.user
        fileName = request.args.get("file")
        total_bytes = get_total_bytes(fileName)
        logging.info("User {email} Action DOWNLOAD_TRI_DATA: {fileName}".format(email=email, fileName=fileName))
        return res(
        get_object(fileName, total_bytes),
        mimetype='application/zip',
        headers={"Content-Disposition": "attachment;filename=test.txt"}
    )

    except Exception as err:
        logging.error(
           "User {email} Action DOWNLOAD_TRI_DATA: {fileName}".format(email=email, fileName=fileName))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def download_cycle_data(cell_id):
    email = g.user
    try:
        memory_file = BytesIO()
        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = datetime.datetime.now()
        status, detail, * \
            resp = download_cycle_data_service(cell_id[0], email, dashboard_id)
        if resp:
            with zipfile.ZipFile(memory_file, 'w') as zf:
                zip_info = zipfile.ZipInfo(f"{cell_id[0]}_cycle.csv")
                zip_info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = datetime.datetime.now()
            logging.info("User {email} Action DOWNLOAD_CYCLE_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                email=email, filename=f"{cell_id[0]}_cycle.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return send_file(memory_file, attachment_filename=f"{cell_id[0]}_cycle.zip", as_attachment=True)
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(
            "User {email} Action DOWNLOAD_CYCLE_DATA error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def get_cycle_data_json(cell_id):
    try:
        email = g.user
        dashboard_id = request.args.to_dict().get('dashboard_id')
        status, detail, * \
            resp = download_cycle_data_service(cell_id[0], email, dashboard_id)
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
        status, detail, * \
            resp = download_cycle_timeseries_service(
                cell_id[0], email, dashboard_id)
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
        status, detail, * \
            resp = download_abuse_timeseries_service(
                cell_id[0], email, dashboard_id)
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
        logging.error(
            "User {email} Action DOWNLOAD_ABUSE_TIMESERIES error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def get_abuse_timeseries_json(cell_id):
    try:
        email = g.user
        dashboard_id = request.args.to_dict().get('dashboard_id')
        status, detail, * \
            resp = download_abuse_timeseries_service(
                cell_id[0], email, dashboard_id)
        if resp:
            resp[0] = resp[0].to_dict('records')
        return Response(status, detail, resp).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
def download_timeseries_plot_data():
    email = g.user
    try:
        data = request.json
        memory_file = BytesIO()
        start_time = datetime.datetime.now()
        status, detail, * \
            resp = download_timeseries_plot_data_service(data, email)
        if resp:
            with zipfile.ZipFile(memory_file, 'w') as zf:
                zip_info = zipfile.ZipInfo("timeseries_plot.csv")
                zip_info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = datetime.datetime.now()
            logging.info("User {email} Action DOWNLOAD_TIMESERIES_PLOT_DATA file {filename} size {size} type TIMESERIES_DATA download_time {time}".format(
                email=g.user, filename="timeseries_plot.csv", size=size, 
                    time=(end_time-start_time).total_seconds()*1000))
            return send_file(memory_file, attachment_filename="timeseries_plot.zip", as_attachment=True)
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(
            "User {email} Action DOWNLOAD_TIMESERIES_PLOT_DATA error UNKNOWN".format(email=g.user))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
def download_stats_plot_data():
    email = g.user
    try:
        data = request.json
        memory_file = BytesIO()
        start_time = datetime.datetime.now()
        status, detail, *resp = download_stats_plot_data_service(data, email)
        if resp:
            with zipfile.ZipFile(memory_file, 'w') as zf:
                zip_info = zipfile.ZipInfo("stats_plot.csv")
                zip_info.compress_type = zipfile.ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = datetime.datetime.now()
            logging.info("User {email} Action DOWNLOAD_STATS_PLOT_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                email=g.user, filename="stats_plot.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return send_file(memory_file, attachment_filename="stats_plot.zip", as_attachment=True)
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(
            "User {email} Action DOWNLOAD_STATS_PLOT_DATA error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500
