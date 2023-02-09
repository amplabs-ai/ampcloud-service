from app.response import Response
import logging
from app.archive_constants import TEST_TYPE, display_names


def get_display_timeseries(test):
    try:
        if test == TEST_TYPE.CYCLE.value:
            records = display_names['cycle_timeseries']
        else:
            records = display_names['abuse_timeseries']
        return Response(200,"detail",records=records).to_dict(),200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


def get_display_cycle():
    try:
        records = display_names['cycle']
        return Response(200,"detail",records=records).to_dict(),200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500