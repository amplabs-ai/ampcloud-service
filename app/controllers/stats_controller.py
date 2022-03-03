from app.services.stats_service import *
from app.response import Response


def get_cycle_stats():
    status, detail, *records = get_cycle_stats_service()
    return Response(status, detail, records).to_dict(), status  


def get_cycle_stats_by_cell_id(cell_id):
    status, detail, *records = get_cycle_stats_by_cell_id_service(cell_id)
    return Response(status, detail, records).to_dict(), status