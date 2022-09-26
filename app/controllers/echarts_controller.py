from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.services.echarts_service import *
from app.response import Response
import datetime
import logging
from pympler.asizeof import asizeof


@with_authentication(allow_public=True)
def get_cycle_quantities_by_step(cell_id, step):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    mod_step = request.args.to_dict().get('mod_step') or 5
    st = datetime.datetime.now()
    status, detail, *records = get_cycle_quantities_by_step_service(cell_id, step, email, mod_step, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CQBS size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication(allow_public=True)
def get_galvanostatic_plot():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_galvanostatic_plot_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Galvanostatic size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication(allow_public=True)
def get_energy_and_capacity_decay(cell_id):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    mod_step = request.args.to_dict().get('mod_step') or 5
    st = datetime.datetime.now()
    status, detail, *records = get_energy_and_capacity_decay_service(cell_id, email, mod_step, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data EACD size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_efficiency(cell_id):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    mod_step = request.args.to_dict().get('mod_step') or 5
    st = datetime.datetime.now()
    status, detail, *records = get_efficiency_service(cell_id, email, mod_step, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Effi size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_coulombic_efficiency():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_coulombic_efficiency_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data AhEffi size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_compare_by_cycle_time(cell_id):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    st = datetime.datetime.now()
    status, detail, *records = get_compare_by_cycle_time_service(cell_id, email, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CBCT size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_differential_capacity():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_differential_capacity_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data DiffCapacity size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_voltage_time():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_voltage_time_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data VolageTime size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_current_time():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_current_time_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CurrentTime size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication(allow_public=True)
def get_force_and_displacement(cell_id, sample):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    st = datetime.datetime.now()
    status, detail, *records = get_force_and_displacement_service(cell_id, email, sample, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Force/Disp size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_test_tempratures(cell_id, sample):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    st = datetime.datetime.now()
    status, detail, *records = get_test_tempratures_service(cell_id, email, sample, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data TestTemp size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_voltage(cell_id, sample):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    st = datetime.datetime.now()
    status, detail, *records = get_voltage_service(cell_id, email, sample, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Volt size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication(allow_public=True)
def get_capacity_retention():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_capacity_retention_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CapacityRetention size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_capacity():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_capacity_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Capacity size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_energy_desnity():
    email = g.user
    req_data = request.json
    st = datetime.datetime.now()
    status, detail, *records = get_energy_density_service(req_data, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data EnergyDensity size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_timeseries_columns_data():
    email = g.user
    data = request.json
    status, detail, *records = get_timeseries_columns_data_service(data, email)
    return Response(status, detail, records).to_dict(), status


@with_authentication()
def get_stats_columns_data():
    email = g.user
    data = request.json
    status, detail, *records = get_stats_columns_data_service(data, email)
    return Response(status, detail, records).to_dict(), status


def get_metadata_summary():
    status, detail, *records = get_metadata_summary_service()
    return Response(status, detail, records).to_dict(), status