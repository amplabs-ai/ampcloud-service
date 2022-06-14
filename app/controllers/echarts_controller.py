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
    st = datetime.datetime.now()
    status, detail, *records = get_cycle_quantities_by_step_service(cell_id, step, email, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CQBS size {size} fetch_time {fetch_time}".format
                 (email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status


@with_authentication(allow_public=True)
def get_energy_and_capacity_decay(cell_id):
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    st = datetime.datetime.now()
    status, detail, *records = get_energy_and_capacity_decay_service(cell_id, email, dashboard_id)
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
    st = datetime.datetime.now()
    status, detail, *records = get_efficiency_service(cell_id, email, dashboard_id)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Effi size {size} fetch_time {fetch_time}".format
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
