from app.services.auth_service import login_service
from flask import make_response, request
from app.response import Response
import logging


def login():
    email = request.get_json().get('email')
    if not email:
        return Response(200, "/").to_dict(), 200
    status, detail = login_service(email)
    resp =  make_response(Response(status, detail).to_dict())
    resp.set_cookie('userId',email)
    logging.info("User {} Action LOGIN".format(email))
    return resp, status

def logout():
    email = request.cookies.get('userId')
    resp = make_response(Response(200,"Logout").to_dict())
    resp.delete_cookie('userId')
    if (not email):
        email = "someone@host.com"
    logging.info("User {} Action LOGOUT".format(email))
    return resp

def health_check():
    return "success", 200