from concurrent.futures import ThreadPoolExecutor
from concurrent.futures import wait
import os
from sqlalchemy import (
    Column,
    BigInteger,
    Integer,
    TEXT,
    Float,
    or_,
    select,
    bindparam,
    create_engine
)
from sqlalchemy.ext.declarative import declarative_base
import pandas as pd
from sqlalchemy.sql.sqltypes import TIMESTAMP, FLOAT, BOOLEAN
from app.archive_constants import (AMPLABS_DB_URL,
                                   ARCHIVE_TABLE, BATTERY_ARCHIVE, DATA_MATR_IO, LABEL)
from sqlalchemy.orm import scoped_session, sessionmaker
from app.queries import *
import numpy as np

Model = declarative_base()


class UserPlan(Model):
    __tablename__ = ARCHIVE_TABLE.USER_PLAN.value
    email = Column(TEXT, primary_key=True)
    stripe_customer_id = Column(TEXT, nullable=True)
    stripe_subscription_id = Column(TEXT, nullable=True)
    plan_type = Column(TEXT, nullable=False)

    def to_dict(self):
        data_dict = {}
        for column in self.__table__.columns:
            data_dict[column.name] = getattr(self, column.name)
        data_dict.pop(LABEL.EMAIL.value, None)
        return data_dict


class AbuseMeta(Model):
    __tablename__ = ARCHIVE_TABLE.ABUSE_META.value
    index = Column(Integer, primary_key=True)
    cell_id = Column(TEXT, nullable=False)
    temperature = Column(Float, nullable=True)
    thickness = Column(Float, nullable=True)
    v_init = Column(Float, nullable=True)
    indentor = Column(Float, nullable=True)
    nail_speed = Column(Float, nullable=True)
    email = Column(TEXT, nullable=False)

    def to_dict(self):
        return {
            "index": self.index,
            "cell_id": self.cell_id,
            "temperature": self.temperature,
            "thickness": self.thickness,
            "v_init": self.v_init,
            "indentor": self.indentor,
            "nail_speed": self.nail_speed
        }


class AbuseTimeSeries(Model):
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
    email = Column(TEXT, nullable=False)

    def to_dict(self):
        return {
            "index": self.index,
            "axial_d": self.axial_d,
            "axial_f": self.axial_f,
            "v": self.v,
            "strain": self.strain,
            "pos_terminal_temperature": self.pos_terminal_temperature,
            "neg_terminal_temperature": self.neg_terminal_temperature,
            "left_bottom_temperature": self.left_bottom_temperature,
            "right_bottom_temperature": self.right_bottom_temperature,
            "above_punch_temperature": self.above_punch_temperature,
            "below_punch_temperature": self.below_punch_temperature,
            "test_time": self.test_time,
            "cell_id": self.cell_id
        }


class CycleMeta(Model):
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
    email = Column(TEXT, nullable=False)

    def to_dict(self):
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
    is_public = Column(BOOLEAN, nullable=False)
    active_mass = Column(Float, nullable=True)

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
            "tester": self.tester,
            "active_mass": self.active_mass
        }

    @staticmethod
    def columns():
        return [
            "index", "cell_id", "anode", "cathode", "source", "ah", "form_factor",
            "test", "tester"
        ]


class CycleStats(Model):
    __tablename__ = ARCHIVE_TABLE.CYCLE_STATS.value

    cell_id = Column(TEXT, nullable=False)
    email = Column(TEXT, nullable=False)
    index = Column(Integer, primary_key=True)
    cycle_index = Column(Integer, nullable=True)

    # Time
    cycle_start_timestamp = Column(TIMESTAMP, nullable=True)
    cycle_end_timestamp = Column(TIMESTAMP, nullable=True)
    cycle_time = Column(Float, nullable=True)
    test_time = Column(Float, nullable=True)
    cycle_duration = Column(Float, nullable=True)
    cycle_total_rest_time = Column(Float, nullable=True)

    # Current
    cycle_max_current = Column(Float, nullable=True)
    cycle_min_current = Column(Float, nullable=True)

    # Voltage
    cycle_max_voltage = Column(Float, nullable=True)
    cycle_min_voltage = Column(Float, nullable=True)

    cycle_mean_voltage = Column(Float, nullable=True)
    cycle_mean_charge_voltage = Column(Float, nullable=True)
    cycle_mean_discharge_voltage = Column(Float, nullable=True)

    cycle_max_rest_voltage = Column(Float, nullable=True)
    cycle_min_rest_voltage = Column(Float, nullable=True)

    # Capacity
    cycle_charge_capacity = Column(Float, nullable=True)
    cycle_discharge_capacity = Column(Float, nullable=True)

    # Energy
    cycle_charge_energy = Column(Float, nullable=True)
    cycle_discharge_energy = Column(Float, nullable=True)

    # Energy density
    cycle_charge_energy_density = Column(Float, nullable=True)
    cycle_discharge_energy_density = Column(Float, nullable=True)

    # Power
    cycle_max_power = Column(Float, nullable=True)
    cycle_max_charge_power = Column(Float, nullable=True)
    cycle_max_discharge_power = Column(Float, nullable=True)

    cycle_min_power = Column(Float, nullable=True)
    cycle_min_charge_power = Column(Float, nullable=True)
    cycle_min_discharge_power = Column(Float, nullable=True)

    cycle_mean_power = Column(Float, nullable=True)
    cycle_mean_charge_power = Column(Float, nullable=True)
    cycle_mean_discharge_power = Column(Float, nullable=True)

    # Efficiency
    cycle_energy_efficiency = Column(Float, nullable=True)
    cycle_coulombic_efficiency = Column(Float, nullable=True)
    cycle_voltage_efficiency = Column(Float, nullable=True)

    # dv
    dv_start_of_charge = Column(Float, nullable=True)
    dv_end_of_charge = Column(Float, nullable=True)
    dv_start_of_discharge = Column(Float, nullable=True)
    dv_end_of_discharge = Column(Float, nullable=True)

    # dt
    dt_start_of_charge = Column(Float, nullable=True)
    dt_end_of_charge = Column(Float, nullable=True)
    dt_start_of_discharge = Column(Float, nullable=True)
    dt_end_of_discharge = Column(Float, nullable=True)

    # resistance
    cycle_resistance_start_of_charge = Column(Float, nullable=True)
    cycle_resistance_end_of_charge = Column(Float, nullable=True)
    cycle_resistance_start_of_discharge = Column(Float, nullable=True)
    cycle_resistance_end_of_discharge = Column(Float, nullable=True)

    # Count
    datapoint_count = Column(Integer, nullable=True)
    step_count = Column(Integer, nullable=True)
    rest_step_count = Column(Integer, nullable=True)
    charge_step_count = Column(Integer, nullable=True)
    discharge_step_count = Column(Integer, nullable=True)

    def to_dict(self):
        data_dict = {}
        for column in self.__table__.columns:
            data_dict[column.name] = getattr(self, column.name)
        data_dict.pop(LABEL.EMAIL.value, None)
        data_dict.pop(LABEL.INDEX.value, None)
        return data_dict


class CycleTimeSeries(Model):
    __tablename__ = ARCHIVE_TABLE.CYCLE_TS.value

    index = Column(Integer, primary_key=True)
    email = Column(TEXT, nullable=False)
    cell_id = Column(TEXT, nullable=False)
    current = Column(Float, nullable=True)
    voltage = Column(Float, nullable=True)
    power = Column(Float, nullable=True)
    cycle_index = Column(Integer, nullable=True)
    cycle_time = Column(Float, nullable=True)
    test_time = Column(Float, nullable=True)
    date_time = Column(TIMESTAMP, nullable=True)

    # capacity
    charge_capacity = Column(Float, nullable=True)
    cycle_charge_capacity = Column(Float, nullable=True)
    cumulative_charge_capacity = Column(Float, nullable=True)

    discharge_capacity = Column(Float, nullable=True)
    cycle_discharge_capacity = Column(Float, nullable=True)
    cumulative_discharge_capacity = Column(Float, nullable=True)

    net_capacity = Column(Float, nullable=True)
    capacity_throughput = Column(Float, nullable=True)
    test_net_capacity = Column(Float, nullable=True)

    # Energy
    charge_energy = Column(Float, nullable=True)
    cycle_charge_energy = Column(Float, nullable=True)
    cumulative_charge_energy = Column(Float, nullable=True)

    discharge_energy = Column(Float, nullable=True)
    cycle_discharge_energy = Column(Float, nullable=True)
    cumulative_discharge_energy = Column(Float, nullable=True)

    net_energy = Column(Float, nullable=True)
    energy_throughput = Column(Float, nullable=True)
    test_net_energy = Column(Float, nullable=True)

    environment_temperature = Column(Float, nullable=True)
    cell_temperature = Column(Float, nullable=True)

    # Other
    step_index = Column(Integer, nullable=True)
    step_time = Column(Float, nullable=True)
    step_type = Column(TEXT, nullable=True)
    test_datapoint_ordinal = Column(Integer, nullable=True)
    step_datapoint_ordinal = Column(Integer, nullable=True)
    datapoint_dv = Column(Float, nullable=True)
    datapoint_di = Column(Float, nullable=True)
    datapoint_dtime = Column(Float, nullable=True)
    datapoint_dtemp = Column(Float, nullable=True)
    datapoint_dq = Column(Float, nullable=True)
    dq_dv = Column(Float, nullable=True)
    dv_dt = Column(Float, nullable=True)

    def to_dict(self):
        data_dict = {}
        for column in self.__table__.columns:
            data_dict[column.name] = getattr(self, column.name)
        data_dict.pop(LABEL.EMAIL.value, None)
        data_dict.pop(LABEL.INDEX.value, None)
        return data_dict


class SharedDashboard(Model):
    __tablename__ = ARCHIVE_TABLE.SHARED_DASHBOARD.value
    uuid = Column(TEXT, primary_key=True)
    shared_by = Column(TEXT, nullable=False)
    shared_to = Column(TEXT, nullable=True)
    cell_id = Column(TEXT, nullable=False)
    test = Column(TEXT, nullable=True)
    is_public = Column(BOOLEAN, nullable=False)


"""
Archive Operator
- Manages objects in Archive
- Supports Create/Read/Update/Delete of ArchiveCells
- For example, methods accept ArchiveCell(s) as input and provides ArchiveCell(s) as output
- Performs all necessary SQL functions related to Archive db
"""


class ArchiveOperator:
    url = AMPLABS_DB_URL
    engine = create_engine(url, pool_size=500, pool_timeout=1200)
    Model.metadata.create_all(engine)
    executor = ThreadPoolExecutor(500)

    def __init__(self, config={}):
        self.session = None


    def set_session(self):
        self.session = scoped_session(
            sessionmaker(autocommit=True, autoflush=False, bind=ArchiveOperator.engine))


    def release_session(self):
        self.session.remove()
        self.session = None


    def commit(self):
        self.session.commit()


    def remove_cell_from_table(self, table, cell_id, email):
        self.session.query(table).filter(
            table.cell_id == cell_id, table.email == email).delete()


    def remove_cell_from_archive(self, cell_id, email):
        self.remove_cell_from_table(CellMeta, cell_id, email)
        self.remove_cell_from_table(CycleStats, cell_id, email)
        self.remove_cell_from_table(CycleTimeSeries, cell_id, email)
        self.remove_cell_from_table(CycleMeta, cell_id, email)
        self.remove_cell_from_table(AbuseTimeSeries, cell_id, email)
        self.remove_cell_from_table(AbuseMeta, cell_id, email)

    """getters"""

    def get_df_cycle_ts_with_cell_id(self, cell_id, email):
        sql = self.session.query(CycleTimeSeries).filter(
            CycleTimeSeries.cell_id == cell_id,
            or_(CycleTimeSeries.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]), (CycleTimeSeries.email.in_(self.session.query(UserPlan.email).subquery())))).order_by('cycle_index','test_time').statement
        return pd.read_sql(sql, self.session.bind)


    def get_df_cycle_data_with_cell_id(self, cell_id, email):
        sql = self.session.query(CycleStats).filter(
            CycleStats.cell_id == cell_id,
            or_(CycleStats.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]),CycleStats.email.in_(self.session.query(UserPlan.email).subquery()))).order_by('cycle_index').statement
        return pd.read_sql(sql, self.session.bind)


    def get_df_abuse_ts_with_cell_id(self, cell_id, email):
        sql = self.session.query(
            AbuseTimeSeries.test_time, AbuseTimeSeries.axial_d, AbuseTimeSeries.axial_f, AbuseTimeSeries.v,
            AbuseTimeSeries.pos_terminal_temperature, AbuseTimeSeries.neg_terminal_temperature,
            AbuseTimeSeries.left_bottom_temperature, AbuseTimeSeries.right_bottom_temperature,
            AbuseTimeSeries.above_punch_temperature, AbuseTimeSeries.below_punch_temperature,
            AbuseTimeSeries.norm_d, AbuseTimeSeries.strain).filter(
            AbuseTimeSeries.cell_id == cell_id, AbuseTimeSeries.email == email).order_by('index').statement
        return pd.read_sql(sql, self.session.bind)


    # CELL
    def get_public_cell_meta(self, cell_ids):
        return self.session.query(CellMeta.cell_id).filter(CellMeta.cell_id.in_(cell_ids), CellMeta.email.in_([BATTERY_ARCHIVE, DATA_MATR_IO])).first()


    def get_all_cell_meta(self, email, test):
        return self.select_table(CellMeta, email, test)


    def get_all_cell_meta_filter(self,email,filter_string):
        # result = self.session.execute(FILTER_DASHBOARD)
        result = self.session.execute(FILTER_DASHBOARD.format(email=email,is_public = True,filters = filter_string))
        return result 


    def get_all_cell_meta_with_id(self, cell_id, email):
        return self.get_all_data_from_table_with_id(CellMeta, cell_id, email)

    def get_all_shared_cell_meta_with_id(self, cell_id, test, email = None):
        if email: 
            return self.session.query(CellMeta).filter(CellMeta.cell_id.in_(cell_id),
                                                   CellMeta.test == test, CellMeta.email == email).all()
        return self.session.query(CellMeta).filter(CellMeta.cell_id.in_(cell_id),
                                                   CellMeta.test == test).all()


    def get_all_cell_meta_from_table_with_id(self, cell_id, email, test):
        return self.session.query(CellMeta).filter(CellMeta.cell_id.in_(cell_id),
                                                   or_(CellMeta.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]),CellMeta.email.in_(
                                                       self.session.query(UserPlan.email).subquery())),
                                                   CellMeta.test == test).all()


    def get_all_cell_meta_for_community(self, email, for_current_user=False):
        if for_current_user:
            return self.session.query(CellMeta).filter(
            CellMeta.email == email, CellMeta.test == 'cycle', CellMeta.is_public == 'true'
            ).all()
        return self.session.query(CellMeta).filter(
            CellMeta.email.notin_([email, BATTERY_ARCHIVE, DATA_MATR_IO]), CellMeta.test == 'cycle', CellMeta.is_public == 'true'
            ).all()
    

    def get_all_cell_meta_for_community_filter(self,email,filter_string):
        result = self.session.execute(FILTER_DASHBOARD.format(email=email,filters=filter_string,is_public=True))
        # result = self.session.execute(FILTER_DASHBOARD)
        return result


    def get_all_private_cell_meta(self, email, test):
        return self.session.query(CellMeta).filter(
            CellMeta.email == email, CellMeta.test == test, CellMeta.is_public == 'false'
            ).all()


    def get_all_private_cell_meta_filter(self, email, filter_string):
        # result = self.session.execute(FILTER_DASHBOARD)
        result = self.session.execute(FILTER_DASHBOARD.format(email=email,is_public = False,filters = filter_string))
        return result
        

    # TEST METADATA
    def get_all_test_metadata_from_table(self, test_model, email):
        return self.get_all_data_from_table_with_email(test_model, email)


    def get_all_test_metadata_from_table_with_id(self, cell_id, test_model, email):
        return self.session.query(test_model).filter(test_model.cell_id.in_(cell_id),
                                                     or_(test_model.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]), test_model.email.in_(self.session.query(UserPlan.email).subquery()))).all()


    # ECHARTS
    def get_all_data_from_CQBS_query(self, cell_id, step, email, mod_step):
        if len(cell_id) > 1:
            return self.session.execute(
                CYCLE_QUANTITIES_BY_STEP_QUERY.format(cell_id=tuple(cell_id), step=step, email=email, mod_step=mod_step))
        else:
            return self.session.execute(
                CYCLE_QUANTITIES_BY_STEP_QUERY.format(cell_id=("('" + cell_id[0] + "')"), step=step, email=email, mod_step=mod_step))


    def get_all_data_from_GalvanoPlot_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                GALVANOSTATIC_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                GALVANOSTATIC_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string))


    def get_all_data_from_ECAD_query(self, cell_id, email, mod_step):
        if len(cell_id) > 1:
            return self.session.execute(
                ENERGY_AND_CAPACITY_DECAY_QUERY.format(cell_id=tuple(cell_id), email=email, mod_step=mod_step))
        else:
            return self.session.execute(
                ENERGY_AND_CAPACITY_DECAY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, mod_step=mod_step))


    def get_all_data_from_Eff_query(self, cell_id, email, mod_step):
        if len(cell_id) > 1:
            return self.session.execute(
                EFFICIENCY_QUERY.format(cell_id=tuple(cell_id), email=email, mod_step=mod_step))
        else:
            return self.session.execute(
                EFFICIENCY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, mod_step=mod_step))


    def get_all_data_from_AhEff_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                COULOMBIC_EFFICIENCY_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                COULOMBIC_EFFICIENCY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email,  filters=filter_string))


    def get_all_data_from_CCVC_query(self, cell_id, email):
        if len(cell_id) > 1:
            return self.session.execute(
                COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY.format(cell_id=tuple(cell_id), email=email))
        else:
            return self.session.execute(
                COMPARE_CYCLE_VOLTAGE_AND_CURRENT_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email))
    

    def get_all_data_from_operating_potential_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                OPERATING_POTENTIAL_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                OPERATING_POTENTIAL_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string))


    def get_all_data_from_DiffCapacity_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            sql_stmt = DIFFERENTIAL_CAPACITY_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string)
        else:
            sql_stmt = DIFFERENTIAL_CAPACITY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string)
        return pd.read_sql(sql_stmt, self.session.bind)


    def get_all_data_from_VoltageTime_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            sql_stmt = VOLTAGE_TIME_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string)
        else:
            sql_stmt = VOLTAGE_TIME_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string)
        return self.session.execute(sql_stmt)


    def get_all_data_from_CurrentTime_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            sql_stmt = CURRENT_TIME_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string)
        else:
            sql_stmt = CURRENT_TIME_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string)
        return self.session.execute(sql_stmt)


    def get_all_data_from_AFD_query(self, cell_id, email, sample):
        if len(cell_id) > 1:
            return self.session.execute(
                ABUSE_FORCE_AND_DISPLACEMENT.format(cell_id=tuple(cell_id), email=email, sample=sample))
        else:
            return self.session.execute(
                ABUSE_FORCE_AND_DISPLACEMENT.format(cell_id=("('" + cell_id[0] + "')"), email=email, sample=sample))


    def get_all_data_from_ATT_query(self, cell_id, email, sample):
        if len(cell_id) > 1:
            return self.session.execute(
                ABUSE_TEST_TEMPRATURES.format(cell_id=tuple(cell_id), email=email, sample=sample))
        else:
            return self.session.execute(
                ABUSE_TEST_TEMPRATURES.format(cell_id=("('" + cell_id[0] + "')"), email=email, sample=sample))


    def get_all_data_from_AV_query(self, cell_id, email, sample):
        if len(cell_id) > 1:
            return self.session.execute(
                ABUSE_VOLTAGE.format(cell_id=tuple(cell_id), email=email, sample=sample))
        else:
            return self.session.execute(
                ABUSE_VOLTAGE.format(cell_id=("('" + cell_id[0] + "')"), email=email, sample=sample))
    

    def get_all_data_from_CR_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                CAPACITY_RETENTION.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                CAPACITY_RETENTION.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string))


    def get_all_data_from_Capacity_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                CAPACITY_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                CAPACITY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string))


    def get_all_data_from_EnergyDensity_query(self, cell_id, email, filter_string):
        if len(cell_id) > 1:
            return self.session.execute(
                ENERGY_DENSITY_QUERY.format(cell_id=tuple(cell_id), email=email, filters=filter_string))
        else:
            return self.session.execute(
                ENERGY_DENSITY_QUERY.format(cell_id=("('" + cell_id[0] + "')"), email=email, filters=filter_string))


    #SUMMARY 
    def get_all_data_from_timeseries_query(self, columns, cell_ids, email, filters, get_df=False):
        if get_df:
            return pd.read_sql(TIMESERIES_DATA.format(columns=columns, cell_ids=cell_ids, email=email, filters=filters), self.session.bind)
        result = self.session.execute(TIMESERIES_DATA.format(
            columns=columns, cell_ids=cell_ids, email=email, filters=filters))
        return result


    def get_all_data_from_stats_query(self, columns, cell_ids, email, filters, get_df=False):
        if get_df:
            return pd.read_sql(STATS_DATA.format(columns=columns, cell_ids=cell_ids, email=email, filters=filters), self.session.bind)
        result = self.session.execute(STATS_DATA.format(
            columns=columns, cell_ids=cell_ids, email=email, filters=filters))
        return result


    def get_cathode_count_files_query(self,email):
        result = self.session.execute(COUNT_CATHODE_FILES.format(email=email))
        return result


    def get_form_factor_count_files_query(self,email):
        result = self.session.execute(COUNT_FORM_FACTOR.format(email=email))
        return result


    def get_files_count_query(self,email):
        result = self.session.execute(CELL_IDS.format(email=email))
        return result


    def get_cycle_index_count_query(self,email):
        result = self.session.execute(TOTAL_CYCLE_INDEX.format(email=email))
        return result


    def get_size_cell_metadata_query(self,email):
        result = self.session.execute(SIZE_CELL_METADATA.format(email=email))
        return result


    def get_size_cycle_stats_query(self,email):
        result = self.session.execute(SIZE_CYCLE_STATS.format(email=email))
        return result


    def get_size_cycle_timeseries_query(self,email):
        result = self.session.execute(SIZE_CYCLE_TIMESERIES.format(email=email))
        return result


    # FILTERS
    def get_anode_filter_query(self, email):
        result = self.session.execute(ANODE_FILTER_QUERY.format(email=email))
        return result


    def get_cathode_filter_query(self, email):
        result = self.session.execute(CATHODE_FILTER_QUERY.format(email=email))
        return result


    def get_capacity_filter_query(self, email):
        result = self.session.execute(AH_FILTER_QUERY.format(email=email))
        return result


    def get_format_filter_query(self, email):
        result = self.session.execute(FORMAT_SHAPE_FILTER_QUERY.format(email=email))
        return result


    def get_test_filter_query(self, email):
        result = self.session.execute(TEST_TYPE_FILTER_QUERY.format(email=email))
        return result


    def get_temp_filter_query(self, email):
        result = self.session.execute(TEMPERATURE_FILTER_QUERY.format(email=email))
        return result


    def get_rate_filter_query(self, email):
        result = self.session.execute(RATE_FILTER_QUERY.format(email=email))
        return result

    def get_op_voltage_filter_query(self, email):
        result = self.session.execute(VOLTAGE_FILTER_QUERY.format(email=email))
        return result

    
    # DASHBOARD
    def get_shared_dashboard_by_id(self, dashboard_id):
        return self.session.execute(f"select * from shared_dashboard where uuid = '{dashboard_id}'").fetchone()

    def get_shared_dashboard_by_email(self,email):
        return self.session.execute(f"select * from shared_dashboard where shared_by = '{email}'")

    # GA DB OPERATIONS
    def add_cell_to_db(self, cell):
        df_cell_md = cell.cellmeta
        df_test_meta_md = cell.testmeta
        df_stats, df_timeseries = cell.stat
        df_cell_md.to_sql(cell.cell_meta_table,
                          con=self.session.bind,
                          if_exists="append",
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
        df_timeseries.to_sql(cell.test_ts_table,
                             con=self.session.bind,
                             if_exists='append',
                             chunksize=1000,
                             index=False)


    def add_meta_to_db(self, cell):
        df_cell_md = cell.cellmeta
        df_test_meta_md = cell.testmeta
        df_stats, _ = cell.stat
        print("CELL META", df_cell_md)
        df_cell_md.to_sql(cell.cell_meta_table,
                          con=self.session.bind,
                          if_exists="append",
                          chunksize=1000,
                          index=False)
        print("DF TS META", df_test_meta_md)
        df_test_meta_md.to_sql(cell.test_meta_table,
                               con=self.session.bind,
                               if_exists='append',
                               chunksize=1000,
                               index=False)
        if cell.test_stats_table:
            print("DF STATS", df_stats)
            df_stats.to_sql(ARCHIVE_TABLE.CYCLE_STATS.value,
                            con=self.session.bind,
                            if_exists='append',
                            chunksize=1000,
                            index=False)


    def add_ts_to_db(self, cell):
        _, df_timeseries = cell.stat
        df_timeseries.to_sql(cell.test_ts_table,
                             con=self.session.bind,
                             if_exists='append',
                             chunksize=1000,
                             index=False)


    # GENERAL ORM
    def add_all(self, df, model):
        def insert_df(item):
            conn = ArchiveOperator.engine.connect()
            conn.execute(
                CycleTimeSeries.__table__.insert(),
                item.to_dict('records'), )
        if model == 'cycle_timeseries':
            df_list = np.array_split(df, 8)
            futures = [ArchiveOperator.executor.submit(
                insert_df, df) for df in df_list]
            wait(futures)
        else:
            df.to_sql(model,
                      con=self.session.bind,
                      if_exists="append",
                      chunksize=1000,
                      index=False, method='multi')


    def add(self, df, model):
        record = df.to_dict('records')
        model_object = model(**record[0])
        self.session.add(model_object)


    def get_all_data_from_table(self, table):
        return self.select_table(table).all()


    def get_all_data_from_table_with_email(self, table, email):
        return self.select_table_with_email(table, email).all()


    def get_all_data_from_table_with_id(self, table, cell_id, email):
        return self.select_table_with_id(table, cell_id, email).all()


    def update_table_with_cell_id_email(self, table, cell_id, email, data):
        self.session.query(table).filter(
            table.email == email, table.cell_id == cell_id).update(data)


    def update_table_with_index(self, table, index, data):
        self.session.query(table).filter(table.index == index).update(data)


    # User plan
    def add_user_plan(self, data):
        df = pd.DataFrame([data])
        df.to_sql("user_plan",
                             con=self.session.bind,
                             if_exists='append',
                             chunksize=1000,
                             index=False)


    def update_user_plan(self, data):
        self.session.query(UserPlan).filter(
            UserPlan.email == data['email']).update(data)

    # BASIC
    def select_table(self, table, email, test):
        return self.session.query(table).filter(table.email == email, table.test == test)


    def select_table_with_id(self, table, cell_id, email):
        return self.session.query(table).filter(table.cell_id == cell_id, table.email == email)


    def select_data_from_table(self, table, email, test):
        return self.session.query(table).filter(table.email == email, table.test == test).first()


    def select_table_with_email(self, table, email):
        return self.session.query(table).filter(table.email == email)

    def get_data_as_dataframe(self, email, cell_id, type):
        if type == "timeseries":
            sql = self.session.query(CycleTimeSeries.current,CycleTimeSeries.voltage,CycleTimeSeries.cycle_index,
                                    CycleTimeSeries.charge_capacity,CycleTimeSeries.discharge_capacity).filter(
            CycleTimeSeries.cell_id == cell_id,
            or_(CycleTimeSeries.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]))).order_by('test_datapoint_ordinal').statement
        else:
            sql = self.session.query(CycleStats.cycle_index,CycleStats.index,
                                    CycleStats.cycle_charge_energy_density,CycleStats.cycle_discharge_energy_density).filter(
            CycleStats.cell_id == cell_id,
            or_(CycleStats.email.in_([email, BATTERY_ARCHIVE, DATA_MATR_IO]))).statement
        return pd.read_sql(sql, self.session.bind)

    def update_for_energy_density(self, df):
        df.rename(columns = {'index':'_id','cycle_discharge_energy_density':'_ed_d','cycle_charge_energy_density':'_ed_c'}, inplace = True)
        self.session.execute(CycleStats.__table__.update().where(CycleStats.__table__.c.index == bindparam('_id')).values(cycle_charge_energy_density = bindparam('_ed_c'),cycle_discharge_energy_density = bindparam('_ed_d')),params=df.to_dict('records'))