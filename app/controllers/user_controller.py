import logging
from app.response import Response
from app.services.user_service import get_user_plan_service, update_user_plan_service
from app.utilities.with_authentication import with_authentication
from app.utilities.user_plan import set_user_plan
from flask import g, request
from jose import jwt


@with_authentication()
def get_user_plan():
    email = g.user
    status, detail, *records = get_user_plan_service(email)
    return Response(status, detail, records=records).to_dict(), status


@with_authentication()
@set_user_plan()
def update_user_plan():
    data = request.json
    email = g.user
    try:
        decoded_data = jwt.decode(data['code'], JWT_SECRET_FOR_PLAN_UPDATE, algorithms=['HS256'])
    except Exception as err:
        logging.error(err)
        return Response(405, "Not permitted").to_dict(), 405  
    status, detail, *records = update_user_plan_service(email)
    return Response(status, detail, records=records).to_dict(), status
