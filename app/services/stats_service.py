from app.model import CycleStats
from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator


def get_cycle_stats_service():
    ao = ArchiveOperator()
    archive_cells = ao.get_all_data_from_table(CycleStats)
    records = [cell.to_dict() for cell in archive_cells]
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records


def get_cycle_stats_by_cell_id_service(cell_id):
    ao = ArchiveOperator()
    archive_cells = ao.get_all_data_from_table_with_id(CycleStats, cell_id)
    records = [cell.to_dict() for cell in archive_cells]
    return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records