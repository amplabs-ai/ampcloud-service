from builtins import float, print
from time import time
import traceback
from app.amplabs_exception.amplabs_exception import AmplabsException
from app.archive_constants import ENV, S3_DATA_BUCKET
from app.services.file_transfer_service import *
from app.utilities.s3_file_upload import add_df_to_s3, add_response_to_s3
from app.utilities.user_plan import set_user_plan
from app.utilities.with_authentication import with_authentication
from flask import  request, g
from app.response import Response
import logging
from io import BytesIO
from zipfile import ZIP_DEFLATED, ZipFile, ZipInfo
from flask import send_file
from app.utilities.aws_connection import s3_client
from app.utilities.file_status import _get_key_from_status_object, _set_status


@with_authentication()
@set_user_plan()
def init_file_upload():
    try:
        email = g.user
        data = request.get_json()
        status, detail, s3_url = init_file_upload_service(email, data)
        return Response(status, detail, url=s3_url).to_dict(), status
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
        start_time = time()
        template = _get_key_from_status_object(email,data['cell_id'],key="template")['template']
        df = file_data_read_service(tester, template, email, data['cell_id'], request.files.get('file'))
        end_time = time()
        read_time = end_time-start_time
        _set_status(email,data['cell_id'],percentage = 5)
        _set_status(email,data['cell_id'],step_key='READ FILE')
        file_data_process_service(data['cell_id'], email, df,tester)
        end_time = time()
        processing_time = end_time-start_time
        upload_time = processing_time + read_time
        size = float((df.memory_usage(index=True).sum())/1000)
        logging.info("User {email} Action UPLOAD_FILE file {file_name} size {size} read_time {read_time} processing_time {proc_time} upload_time {upload_time}".format
                    (email=email, file_name=f"{email}|{data['cell_id']}", size=size, read_time=read_time, 
                        proc_time=processing_time, upload_time=upload_time))
        return Response(200, "SUCCESS").to_dict(), 200
    except AmplabsException as err:
        _set_status(email,data['cell_id'],percentage = -1, message = err.message)
        logging.error(
            "User {email} Action UPLOAD_FILE error PARSING_ERROR".format(email=email))
        return Response(400, "BAD REQUEST").to_dict(), 400
    except KeyError as err:
        print(err)
        if 'not present' in err.args[0]:
            _set_status(email,data['cell_id'],percentage = -1, message = err.args[0])
        logging.error(
            "User {email} Action UPLOAD_FILE error KEY_ERROR".format(email=email))
        return Response(400, err.args[0]).to_dict(), 500
    except Exception as err:
        traceback.print_exc()
        _set_status(email,data['cell_id'],percentage = -1, message = "READ FILE FAILED")
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
        start_time = time()
        status, detail, * \
            resp = download_cycle_timeseries_service(
                cell_id[0], email, dashboard_id)
        if resp:
            response_url = add_df_to_s3(email, resp[0], cell_id[0], 'timeseries')
            return Response(status, detail, url = response_url).to_dict(), status
            with ZipFile(memory_file, 'w') as zf:
                zip_info = ZipInfo(
                    f"{cell_id[0]}_cycle_timeseries.csv")
                zip_info.compress_type = ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = time()
            logging.info("User {email} Action DOWNLOAD_CYCLE_TIMESERIES file {filename} size {size} type CYCLE_TIMESERIES download_time {time}".format(
                email=email, filename=f"{cell_id[0]}_cycle_timeseries.csv", 
                    size=size, time=end_time-start_time))
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
    try:
        email = g.user
        fileName = request.args.get("file")
        _uri = s3_client.generate_presigned_url('get_object', 
                                        Params = {'Bucket': S3_DATA_BUCKET, 'Key': f"tri/{fileName}"},ExpiresIn = 300)
        logging.info("User {email} Action DOWNLOAD_TRI_DATA: {fileName}".format(email=email, fileName=fileName))
        return Response(200,"Success",url=_uri).to_dict(),200
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
        start_time = time()
        status, detail, * \
            resp = download_cycle_data_service(cell_id[0], email, dashboard_id)
        if resp:
            response_url = add_df_to_s3(email, resp[0], cell_id[0], 'cycle')
            return Response(status, detail, url = response_url).to_dict(), status
            with ZipFile(memory_file, 'w') as zf:
                zip_info = ZipInfo(f"{cell_id[0]}_cycle.csv")
                zip_info.compress_type = ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = time()
            logging.info("User {email} Action DOWNLOAD_CYCLE_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                email=email, filename=f"{cell_id[0]}_cycle.csv", size=size, time=end_time-start_time))
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
        # if ENV == "production":
        if status == 200:
            result_response = Response(status, detail, records = resp).to_json()
            s3_url = add_response_to_s3(email,result_response)
            return Response(status, detail, url=s3_url).to_dict(), status
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
        # if ENV == "production":
        if status == 200:
            result_response = Response(status, detail, records = resp).to_json()
            s3_url = add_response_to_s3(email,result_response)
            return Response(status, detail, url=s3_url).to_dict(), status
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
        start_time = time()
        status, detail, * \
            resp = download_timeseries_plot_data_service(data, email)
        if resp:
            with ZipFile(memory_file, 'w') as zf:
                zip_info = ZipInfo("timeseries_plot.csv")
                zip_info.compress_type = ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = time()
            logging.info("User {email} Action DOWNLOAD_TIMESERIES_PLOT_DATA file {filename} size {size} type TIMESERIES_DATA download_time {time}".format(
                email=g.user, filename="timeseries_plot.csv", size=size, 
                    time=end_time-start_time))
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
        start_time = time()
        status, detail, *resp = download_stats_plot_data_service(data, email)
        if resp:
            with ZipFile(memory_file, 'w') as zf:
                zip_info = ZipInfo("stats_plot.csv")
                zip_info.compress_type = ZIP_DEFLATED
                zf.writestr(zip_info, resp[0].to_csv(
                    None, encoding='utf-8', index=False))
            memory_file.seek(0)
            size = float(len(memory_file.getvalue())/1000)
            end_time = time()
            logging.info("User {email} Action DOWNLOAD_STATS_PLOT_DATA file {filename} size {size} type CYCLE_DATA download_time {time}".format(
                email=g.user, filename="stats_plot.csv", size=size, time=end_time-start_time))
            return send_file(memory_file, attachment_filename="stats_plot.zip", as_attachment=True)
        else:
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(
            "User {email} Action DOWNLOAD_STATS_PLOT_DATA error UNKNOWN".format(email=email))
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication(allow_public=True)
def download_abuse_timeseries(cell_id):
    email = g.user
    try:
        memory_file = BytesIO()
        dashboard_id = request.args.to_dict().get('dashboard_id')
        start_time = time()
        status, detail, * \
            resp = download_abuse_timeseries_service(
                cell_id[0], email, dashboard_id)
        if resp:
            response_url = add_df_to_s3(email, resp[0], cell_id[0], 'timeseries')
            return Response(status, detail, url = response_url).to_dict(), status
            resp = make_response(resp[0].to_csv(index=False))
            resp.headers["Content-Disposition"] = "attachment; filename={}".format(
                f"{cell_id[0]}_abuse_timeseries.csv")
            resp.headers["Content-Type"] = "text/csv"
            end_time = time()
            size = float(resp.content_length/1000)
            logging.info("User {email} Action DOWNLOAD_ABUSE_TIMESERIES file {filename} size {size} type ABUSE_TIMESERIES download_time {time}".format(
                email=email, filename=f"{cell_id[0]}_abuse_timeseries.csv", size=size, time=(end_time-start_time).total_seconds()*1000))
            return resp
        else:
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
        # if ENV == "production":
        if status == 200:
            result_response = Response(status, detail, records = resp).to_json()
            s3_url = add_response_to_s3(email,result_response)
            return Response(status, detail, url=s3_url).to_dict(), status
        return Response(status, detail, resp).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500