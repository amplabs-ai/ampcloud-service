from enum import Enum, auto
from dotenv import load_dotenv, dotenv_values, find_dotenv
from pathlib import Path
import os
import random
import string 
load_dotenv(find_dotenv())

ENV = os.getenv('ENV')

SLASH = "/"

DEGREE = 3
CELL_LIST_FILE_NAME = "cell_list.xlsx"
TEST_DB_URL = "sqlite:///tests/test_data/db/bas-test.db"
LIVE_DB_URL = "<your-db-string>"
DB_URL = LIVE_DB_URL
GA_API_HOST = ""

# Stripe
STRIPE_ENDPOINT_SECRET = os.getenv('STRIPE_PROD_ENDPOINT_SECRET') if ENV == "production" else os.getenv('STRIPE_DEV_ENDPOINT_SECRET') 
STRIPE_API_KEY = os.getenv('STRIPE_PROD_API_KEY') if ENV == "production" else os.getenv('STRIPE_DEV_API_KEY') 

AMPLABS_DB_URL = os.getenv('AMPLABS_PROD_DB_URL') if ENV == "production" \
                 else os.getenv('AMPLABS_DEV_DB_URL')

LINKEDIN_CLIENT_ID = os.getenv('LINKEDIN_CLIENT_ID')
LINKEDIN_CLIENT_SECRET = os.getenv('LINKEDIN_CLIENT_SECRET')
LINKEDIN_REDIRECT_URI_DASH_CYCLE= 'https://www.amplabs.ai/dashboard/cycle-test' if ENV == 'production' else 'http://localhost:3000/dashboard/cycle-test'
LINKEDIN_REDIRECT_URI_DASH_ABUSE= 'https://www.amplabs.ai/dashboard/abuse-test' if ENV == 'production' else 'http://localhost:3000/dashboard/abuse-test'

#Auth0
AUTH0_DOMAIN = os.getenv('AUTH0_PROD_DOMAIN') if ENV == 'production' else os.getenv('AUTH0_DEV_DOMAIN')
AUTH0_AUDIENCE = os.getenv('AUTH0_AUDIENCE')
AUTH0_ALGORITHMS = ["RS256"]

# Public Database emails:
BATTERY_ARCHIVE = "info@batteryarchive.org"
DATA_MATR_IO = "data.matr.io@tri.global"


class TEST_TYPE(Enum):
    ABUSE = "abuse"
    CYCLE = "cycle"


class FORMAT(Enum):
    CSV = "csv"
    FEATHER = "feather"
    XLSX = "xlsx"
    H5 = "h5"


class TESTER(Enum):
    ORNL = "ornl"
    SNL = "snl"
    ARBIN = "arbin"
    MACCOR = "maccor"
    GENERIC = "generic"


class ARCHIVE_TABLE(Enum):
    USER_PLAN = "user_plan"
    ABUSE_META = "abuse_metadata"
    ABUSE_TS = "abuse_timeseries"
    CELL_META = "cell_metadata"
    CYCLE_META = "cycle_metadata"
    CYCLE_STATS = "cycle_stats"
    CYCLE_TS = "cycle_timeseries"
    SHARED_DASHBOARD = "shared_dashboard"


class INP_LABELS(Enum):
    TEST_TIME = "Running Time"
    AXIAL_D = "Axial Displacement"
    AXIAL_F = "Axial Force"
    V = "Analog 1"
    TC_01 = "TC 01"
    TC_02 = "TC 02"
    TC_03 = "TC 03"
    TC_04 = "TC 04"
    TC_05 = "TC 05"
    TC_06 = "TC 06"


class ARCHIVE_COLS(Enum):
    TEST_TIME = "test_time"
    AXIAL_D = "axial_d"
    AXIAL_F = "axial_f"
    I = "i"
    V = "v"

    temp_1 = "pos_terminal_temperature"
    temp_2 = "neg_terminal_temperature"

    temp_3 = "left_bottom_temperature"
    temp_4 = "right_bottom_temperature"
    temp_5 = "above_punch_temperature"
    temp_6 = "below_punch_temperature"


class OUTPUT_LABELS(Enum):
    CYCLE_INDEX = "Cycle_Index"
    CELL_ID = "Cell_ID"
    DATE_TIME = "Date_Time"
    TEST_TIME = "Test_Time (s)"
    VOLTAGE = "Voltage (V)"
    CURRENT = "Current (A)"
    MAX_VOLTAGE = "Max_Voltage (V)"
    MAX_CURRENT = "Max_Current (A)"
    MIN_VOLTAGE = "Min_Voltage (V)"
    MIN_CURRENT = "Min_Current (A)"
    CHARGE_CAPACITY = "Charge_Capacity (Ah)"
    DISCHARGE_CAPACITY = "Discharge_Capacity (Ah)"
    CHARGE_ENERGY = "Charge_Energy (Wh)"
    DISCHARGE_ENERGY = "Discharge_Energy (Wh)"
    ENV_TEMPERATURE = "Environment_Temperature (C)"
    CELL_TEMPERATURE = "Cell_Temperature (C)"
    START_TIME = "Start_Time"
    END_TIME = "End_Time"


class LABEL(Enum):
    INDEX = "index"
    CELL_ID = "cell_id"
    MAPPING = "mapping"
    EMAIL = "email"
    CYCLE_INDEX = "cycle_index"
    CYCLE_TIME = "cycle_time"

    # cell meta
    ANODE = "anode"
    CATHODE = "cathode"
    SOURCE = "source"
    AH = "ah"
    FORM_FACTOR = "form_factor"
    TEST = "test"
    TESTER = "tester"

    # Test meta
    CRATE_C = "crate_c"
    CRATE_D = "crate_d"
    SOC_MAX = "soc_max"
    SOC_MIN = "soc_min"
    TEMP = "temperature"
    V_MAX = "v_max"
    V_MIN = "v_min"

    # Cycle Timeseries
    DATE_TIME = "date_time"
    TEST_TIME = "test_time"
    I = "current"
    V = "voltage"
    AH_C = "charge_capacity"
    CYCLE_CUM_AH_C = "cycle_charge_capacity"
    CUM_AH_C = "cumulative_charge_capacity"
    AH_D = "discharge_capacity"
    CYCLE_CUM_AH_D = "cycle_discharge_capacity"
    CUM_AH_D = "cumulative_discharge_capacity"
    NET_AH = "net_capacity"
    E_C = "charge_energy"
    CYCLE_CUM_E_C = "cycle_charge_energy"
    CUM_E_C = "cumulative_charge_energy"
    E_D = "discharge_energy"
    CYCLE_CUM_E_D = "cycle_discharge_energy"
    CUM_E_D = "cumulative_discharge_energy"
    NET_E = "net_energy"
    POWER = "power"
    STEP_INDEX = "step_index"
    STEP_TYPE = "step_type"
    STEP_TIME = "step_time"
    TEST_DATAPOINT_ORDINAL = "test_datapoint_ordinal"
    STEP_DATAPOINT_ORDINAL = "step_datapoint_ordinal"
    DATAPOINT_DV = "datapoint_dv"
    DATAPOINT_DI = "datapoint_di"
    DATAPOINT_DTIME = "datapoint_dtime"
    DATAPOINT_DTEMP = "datapoint_dtemp"
    DATAPOINT_DQ = "datapoint_dq"
    DQ_DV = "dq_dv"
    DV_DT = "dv_dt"
    CAPACITY_THROUGHPUT = "capacity_throughput"
    ENERGY_THROUGHPUT = "energy_throughput"
    TEST_NET_CAPACITY = "test_net_capacity"
    TEST_NET_ENERGY = "test_net_energy"
    ENV_TEMP = "environment_temperature"
    CELL_TEMP = "cell_temperature"

    # Cycle Stats
    CYCLE_START_TS = "cycle_start_timestamp"
    CYCLE_END_TS = "cycle_end_timestamp"

    CYCLE_MAX_I = "cycle_max_current"
    CYCLE_MIN_I = "cycle_min_current"

    CYCLE_MAX_V = "cycle_max_voltage"
    CYCLE_MIN_V = "cycle_min_voltage"

    CYCLE_MEAN_V = "cycle_mean_voltage"
    CYCLE_MEAN_C_V = "cycle_mean_charge_voltage"
    CYCLE_MEAN_D_V = "cycle_mean_discharge_voltage"

    CYCLE_AH_C = "cycle_charge_capacity"
    CYCLE_AH_D = "cycle_discharge_capacity"

    CYCLE_E_C = "cycle_charge_energy"
    CYCLE_E_D = "cycle_discharge_energy"

    CYCLE_MAX_P = "cycle_max_power"
    CYCLE_MAX_C_P = "cycle_max_charge_power"
    CYCLE_MAX_D_P = "cycle_max_discharge_power"

    CYCLE_MIN_P = "cycle_min_power"
    CYCLE_MIN_C_P = "cycle_min_charge_power"
    CYCLE_MIN_D_P = "cycle_min_discharge_power"

    CYCLE_MEAN_P = "cycle_mean_power"
    CYCLE_MEAN_C_P = "cycle_mean_charge_power"
    CYCLE_MEAN_D_P = "cycle_mean_discharge_power"

    CYCLE_AH_EFF = "cycle_coulombic_efficiency"
    CYCLE_E_EFF = "cycle_energy_efficiency"

    DATAPOINT_COUNT = "datapoint_count"

    CYCLE_MAX_REST_V = "cycle_max_rest_voltage"
    CYCLE_MIN_REST_V = "cycle_min_rest_voltage"

    CYCLE_TOTAL_REST_TIME = "cycle_total_rest_time"
    STEP_COUNT = "step_count"
    CYCLE_DURATION = "cycle_duration"
    REST_STEP_COUNT = "rest_step_count"
    CHARGE_STEP_COUNT = "charge_step_count"
    DISCHARGE_STEP_COUNT = "discharge_step_count"
    DV_START_C = "dv_start_of_charge"
    DV_END_C = "dv_end_of_charge"
    DV_START_D = "dv_start_of_discharge"
    DV_END_D = "dv_end_of_discharge"
    DT_START_C = "dt_start_of_charge"
    DT_END_C = "dt_end_of_charge"
    DT_START_D = "dt_start_of_discharge"
    DT_END_D = "dt_end_of_discharge"
    CYCLE_V_EFF = "cycle_voltage_efficiency"
    CYCLE_R_START_C = "cycle_resistance_start_of_charge"
    CYCLE_R_END_C = "cycle_resistance_end_of_charge"
    CYCLE_R_START_D = "cycle_resistance_start_of_discharge"
    CYCLE_R_END_D = "cycle_resistance_end_of_discharge"

    # Not used
    THICKNESS = "thickness"
    V_INIT = "v_init"
    INDENTOR = "indentor"
    NAIL_SPEED = "nail_speed"
    FILE_ID = "file_id"
    DT = "dt"
    NORM_D = "norm_d"
    AXIAL_D = "axial_d"
    STRAIN = "strain"
    CYCLE_INDEX_FILE = "cycle_index_file"
    FILENAME = "filename"
    FILE_TYPE = "file_type"

display_names = {
    "cycle":{
    "Cycle Index":"cycle_index",
    "Cycle Start Timestamp":"cycle_start_timestamp",
    "Cycle End Timestamp":"cycle_end_timestamp",
    "Cycle Duration (s)":"cycle_duration",
    "Cycle Max Current (A)":"cycle_max_current",
    "Cycle Min Current (A)":"cycle_min_current",
    "Cycle Max Voltage (V)":"cycle_max_voltage",
    "Cycle Min Voltage (V)":"cycle_min_voltage",
    "Cycle Charge Capacity (Ah)":"cycle_charge_capacity",
    "Cycle Discharge Capacity (Ah)":"cycle_discharge_capacity",
    "Cycle Charge Energy (Wh)":"cycle_charge_energy",
    "Cycle Discharge Energy (Wh)":"cycle_discharge_energy",
    "Cycle Max Power (W)":"cycle_max_power",
    "Cycle Min Power (W)":"cycle_min_power",
    "Max Charge Power (W)":"cycle_max_charge_power",
    "Cycle Min Charge Power (W)":"cycle_min_charge_power",
    "Cycle Max Discharge Power (W)":"cycle_max_discharge_power",
    "Cycle Min Discharge Power (W)":"cycle_min_discharge_power",
    "Cycle Mean Power (W)":"cycle_mean_power",
    "Cycle Mean Charge Power (W)":"cycle_mean_charge_power",
    "Cycle Mean Discharge Power (W)":"cycle_mean_discharge_power",
    "Cycle Mean Voltage (V)":"cycle_mean_voltage",
    "Cycle Mean Charge Voltage (V)":"cycle_mean_voltage",
    "Cycle Mean Discharge Voltage (V)":"cycle_mean_voltage",
    "Cycle Total Rest Time (s)":"cycle_total_rest_time",
    "Step Count (#)":"step_count",
    "Datapoint Count (#)":"datapoint_count",

    "Rest Step Count (s)":"rest_step_count",
    "Charge Step Count (#)":"charge_step_count",
    "Discharge Step Count (#)":"discharge_step_count",
    "Cycle Max Rest Voltage (V)":"cycle_max_rest_voltage",
    "Cycle Min Rest Voltage (V)":"cycle_min_rest_voltage",
    "Cycle Coulombic Efficiency (%)":"cycle_coulombic_efficiency",
    "Cycle Energy Efficiency (%)":"cycle_energy_efficiency",
    "DV Start of Charge":"dv_start_of_charge",
    "DV End of Charge":"dv_end_of_charge",
    "DV Start of Discharge":"dv_start_of_discharge",
    "DV End of Discharge":"dv_end_of_discharge",
    "DT Start of Charge":"dt_start_of_charge",
    "DT End of Charge":"dt_end_of_charge",
    "DT Start of Discharge":"dt_start_of_discharge",
    "DT End of Discharge":"dt_end_of_discharge",
    "Cycle Voltage Efficiency (%)":"cycle_voltage_efficiency",
    "Cycle Resistance Start of Charge":"cycle_resistance_start_of_charge",
    "Cycle Resistance End of Charge":"cycle_resistance_end_of_charge",
    "Cycle Resistance Start of Discharge":"cycle_resistance_start_of_discharge",
    "Cycle Resistance End of Discharge":"cycle_resistance_end_of_discharge",
    },
    "timeseries":{
    "Date Time":"date_time",
    "Test Time (s)":"test_time",
    "Cycle Index":"cycle_index",
    "Cycle Time (s)":"cycle_time",
    "Current (A)":"current",
    "Voltage (V)":"voltage",
    "Cumulative Charge Capacity (Ah)":"cumulative_charge_capacity",
    "Net Capacity (Ah)":"net_capacity",
    "Cycle Charge Capacity (Ah)":"cycle_charge_capacity",
    "Cumulative Discharge Capacity (Ah)":"cumulative_discharge_capacity",
    "Cycle Discharge Capacity (Ah)":"cycle_discharge_capacity",
    "Charge Capacity (Ah)":"charge_capacity",
    "Charge_Energy (Wh)":"charge_energy",
    "Cumulative Charge Energy (Wh)":"cumulative_charge_energy",
    "Net Energy (Wh)":"net_energy",
    "Cycle Charge Energy (Wh)":"cycle_charge_energy",
    "Discharge Energy (Wh)":"discharge_energy",
    "Discharge Capacity (Ah)":"discharge_capacity",
    "Cumulative Discharge Energy (Wh)":"cumulative_discharge_energy",
    "Cycle Discharge Energy (Wh)":"cycle_discharge_energy",
    "Environment Temperature (C)":"environment_temperature",
    "Cell Temperature (C)":"cell_temperature",
    "Power (W)":"power",
    "Step Index":"step_index",
    "Step Type":"step_type",
    "Step Time":"step_time",
    "Test Datapoint Ordinal":"test_datapoint_ordinal",
    "Step Datapoint Ordinal":"step_datapoint_ordinal",
    "Datapoint DV":"datapoint_dv",
    "Datapoint DI":"datapoint_di",
    "Datapoint DTime":"datapoint_dtime",
    "Datapoint DTemp":"datapoint_dtemp",
    "Datapoint DQ":"datapoint_dq",
    "DQ_DV":"dq_dv",
    "DV_DT":"dv_dt",
    "Capacity Throughput (Ah)":"capacity_throughput",
    "Energy Throughput (Wh)":"energy_throughput",
    "Test Net Capacity (Ah)":"test_net_capacity",
    "Test Net Energy (Wh)":"test_net_energy",}
}

RESPONSE_MESSAGE = {
    "RESERVED_PUBLIC_CELL_ID": "Cell id {} is reserved",
    "CELL_ID_EXISTS": "Cell id {} already exists",
    "CELL_ID_NOT_EXISTS": "Cell id {} does not exists",
    "CELL_ID_NOT_BLANK": "Cell id must not be blank",
    "CELL_METADATA_ADDED": "Metadata for cell id {} added successfully",
    "METADATA_UPDATED": "Metadata updated successfully",
    "INTERNAL_SERVER_ERROR": "Internal server error",
    "RECORDS_RETRIEVED": "Records Retrieved",
    "CELL_METADATA_DELETED": "Cell id {} deleted successfully",
    "ONE_REQUIRED_FIELD": "At least one field is required",
    "CELL_TEST_NOT_EXISTS": "Test does not exists for {} cell id",
    "TEST_EXISTS": "Test for cell id {} already exists",
    "TEST_NOT_EXISTS": "Test for cell id {} does not exists",
    "TEST_METADATA_ADDED": "Test metadata for cell id {} added successfully",
    "TEST_METADATA_UPDATED": "Test metadata for cell id {} updated successfully",
    "TEST_METADATA_DELETED": "Test metadata for cell id {} deleted successfully",
    "TEST_META_NOT_EXISTS": "Test metadata for cell id {} does not exixts",
    "TS_EXISTS": "Test timeseries data for cell id {} already exists",
    "TS_DELETED": "Test timeseries data for cell id {} deleted successfully",
    "TS_NOT_EXISTS": "Test timeseries data for cell id {} does not exists",
    "TS_ADDED": "Test timeseries data for cell id {} added successfully",
    "TS_UPDATED": "Test timeseries data for cell id {} updated successfully",
    "REQUIRED": "timeseries_data and stats fields are required",
    "LIST_NOT_EMPTY": "timeseries_data list cannot be empty",
    "PROCESS_COMPLETE": "Process Complete"
}
