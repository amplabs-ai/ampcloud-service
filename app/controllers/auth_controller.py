from app.services.auth_service import login_service
from app.utilities.with_authentication import with_authentication
from flask import make_response, g
from app.response import Response
import logging


@with_authentication()
def login():
    email = g.user.data['email']
    if not email:
        return Response(200, "/").to_dict(), 200
    status, detail = login_service(email)
    resp =  make_response(Response(status, detail).to_dict())
    resp.set_cookie('userId',email)
    logging.info("User {} Action LOGIN".format(email))
    return resp, status

@with_authentication()
def logout():
    email = g.user.data['email']
    resp = make_response(Response(200,"Logout").to_dict())
    resp.delete_cookie('userId')
    if (not email):
        email = "someone@host.com"
    logging.info("User {} Action LOGOUT".format(email))
    return resp

def health_check():
    return "success", 200