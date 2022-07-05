from app.response import Response
from app.services.user_service import get_user_plan_service, update_user_plan_service
from app.utilities.with_authentication import with_authentication
from flask import g


@with_authentication()
def get_user_plan():
    email = g.user
    status, detail, *records = get_user_plan_service(email)
    return Response(status, detail, records).to_dict(), status

@with_authentication()
def update_user_plan():
    email = g.user
    status, detail, *records = update_user_plan_service(email)
    return Response(status, detail, records).to_dict(), status