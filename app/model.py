import os
from typing import Dict, List, NoReturn
from pandas.core.frame import DataFrame
from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    TEXT,
    Float,
    select,
)
from sqlalchemy.ext.declarative import declarative_base
import pandas as pd
from sqlalchemy.orm.query import Query
from sqlalchemy.sql.sqltypes import FLOAT, TIMESTAMP
from .archive_constants import (LABEL, DEGREE, OUTPUT_LABELS, SLASH,
                               ARCHIVE_TABLE, CELL_LIST_FILE_NAME, TEST_DB_URL)
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker

# Imported for type suggestion
from .archive_cell import ArchiveCell
Model = declarative_base()


class AbuseMeta(Model):
    """
    Abuse Metadata
    """
    __tablename__ = ARCHIVE_TABLE.ABUSE_META.value
    index = Column(Integer, primary_key=True)
    cell_id = Column(TEXT, nullable=False)
    temperature = Column(Float, nullable=True)
    thickness = Column(Float, nullable=True)
    v_init = Column(Float, nullable=True)
    indentor = Column(Float, nullable=True)
    nail_speed = Column(Float, nullable=True)

class AbuseTimeSeries(Model):
    """
    Abuse Timeseries 
    """
    __tablename__ = ARCHIVE_TABLE.ABUSE_TS.value
    index = Column(Integer, primary_key=True)
    axial_d = Column(Float, nullable=True)
    axial_f = Column(FLOAT, nullable=True)
    v = Column(FLOAT, nullable=True)
    norm_d = Column(Float, nullable=True)
    strain = Column(Float, nullable=True)
    pos_terminal_temperature = Column(Float, nullable=True)
    neg_terminal_temperature = Column(Float, nullable=True)
    left_bottom_temperature = Column(Float, nullable=True)
    right_bottom_temperature = Column(Float, nullable=True)
    above_punch_temperature = Column(Float, nullable=True)
    below_punch_temperature = Column(Float, nullable=True)
    test_time = Column(Float, nullable=True)
    cell_id = Column(TEXT, nullable=False)

    def to_dict(self)->Dict:
        """
        Return a dictionary of Abuse Timeseries

        :return: Dict containing abuse timeseries
        :rtype: Dict
        """
        return {
            "index": self.index,
            "axial_d": self.axial_d,
            "axial_f": self.axial_f,
            "v": self.v,
            "strain": self.strain,
            "temp_1": self.temp_1,
            "temp_2": self.temp_2,
            "temp_3": self.temp_3,
            "temp_4": self.temp_4,
            "temp_5": self.temp_5,
            "temp_6": self.temp_6,
            "test_time": self.test_time,
            "cell_id": self.cell_id
        }


class CellMeta(Model):
    """
    Cell Metadata
    """
    __tablename__ = ARCHIVE_TABLE.CELL_META.value
    index = Column(Integer, primary_key=True)
    cell_id = Column(TEXT, nullable=False)
    anode = Column(TEXT, nullable=True)
    cathode = Column(TEXT, nullable=True)
    source = Column(TEXT, nullable=True)
    ah = Column(BigInteger, nullable=True)
    form_factor = Column(TEXT, nullable=True)
    test = Column(TEXT, nullable=True)
    mapping = Column(TEXT, nullable=True)
    tester = Column(TEXT, nullable=True)

    def to_dict(self)->Dict:
        """
        Return a dictionary of Cell Metadata

        :return: Dict containing cell metadata
        :rtype: Dict
        """
        return {
            "index": self.index,
            "cell_id": self.cell_id,
            "anode": self.anode,
            "cathode": self.cathode,
            "source": self.source,
            "ah": self.ah,
            "form_factor": self.form_factor,
            "test": self.test,
            "mapping": self.mapping,
            "tester": self.tester
        }

    @staticmethod
    def columns()->List[str]:
        """
        Cell Metadata columns

        :return: List of columns expected in the cell metadata table
        :rtype: List[str]
        """
        return [
            "index", "cell_id", "anode", "cathode", "source", "ah", "form_factor",
            "test", "tester"
        ]


class CycleMeta(Model):
    """
    Cycle Metadata
    """
    __tablename__ = ARCHIVE_TABLE.CYCLE_META.value
    index = Column(Integer, primary_key=True)
    temperature = Column(Float, nullable=True)
    soc_max = Column(Float, nullable=True)
    soc_min = Column(Float, nullable=True)
    v_max = Column(Float, nullable=True)
    v_min = Column(Float, nullable=True)
    crate_c = Column(Float, nullable=True)
    crate_d = Column(Float, nullable=True)
    cell_id = Column(TEXT, nullable=False)

    def to_dict(self)->Dict:
        """
        Create a dictionary of Cycle metadata

        :return: Dict of Cycle metadata
        :rtype: Dict
        """
        return {
            "index": self.index,
            "temperature": self.temperature,
            "soc_max": self.soc_max,
            "soc_min": self.soc_min,
            "v_max": self.v_max,
            "v_min": self.v_min,
            "crate_c": self.crate_c,
            "crate_d": self.crate_d,
            "cell_id": self.cell_id
        }


class CycleStats(Model):
    """
    Cycle Statistic
    """
    __tablename__ = ARCHIVE_TABLE.CYCLE_STATS.value
    index = Column(Integer, primary_key=True)
    v_max = Column(Float, nullable=True)
    v_min = Column(Float, nullable=True)
    ah_c = Column(Float, nullable=True)
    ah_d = Column(Float, nullable=True)
    e_c = Column(Float, nullable=True)
    e_d = Column(Float, nullable=True)
    i_max = Column(Float, nullable=True)
    i_min = Column(Float, nullable=True)
    v_c_mean = Column(Float, nullable=True)
    v_d_mean = Column(Float, nullable=True)
    e_eff = Column(Float, nullable=True)
    ah_eff = Column(Float, nullable=True)
    cycle_index = Column(Integer, nullable=True)
    test_time = Column(Float, nullable=True)
    cell_id = Column(TEXT, nullable=False)


class CycleTimeSeries(Model):
    """
    Cycle Timeseries
    """
    __tablename__ = ARCHIVE_TABLE.CYCLE_TS.value
    index = Column(Integer, primary_key=True)
    i = Column(Float, nullable=True)
    v = Column(Float, nullable=True)
    ah_c = Column(Float, nullable=True)
    ah_d = Column(Float, nullable=True)
    e_c = Column(Float, nullable=True)
    e_d = Column(Float, nullable=True)
    temp_1 = Column(Float, nullable=True)
    temp_2 = Column(Float, nullable=True)
    cycle_time = Column(Float, nullable=True)
    date_time = Column(TIMESTAMP, nullable=True)
    cycle_index = Column(Integer, nullable=True)
    test_time = Column(Float, nullable=True)
    cell_id = Column(TEXT, nullable=False)

    def to_dict(self)->Dict:
        """
        Return a dict of Cycle timeseries data

        :return: Dict containing cycle timeseries
        :rtype: Dict
        """
        return {
            "index": self.index,
            "i": self.i,
            "v": self.v,
            "ah_c": self.ah_c,
            "ah_d": self.ah_d,
            "temp_1": self.temp_1,
            "temp_2": self.temp_2,
            "e_c": self.e_c,
            "e_d": self.e_d,
            "cycle_time": self.cycle_time,
            "date_time": self.date_time,
            "cycle_index": self.cycle_index,
            "test_time": self.test_time,
            "cell_id": self.cell_id
        }


"""
Archive Operator
- Manages objects in Archive
- Supports Create/Read/Update/Delete of ArchiveCells
- For example, methods accept ArchiveCell(s) as input and provides ArchiveCell(s) as output 
- Performs all necessary SQL functions related to Archive db
"""


class ArchiveOperator:
    def __init__(self, config={}):
        """
        Archive Operator        

        :param config: SQLAlchemy configuration dict, defaults to {}
        :type config: dict, optional
        """
        url = os.getenv('DATABASE_CONNECTION', TEST_DB_URL)

        engine = create_engine(url, **config)
        Model.metadata.create_all(engine)
        self.session = scoped_session(
            sessionmaker(autocommit=False, autoflush=False, bind=engine))

    def add_cell_to_db(self, cell:ArchiveCell)->NoReturn:
        """
        Add a singular ArchiveCell to an archive

        :param cell: A cell to add to the DB
        :type cell: ArchiveCell
        :return: Nothing is returned
        :rtype: NoReturn
        """
        df_cell_md = cell.cellmeta
        df_test_meta_md = cell.testmeta
        df_stats, df_timeseries = cell.stat
        df_cell_md.to_sql(cell.cell_meta_table,
                          con=self.session.bind,
                          if_exists="append",
                          chunksize=1000,
                          index=False)
        df_timeseries.to_sql(cell.test_ts_table,
                             con=self.session.bind,
                             if_exists='append',
                             chunksize=1000,
                             index=False)
        df_test_meta_md.to_sql(cell.test_meta_table,
                               con=self.session.bind,
                               if_exists='append',
                               chunksize=1000,
                               index=False)
        if cell.test_stats_table:
            df_stats.to_sql(ARCHIVE_TABLE.CYCLE_STATS.value,
                            con=self.session.bind,
                            if_exists='append',
                            chunksize=1000,
                            index=False)

    def add_cells_to_db(self, cell_list:List[ArchiveCell])->bool:
        """
        Add all of the cells to an archive

        :param cell_list: A List of ArchiveCells to add to the archive
        :type cell_list: List[ArchiveCell]
        :return: Returns True
        :rtype: bool
        """
        for cell in cell_list:
            self.add_cell_to_db(cell)
        return True

    def remove_cell_from_table(self, table:Model, cell_id:str)->bool:
        """
        Remove cell from a Table

        :param table: SQLAlchemy Model of a table to remove from
        :type table: Model
        :param cell_id: String Identifier of cell to remove
        :type cell_id: str
        :return: Nothing is returned
        :rtype: NoReturn
        """
        self.session.query(table).filter(table.cell_id == cell_id).delete()
        self.session.commit()
        return True

    def remove_cell_from_archive(self, cell_id:str)->bool:
        """
        Remove a cell from the archive. This means all of the tables in the archive
        #TODO Can this fail? 
        #TODO Can the removed tables be programmed? Perhaps keep a list of all models?

        :param cell_id: String identifier 
        :type cell_id: str
        :return: Nothing is returned
        :rtype: NoReturn
        """        
        self.remove_cell_from_table(CellMeta, cell_id)
        self.remove_cell_from_table(CycleMeta, cell_id)
        self.remove_cell_from_table(CycleStats, cell_id)
        self.remove_cell_from_table(CycleTimeSeries, cell_id)
        self.remove_cell_from_table(AbuseMeta, cell_id)
        self.remove_cell_from_table(AbuseTimeSeries, cell_id)
        return True

    """
    getters
    """

    def get_df_cycle_ts_with_cell_id(self, cell_id:str)->DataFrame:
        """
        Get dataframe of cycle timeseries from an individual cell

        :param cell_id: String Identifier of a cell
        :type cell_id: str
        :return: A DataFrame containing a cell's cycle timeseries data
        :rtype: DataFrame
        """
        sql = self.session.query(
            CycleTimeSeries.date_time.label(OUTPUT_LABELS.DATE_TIME.value),
            CycleTimeSeries.test_time.label(OUTPUT_LABELS.TEST_TIME.value),
            CycleTimeSeries.cycle_index.label(OUTPUT_LABELS.CYCLE_INDEX.value),
            CycleTimeSeries.i.label(OUTPUT_LABELS.CURRENT.value),
            CycleTimeSeries.v.label(OUTPUT_LABELS.VOLTAGE.value),
            CycleTimeSeries.ah_c.label(OUTPUT_LABELS.CHARGE_CAPACITY.value),
            CycleTimeSeries.ah_d.label(OUTPUT_LABELS.DISCHARGE_CAPACITY.value),
            CycleTimeSeries.e_c.label(OUTPUT_LABELS.CHARGE_ENERGY.value),
            CycleTimeSeries.e_d.label(OUTPUT_LABELS.DISCHARGE_ENERGY.value),
            CycleTimeSeries.temp_1.label(OUTPUT_LABELS.ENV_TEMPERATURE.value),
            CycleTimeSeries.temp_2.label(
                OUTPUT_LABELS.CELL_TEMPERATURE.value)).filter(
                    CycleTimeSeries.cell_id == cell_id).statement
        return pd.read_sql(sql, self.session.bind).round(DEGREE)

    # CELL

    def get_df_cell_meta_with_id(self, cell_id:str)->DataFrame:
        """
        Get a cell's metadata as a DataFrame

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a DataFrame of a cell's metadata
        :rtype: DataFrame
        """
        return self.get_df_with_id(CellMeta, cell_id)

    def get_all_cell_meta(self)->List:
        """
        Get a list of all cells metadata

        :return: Return a DataFrame of all the cells metadata
        :rtype: DataFrame
        """
        return self.get_all_data_from_table(CellMeta)

    def get_all_cell_meta_with_id(self, cell_id:str)->List:
        """
        Get a list of all metadata for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a List of all the metadata for a cell
        :rtype: List
        """
        return self.get_all_data_from_table_with_id(CellMeta, cell_id)

    # ABUSE

    def get_df_abuse_meta_with_id(self, cell_id:str)->DataFrame:
        """
        Get a dataframe containing all abuse metadata for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Returns a DataFrame of all the abuse metadata for a cell
        :rtype: DataFrame
        """
        return self.get_df_with_id(AbuseMeta, cell_id)

    def get_all_abuse_meta(self)->List:
        """
        Get a list of all abuse metadata

        :return: Returns a List of all abuse metadata
        :rtype: List
        """
        return self.get_all_data_from_table(AbuseMeta)

    def get_all_abuse_meta_with_id(self, cell_id:str)->List:
        """
        Get a list of all abuse metadata for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Returns a List of all abuse metadata
        :rtype: List
        """
        return self.get_all_data_from_table_with_id(AbuseMeta, cell_id)

    def get_all_abuse_ts(self)->List:
        """
        Get a list of all abuse timeseries data

        :return: Returns a list of all abuse timeseries data
        :rtype: List
        """
        return self.get_all_data_from_table(AbuseTimeSeries)

    def get_all_abuse_ts_with_id(self, cell_id:str)->List:
        """
        Get a list of all abuse timeseries data for a cell

        :param cell_id: String Identifier
        :type cell_id: str
        :return: Return a List of abuse timeseries data for a cell
        :rtype: List
        """
        return self.get_all_data_from_table_with_id(AbuseTimeSeries, cell_id)

    # CYCLE

    def get_df_cycle_meta_with_id(self, cell_id:str)->DataFrame:
        """
        Get a DataFrame of cycle metadata for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a DataFrame of a cell's cycle data
        :rtype: DataFrame
        """
        return self.get_df_with_id(CycleMeta, cell_id)

    def get_all_cycle_meta(self)->List:
        """
        Get a List of all cycle metadata

        :return: Return a List of all cycle metadata
        :rtype: List
        """
        return self.get_all_data_from_table(CycleMeta)

    def get_all_cycle_meta_with_id(self, cell_id:str)->List:
        """
        Get a list of all cycle metadata for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a List of cycle metadata for a cell
        :rtype: List
        """
        return self.get_all_data_from_table_with_id(CycleMeta, cell_id)

    def get_all_cycle_ts(self)->List:
        """
        Get a List of all cycle timeseries data

        :return: Return a List of all cycle timeseries data
        :rtype: List
        """
        return self.get_all_data_from_table(CycleTimeSeries)

    def get_all_cycle_ts_with_id(self, cell_id:str)->List:
        """
        Get a List of all cycle timeseries for a cell

        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a List of all cycle timeseries data for a cell
        :rtype: List
        """ 
        return self.get_all_data_from_table_with_id(CycleTimeSeries, cell_id)

    # GENERAL SQL

    def get_df_with_id(self, table: Model, cell_id: str)->DataFrame:
        """
        General function for retrieving a cell's data from a model as a DataFrame. 
        **Data is Rounded**

        :param table: Model from which to retrieve cell data from
        :type table: Model
        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a DataFrame of a cell's data from the given Model
        :rtype: DataFrame
        """
        return pd.read_sql(
            self.select_table_with_id(table, cell_id).statement,
            self.session.bind).round(DEGREE)

    # GENERAL ORM

    def get_all_data_from_table(self, table:Model)->List:
        """
        General ORM function to retrieve all the data from a given Model

        :param table: A SQLAlchemy ORM Model  
        :type table: Model
        :return: Returns a List of the data
        :rtype: List
        """
        return self.select_table(table).all()

    def get_all_data_from_table_with_id(self, table:Model, cell_id:str)->List:
        """
        General ORM Function to retrieve all the data about a given cell from a given Model.

        :param table: A SQLAlchemy ORM Model
        :type table: Model
        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a List of all data about a given cell from a given table
        :rtype: List
        """
        return self.select_table_with_id(table, cell_id).all()

    # BASIC

    def select_table(self, table:Model)->Query:
        """
        Select a table in a given Model's session. 
        #TODO Should we make these functions dunder functions since they're private to the Archive Manager?         

        :param table: A SQLAlchemy ORM Model
        :type table: Model
        :return: A Query object in the given Model's DB session
        :rtype: Query
        """
        return self.session.query(table)

    def select_table_with_id(self, table:Model, cell_id:str)->Query:
        """
        Select a given cell's data in a given Model's table

        :param table: A SQLAlchemy ORM Model
        :type table: Model
        :param cell_id: String Identifier for a cell
        :type cell_id: str
        :return: Return a Query object in the given model's DB session filtering for a given cell
        :rtype: Query
        """
        return self.session.query(table).filter(table.cell_id == cell_id)
