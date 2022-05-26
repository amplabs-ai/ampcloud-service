from math import floor
import sys
from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.services.echarts_service import *
from app.response import Response
import datetime
import logging
from pympler.asizeof import asizeof

@with_authentication()
def get_cycle_quantities_by_step(cell_id, step):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_cycle_quantities_by_step_service(cell_id, step, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CQBS size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_energy_and_capacity_decay(cell_id):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_energy_and_capacity_decay_service(cell_id, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data EACD size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_efficiency(cell_id):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_efficiency_service(cell_id, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Effi size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_compare_by_cycle_time(cell_id):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_compare_by_cycle_time_service(cell_id, email)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data CBCT size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_force_and_displacement(cell_id, sample):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_force_and_displacement_service(cell_id, email, sample)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Force/Disp size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_test_tempratures(cell_id, sample):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_test_tempratures_service(cell_id, email, sample)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data TestTemp size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def get_voltage(cell_id, sample):
    email = g.user.data['email']
    st = datetime.datetime.now()
    status, detail, *records = get_voltage_service(cell_id, email, sample)
    et = datetime.datetime.now()
    size = float(asizeof(records)/1000)
    fetch_time = (et-st).total_seconds()*1000
    logging.info("User {email} Action CHART_PREPARATION_TIME data Volt size {size} fetch_time {fetch_time}".format(email=email, size=size, fetch_time=fetch_time))
    return Response(status, detail, records).to_dict(), status
