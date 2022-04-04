
from flask import request, jsonify
from app.response import Response
from app.utilities.utils import status

def get_status():
    email = request.cookies.get("userId")   
    return jsonify(Response(200, "Status Received", status.get(email)).to_dict()), 200