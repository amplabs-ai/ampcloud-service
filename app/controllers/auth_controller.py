from app.services.auth_service import login_service
from flask import make_response, request
from app.response import Response


def login():
    email = request.get_json().get('email')
    if not email:
        return Response(200, "/").to_dict(), 200
    status, detail = login_service(email)
    resp =  make_response(Response(status, detail).to_dict())
    resp.set_cookie('userId',email)
    return resp, status

def logout():
    resp = make_response(Response(200,"Logout").to_dict())
    resp.delete_cookie('userId')
    return resp

def health_check():
    return "success", 200