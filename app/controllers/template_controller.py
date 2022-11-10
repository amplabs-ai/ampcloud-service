from flask import request, g
from app.utilities.with_authentication import with_authentication
from app.services.template_service import *
from app.response import Response
import logging


@with_authentication()
def create_template():
    try:
        email = g.user
        data = request.get_json()
        status, detail = create_template_service(email, data)
        return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
def get_details_from_template():
    try:
        email = g.user
        status, detail, *records = get_details_from_template_service(email)
        return Response(status, detail, records).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500


@with_authentication()
def delete_template(template):
    try:
        email = g.user
        status, detail = delete_template_service(email,template)
        return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Failed").to_dict(), 500