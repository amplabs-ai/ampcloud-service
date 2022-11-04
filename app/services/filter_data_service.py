from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator
import logging


def get_filter_data_service(email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        records = {}

        anode = []
        anode_cell = ao.get_anode_filter_query(email)
        for row in anode_cell:
            row = dict(row)
            anode.append(row["anode"])
        records["anode"] = anode

        cathode = []
        cathode_cell = ao.get_cathode_filter_query(email)
        for row in cathode_cell:
            row = dict(row)
            cathode.append(row["cathode"])
        records["cathode"] = cathode

        format_shape = []
        format_cell = ao.get_format_filter_query(email)
        for row in format_cell:
            row = dict(row)
            format_shape.append(row["format_shape"])
        records["format_shape"] = format_shape

        test_type = []
        test_cell = ao.get_test_filter_query(email)
        for row in test_cell:
            row = dict(row)
            test_type.append(row["type_of_test"])
        records["test_type"] = test_type

        temperature = {}
        temp_cell = ao.get_temp_filter_query(email)
        for row in temp_cell:
            row = dict(row)
            temperature["min"] = row["min_temp"]
            temperature["max"] = row["max_temp"]
        records["temperature"] = temperature

        charge_rate = {}
        discharge_rate = {}
        rate_cell = ao.get_rate_filter_query(email)
        for row in rate_cell:
            row = dict(row)
            charge_rate["min"] = row["min_charge_rate"]
            charge_rate["max"] = row["max_charge_rate"]
            discharge_rate["min"] = row["min_discharge_rate"]
            discharge_rate["max"] = row["max_discharge_rate"]
        records["charge_rate"] = charge_rate
        records["discharge_rate"] = discharge_rate

        capacity = {}
        capacity_cell = ao.get_capacity_filter_query(email)
        for row in capacity_cell:
            row = dict(row)
            capacity["min"] = row["min_capacity"]
            capacity["max"] = row["max_capacity"]
        records["capacity"] = capacity

        return 200,RESPONSE_MESSAGE['RECORDS_RETRIEVED'],records

    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL SERVER ERROR']
    finally:
        ao.release_session()
