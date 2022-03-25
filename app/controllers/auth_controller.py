from flask import make_response, request
from app.response import Response


def login():
    email = request.get_json().get('email')
    resp =  make_response(Response(200,"Login").to_dict())
    resp.set_cookie('userId',email)
    return resp

def logout():
    resp = make_response(Response(200,"Logout").to_dict())
    resp.delete_cookie('userId')
    return resp