from typing import List, NoReturn, Tuple
from app.model import ArchiveOperator, CellMeta
from app.aio import ArchiveExporter
from app.archive_cell import ArchiveCell
from flask import request
import pandas as pd
from app.archive_constants import (LABEL, DEGREE, SLASH,
                                       CELL_LIST_FILE_NAME, TEST_TYPE, FORMAT)

# Routes


def root()->Tuple[str, int]:
    return 'Hello Battery Archive!', 200


def liveness()->Tuple[str, int]:
    return "Alive", 200


def readiness()->Tuple[str, int]:
    return "Ready", 200


def get_cells()->Tuple[str, int]:
    """get_cell
    Gets all cells
    :rtype: list of Cell
    """

    ao = ArchiveOperator()
    archive_cells = ao.get_all_cell_meta()
    result = [cell.to_dict() for cell in archive_cells]
    return result, 200


def get_cell_with_id(cell_id:str)->Tuple[List[dict], int]:
    ao = ArchiveOperator()
    archive_cells = ao.get_all_cell_meta_with_id(cell_id)
    result = [cell.to_dict() for cell in archive_cells]
    return result, 200


def get_test(test_name:str)->Tuple[List[dict], int]:
    """
    """
    ao = ArchiveOperator()
    if test_name == TEST_TYPE.CYCLE.value:
        archive_cells = ao.get_all_cycle_meta()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200
    if test_name == TEST_TYPE.ABUSE.value:
        archive_cells = ao.get_all_abuse_meta()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200


def get_ts(test_name:str)->Tuple[List[dict], int]:
    if test_name == TEST_TYPE.CYCLE.value:
        archive_cells = ArchiveOperator().get_all_cycle_ts()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200
    if test_name == TEST_TYPE.ABUSE.value:
        archive_cells = ArchiveOperator().get_all_abuse_ts()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200


def get_test_ts_with_id(cell_id:str, test_name:str)->Tuple[List[dict], int]:
    if test_name == TEST_TYPE.CYCLE.value:
        archive_cells = ArchiveOperator().get_all_cycle_ts_with_id(cell_id)
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200
    if test_name == TEST_TYPE.ABUSE.value:
        archive_cells = ArchiveOperator().get_all_abuse_ts_with_id()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200


def get_meta_with_id(cell_id:str, test_name:str)->Tuple[List[dict], int]:
    if test_name == TEST_TYPE.CYCLE.value:
        archive_cells = ArchiveOperator().get_all_cycle_meta_with_id(cell_id)
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200
    if test_name == TEST_TYPE.ABUSE.value:
        archive_cells = ArchiveOperator().get_all_abuse_meta_with_id()
        result = [cell.to_dict() for cell in archive_cells]
        return result, 200


def add_cell()->Tuple[str, int]:
    body = request.json
    path = body.get('path')
    print(path)
    if import_cells_xls_to_db(path):
        return "Upload Successful", 200
    return "Upload Failed", 200


# EXPORTERS


def export_cycle_cells_to_fmt(cell_list_path,
                              output_path: str,
                              fmt: str = "csv")->NoReturn:
    #TODO: This implies cell_list must be xlsx, this can be written in CSV
    df_excel = pd.read_excel(cell_list_path + CELL_LIST_FILE_NAME)
    #TODO: Refactor this to a join instead of looping slowly
    for i in df_excel.index:
        cell_id = df_excel[LABEL.CELL_ID.value][i]
        df = ArchiveOperator().get_df_cell_meta_with_id(cell_id)
        if not df.empty:
            if fmt == FORMAT.CSV.value:
                export_cycle_meta_data_with_id_to_fmt(cell_id, output_path,
                                                      FORMAT.CSV.value)
                export_cycle_ts_data_csv(cell_id, output_path)
            if fmt == FORMAT.FEATHER.value:
                export_cycle_meta_data_with_id_to_fmt(cell_id, output_path,
                                                      FORMAT.FEATHER.value)
                export_cycle_ts_data_feather(cell_id, output_path)


"""
generate_cycle_data queries data from the database and exports to csv

:param cell_id: Absolute Path to the cell_list directory
:param path: Path to the cell_list directory
:return: Boolean True if method succeeds False if method fails
"""


def export_cycle_meta_data_with_id_to_fmt(cell_id: str,
                                          out_path: str,
                                          fmt: str = "csv")->str:
    if fmt == FORMAT.CSV.value:
        return ArchiveExporter.write_to_csv(
            ArchiveOperator().get_df_cycle_meta_with_id(cell_id), cell_id,
            out_path, "cycle_data")
    if fmt == FORMAT.FEATHER.value:
        return ArchiveExporter.write_to_feather(
            ArchiveOperator().get_df_cycle_meta_with_id(cell_id), cell_id,
            out_path, "cycle_data")


"""
generate_timeseries_data queries data from the database and exports to csv

:param session: Database session that 
:param cell_id: Absolute Path to the cell_list directory
:param path: Path to the cell_list directory
:return: Boolean True if successful False if method fails
"""


def export_cycle_ts_data_csv(cell_id: str, path: str)->str:
    return ArchiveExporter.write_to_csv(
        ArchiveOperator().get_df_cycle_ts_with_cell_id(cell_id), cell_id, path,
        "timeseries_data")


def export_cycle_ts_data_feather(cell_id: str, path: str)->str:
    return ArchiveExporter.write_to_feather(
        ArchiveOperator().get_df_cycle_ts_with_cell_id(cell_id), cell_id, path,
        "timeseries_data")


# Importers


# def import_cells_xls_to_db(cell_list_path):
#     df = pd.read_excel(cell_list_path + CELL_LIST_FILE_NAME)
#     cells = []
#     for i in df.index:
#         cell = ArchiveCell(cell_id=df[LABEL.CELL_ID.value][i],
#                            test_type=str(df[LABEL.TEST.value][i]),
#                            file_id=df[LABEL.FILE_ID.value][i],
#                            file_type=str(df[LABEL.FILE_TYPE.value][i]),
#                            tester=df[LABEL.TESTER.value][i],
#                            file_path=cell_list_path +
#                            df[LABEL.FILE_ID.value][i] + SLASH,
#                            metadata=df.iloc[i])
#         cells.append(cell)
#     return ArchiveOperator().add_cells_to_db(cells)


def import_cells_xls_to_db(cell_list_path:List[str])->bool:
    return add_df_to_db(pd.read_excel(cell_list_path + CELL_LIST_FILE_NAME),
                        cell_list_path)


def import_cells_feather_to_db(cell_list_path:List[str])->bool:
    return add_df_to_db(pd.read_feather(cell_list_path + CELL_LIST_FILE_NAME),
                        cell_list_path)


def add_df_to_db(df, cell_list_path:List[str])->bool:
    cells = []
    for i in df.index:
        cell = ArchiveCell(cell_id=df[LABEL.CELL_ID.value][i],
                           test_type=str(df[LABEL.TEST.value][i]),
                           file_id=df[LABEL.FILE_ID.value][i],
                           file_type=str(df[LABEL.FILE_TYPE.value][i]),
                           tester=df[LABEL.TESTER.value][i],
                           file_path=cell_list_path +
                           df[LABEL.FILE_ID.value][i] + SLASH,
                           metadata=df.iloc[i])
        cells.append(cell)
    return ArchiveOperator().add_cells_to_db(cells)


def update_cycle_cells(cell_list_path:List[str])->bool:
    df_excel = pd.read_excel(cell_list_path + CELL_LIST_FILE_NAME)
    ao = ArchiveOperator()
    for i in df_excel.index:
        cell_id = df_excel[LABEL.CELL_ID.value][i]
        df = ArchiveOperator().get_df_cell_meta_with_id(cell_id)
        if df.empty:
            print("cell:" + cell_id + " not found")
            continue
        ao.remove_cell_from_archive(cell_id)
    import_cells_xls_to_db(cell_list_path)
    return True