import os
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
from sqlalchemy.sql.sqltypes import TIMESTAMP
from app.archive_constants import (DEGREE, OUTPUT_LABELS,
                               ARCHIVE_TABLE, DB_URL)
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from app.queries import *

Model = declarative_base()

class CellMeta(Model):
    __tablename__ = ARCHIVE_TABLE.CELL_META.value
    index = Column(Integer, primary_key=True)
    cell_id = Column(TEXT, nullable=False)
    anode = Column(TEXT, nullable=True)
    cathode = Column(TEXT, nullable=True)
    source = Column(TEXT, nullable=True)
    ah = Column(BigInteger, nullable=True)
    form_factor = Column(TEXT, nullable=True)
    test = Column(TEXT, nullable=True)
    tester = Column(TEXT, nullable=True)
    email = Column(TEXT, nullable=False)

    def to_dict(self):
        return {
            "index": self.index,
            "cell_id": self.cell_id,
            "anode": self.anode,
            "cathode": self.cathode,
            "source": self.source,
            "ah": self.ah,
            "form_factor": self.form_factor,
            "test": self.test,
            "tester": self.tester
        }

    @staticmethod
    def columns():
        return [
            "index", "cell_id", "anode", "cathode", "source", "ah", "form_factor",
            "test", "tester"
        ]


class CycleStats(Model):
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
    email = Column(TEXT, nullable=False)

    def to_dict(self):
        return {
            "index": self.index,
            "v_max": self.v_max,
            "v_min": self.v_min,
            "ah_c": self.ah_c,
            "ah_d": self.ah_d,
            "e_c": self.e_c,
            "e_d": self.e_d,
            "i_max": self.i_max,
            "i_min": self.i_min,
            "v_c_mean": self.v_c_mean,
            "v_d_mean": self.v_d_mean,
            "e_eff": self.e_eff,
            "ah_eff": self.ah_eff,
            "cycle_index": self.cycle_index,
            "test_time": self.test_time,
            "cell_id": self.cell_id
        }


class CycleTimeSeries(Model):
    __tablename__ = ARCHIVE_TABLE.CYCLE_TS.value
    index = Column(Integer, primary_key=True)
    i = Column(Float, nullable=True)
    v = Column(Float, nullable=True)
    ah_c = Column(Float, nullable=True)
    ah_d = Column(Float, nullable=True)
    e_c = Column(Float, nullable=True)
    e_d = Column(Float, nullable=True)
    env_temperature = Column(Float, nullable=True)
    cell_temperature = Column(Float, nullable=True)
    cycle_time = Column(Float, nullable=True)
    date_time = Column(TIMESTAMP, nullable=True)
    cycle_index = Column(Integer, nullable=True)
    test_time = Column(Float, nullable=True)
    cell_id = Column(TEXT, nullable=False)
    email = Column(TEXT, nullable=False)

    def to_dict(self):
        return {
            "index": self.index,
            "i": self.i,
            "v": self.v,
            "ah_c": self.ah_c,
            "ah_d": self.ah_d,
            "env_temperature": self.env_temperature,
            "cell_temperature": self.cell_temperature,
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
        url = "postgresql://mrs_test:App4ever#@ds-postgres.cczwnfd9o32m.ap-south-1.rds.amazonaws.com:5432/mrs_test"

        engine = create_engine(url, **config)
        Model.metadata.create_all(engine)
        self.session = scoped_session(
            sessionmaker(autocommit=False, autoflush=False, bind=engine))

    def commit(self):
        self.session.commit()

    def remove_cell_from_table(self, table, cell_id, email):
        self.session.query(table).filter(table.cell_id == cell_id, table.email == email).delete()

    def remove_cell_from_archive(self, cell_id, email):
        self.remove_cell_from_table(CellMeta, cell_id, email)
        self.remove_cell_from_table(CycleStats, cell_id, email)
        self.remove_cell_from_table(CycleTimeSeries, cell_id, email)


    """
    getters
    """

    def get_df_cycle_ts_with_cell_id(self, cell_id, email):
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
            CycleTimeSeries.env_temperature.label(OUTPUT_LABELS.ENV_TEMPERATURE.value),
            CycleTimeSeries.cell_temperature.label(
                OUTPUT_LABELS.CELL_TEMPERATURE.value)).filter(
                    CycleTimeSeries.cell_id == cell_id, CycleTimeSeries.email == email).statement
        return pd.read_sql(sql, self.session.bind).round(DEGREE)
    
    def get_df_cycle_data_with_cell_id(self, cell_id, email):
        sql = self.session.query(
            CycleStats.cycle_index.label(OUTPUT_LABELS.CYCLE_INDEX.value),
            CycleStats.test_time.label(OUTPUT_LABELS.TEST_TIME.value),
            CycleStats.i_max.label(OUTPUT_LABELS.MAX_CURRENT.value),
            CycleStats.i_min.label(OUTPUT_LABELS.MIN_CURRENT.value),
            CycleStats.v_max.label(OUTPUT_LABELS.MAX_VOLTAGE.value),
            CycleStats.v_min.label(OUTPUT_LABELS.MIN_VOLTAGE.value),
            CycleStats.ah_c.label(OUTPUT_LABELS.CHARGE_CAPACITY.value),
            CycleStats.ah_d.label(OUTPUT_LABELS.DISCHARGE_CAPACITY.value),
            CycleStats.e_c.label(OUTPUT_LABELS.CHARGE_ENERGY.value),
            CycleStats.e_d.label(OUTPUT_LABELS.DISCHARGE_ENERGY.value)).filter(
                    CycleStats.cell_id == cell_id, CycleStats.email == email).statement
        return pd.read_sql(sql, self.session.bind).round(DEGREE)

    # CELL
    
    def get_all_cell_meta(self, email):
        return self.select_table(CellMeta, email)

    def get_all_cell_meta_with_id(self, cell_id, email):
        return self.get_all_data_from_table_with_id(CellMeta, cell_id, email)
    
    #ECHARTS

    def get_all_data_from_CQBS_query(self, cell_id, step, email):
        if len(cell_id)>1:
            return self.session.execute(
                CYCLE_QUANTITIES_BY_STEP_QUERY.format(tuple(cell_id), step, email))
        else:
            return self.session.execute(
                CYCLE_QUANTITIES_BY_STEP_QUERY.format(("('" + cell_id[0] + "')"), step, email))

    def get_all_data_from_ECAD_query(self, cell_id, email):
        if len(cell_id)>1:
            return self.session.execute(
                ENERGY_AND_CAPACITY_DECAY_QUERY.format(tuple(cell_id), email))
        else:
            return self.session.execute(
                ENERGY_AND_CAPACITY_DECAY_QUERY.format(("('" + cell_id[0] + "')"), email))

    def get_all_data_from_Eff_query(self, cell_id, email):
        if len(cell_id)>1:
            return self.session.execute(
                EFFICIENCY_QUERY.format(tuple(cell_id), email))
        else:
            return self.session.execute(
                EFFICIENCY_QUERY.format(("('" + cell_id[0] + "')"), email))
    
    def get_all_data_from_CCVC_query(self, cell_id, email):
        if len(cell_id)>1:
            return self.session.execute(
                COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY.format(tuple(cell_id), email))
        else:
            return self.session.execute(
                COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY.format(("('" + cell_id[0] + "')"), email))



    # GENERAL ORM
    def add_all(self, df, model):
        records = df.to_dict('records')
        data_list = []
        for data in records:
            model_object = model(**data)
            data_list.append(model_object)
        self.session.add_all(data_list)
    
    def add(self, df, model):
        record = df.to_dict('records')
        model_object = model(**record[0])
        self.session.add(model_object)

    def get_all_data_from_table(self, table):
        return self.select_table(table).all()

    def get_all_data_from_table_with_id(self, table, cell_id, email):
        return self.select_table_with_id(table, cell_id, email).all()

    # BASIC

    def select_table(self, table, email):
        return self.session.query(table).filter(table.email == email)

    def select_table_with_id(self, table, cell_id, email):
        return self.session.query(table).filter(table.cell_id == cell_id, table.email == email)
        

