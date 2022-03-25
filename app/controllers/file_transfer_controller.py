from app.archive_constants import RESPONSE_MESSAGE
from app.services.file_transfer_service import *
from app.utilities.utils import status
from flask import make_response, request
from app.response import Response

def upload_file(tester):
    email = request.cookies.get("userId")
    status[email] = {}
    files=request.files.getlist("file")
    for file in files:
        status[email][file.filename] = 2
    file_data_upload_service(tester, files, email)
    return Response(200, RESPONSE_MESSAGE['PROCESS_COMPLETE'], status.get(email)).to_dict(), 200

def download_cycle_timeseries(cell_id):
    email = request.cookies.get("userId")
    df = download_cycle_timeseries_service(cell_id, email)
    resp = make_response(df.to_csv(index=False))
    resp.headers["Content-Disposition"] = "attachment; filename={}".format(f"{cell_id}_cycle_timeseries.csv")
    resp.headers["Content-Type"] = "text/csv"
    return resp

def download_cycle_data(cell_id):
    email = request.cookies.get("userId")
    df = download_cycle_data_service(cell_id, email)
    resp = make_response(df.to_csv(index=False))
    resp.headers["Content-Disposition"] = "attachment; filename={}".format(f"{cell_id}_cycle_data.csv")
    resp.headers["Content-Type"] = "text/csv"
    return resp



