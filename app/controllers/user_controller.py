import datetime
import logging
from app.archive_constants import JWT_SECRET_FOR_PLAN_UPDATE, RESPONSE_MESSAGE
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
    return Response(status, detail, records).to_dict(), status


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
    return Response(status, detail, records).to_dict(), status


def get_update_code():
    try: 
        token = jwt.encode({'plan_type': 'COMMUNITY',"exp": datetime.datetime.now(tz=datetime.timezone.utc) + datetime.timedelta(seconds=300)}, JWT_SECRET_FOR_PLAN_UPDATE, algorithm='HS256')
        return Response(200,token).to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500,RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']).to_dict(), 500
