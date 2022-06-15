from app.response import Response
from app.archive_constants import display_names

def get_display_timeseries():
    try:
        records = display_names['timeseries']
        return Response(200,"detail",records).to_dict(),200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500

def get_display_cycle():
    try:
        records = display_names['cycle']
        return Response(200,"detail",records).to_dict(),200
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500