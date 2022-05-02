import uuid
import threading

import pandas as pd
from app.aio import GAReader
from app.archive_cell import ArchiveCell
from app.archive_constants import LABEL, TEST_TYPE
from flask import request, jsonify
from app.response import Response

from app.model import ArchiveOperator
# Routes
"tracker -> msg"
global ga_status
ga_status = {}
"tracker -> id"
global source
source = {}

def finish(tracker):
    if tracker in ga_status:
        ga_status[tracker] = "FINISHED"
        return {"tracker": tracker, "dataset_id": source[tracker]}, 200
    return {"tracker": "not found", "dataset_id": source.get(tracker)}, 200


def ga_finish(tracker, cell, ga_status):
    print("Working on", tracker)
    print("Cell", cell)
    print("STATUS", ga_status)
    print("STATUS OF TRACKER", ga_status[tracker])
    ArchiveOperator().add_cell_to_db(cell)
    ga_status[tracker] = "FINISHED"


def ga_meta_finish(tracker, cell, status):
    print("Working on", tracker)
    print("Cell", cell)
    print("STATUS", status)
    print("STATUS OF TRACKER", status[tracker])
    ArchiveOperator().add_meta_to_db(cell)


def ga_data_finish(tracker, cell, status):
    print("Working on", tracker)
    print("Cell", cell)
    print("STATUS", status)
    print("STATUS OF TRACKER", status[tracker])
    ArchiveOperator().add_ts_to_db(cell)


def ga_publish(dataset_id):
    try:
        body = request.json
        token = body.get('token')
        tracker = str(uuid.uuid4())
        ga_status[tracker] = "STARTED"
        source[tracker] = dataset_id
        gareader = GAReader(token)
        metadata, columns = gareader.read_metadata(int(dataset_id))
        if not metadata:
            return jsonify(
                {"message": "object is unreadable, missing a field or incorrect token", "dataset_id": dataset_id})
        cell_id = metadata[LABEL.CELL_ID.value]

        # Launch task into new thread
        ga_status[tracker] = "IN_PROGRESS"
        data = gareader.read_data(int(dataset_id), columns)
        if not data:
            return jsonify(
                {"message": "object is unreadable, missing a field or incorrect token", "dataset_id": dataset_id})
        data[LABEL.CELL_ID.value] = cell_id
        data = pd.DataFrame(data=data, columns=data.keys())
        cell = ArchiveCell(cell_id,
                        test_type=TEST_TYPE.CYCLE.value,
                        metadata=metadata,
                        data=data)

        threading.Thread(target=ga_finish, name="data_thread",
                        args=(tracker, cell, ga_status)).start()
        # # Add something from metadata into response
        return jsonify(
            {"tracker": tracker, "dataset_id": dataset_id, "token": token})
    except Exception as err:
        return Response(500, "INTERNAL SERVER ERROR").to_dict(), 500


def ga_publish_status(tracker):
    if tracker in ga_status and tracker in source:
        return jsonify(
            {"status": ga_status[tracker], "dataset_id": source[tracker], "tracker": tracker})
    return jsonify({"status": "Unknown Tracker ID",
                    "dataset_id": "Unknown", "tracker": "Unknown"})