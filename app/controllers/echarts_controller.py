from app.utilities.with_authentication import with_authentication
from flask import request, g
from app.services.echarts_service import *
from app.response import Response
import logging
from time import time
import os
from app.utilities.s3_file_upload import add_response_to_s3
import json

ENV = os.getenv('ENV')

@with_authentication(allow_public=True)
def get_galvanostatic_plot():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_galvanostatic_plot_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data Galvanostatic size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_coulombic_efficiency():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_coulombic_efficiency_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data AhEffi size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_differential_capacity():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_differential_capacity_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data DiffCapacity size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_voltage_time():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_voltage_time_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data VolageTime size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_current_time():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_current_time_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data CurrentTime size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_capacity():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_capacity_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data Capacity size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_operating_potential():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_operating_potential_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data OperatingPotential size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_energy_desnity():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_energy_density_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data EnergyDensity size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_force_and_displacement():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_force_and_displacement_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data Force/Disp size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_test_tempratures():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_test_tempratures_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data TestTemp size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication(allow_public=True)
def get_voltage():
    email = g.user
    dashboard_id = request.args.to_dict().get('dashboard_id')
    req_data = request.json
    st = time()
    status, detail, *records = get_voltage_service(req_data, email, dashboard_id)
    size = 0
    fetch_time = time()-st
    logging.info("User {email} Action CHART_PREPARATION_TIME data Volt size {size} fetch_time {fetch_time}".format
                    (email=email, size=size, fetch_time=fetch_time))
    # if ENV == "production":
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication()
def get_timeseries_columns_data(test):
    email = g.user
    data = request.json
    status, detail, *records = get_timeseries_columns_data_service(data, email, test)
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication()
def get_stats_columns_data():
    email = g.user
    data = request.json
    status, detail, *records = get_stats_columns_data_service(data, email)
    if status == 200:
        result_response = Response(status, detail, records = records).to_json()
        s3_url = add_response_to_s3(email,result_response)
        return Response(status, detail, url=s3_url).to_dict(), status
    return Response(status, detail, records=records).to_dict(), status


@with_authentication()
def get_metadata_summary():
    email = g.user
    status, detail, *records = get_metadata_summary_service(email)
    return Response(status, detail, records=records).to_dict(), status