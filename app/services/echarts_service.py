from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator

def get_cycle_quantities_by_step_service(cell_id, step, email):
    try:
        ao = ArchiveOperator()
        archive_cells = ao.get_all_data_from_CQBS_query(cell_id, step, email)
        records = []
        series = {}

        for row in archive_cells:
            row = dict(row)
            if not series.get(row['series']):
                series[row['series']] = []
            series[row['series']].append(row)

        for key, value in series.items():
            records.append({"id": key, "source": value})

        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']

def get_energy_and_capacity_decay_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        archive_cells = ao.get_all_data_from_ECAD_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['series']):
                series[row['series']] = []
            series[row['series']].append(row)

        for key, value in series.items():
            records.append({"id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']

def get_efficiency_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        archive_cells = ao.get_all_data_from_Eff_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['series']):
                series[row['series']] = []
            series[row['series']].append(row)

        for key, value in series.items():
            records.append({"id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']

def get_compare_by_cycle_time_service(cell_id, email):
    try:
        ao = ArchiveOperator()
        archive_cells = ao.get_all_data_from_CCVC_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['series_2']):
                series[row['series_2']] = []
            series[row['series_2']].append(row)

        for key, value in series.items():
            records.append({"id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']