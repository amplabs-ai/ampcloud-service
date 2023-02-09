import logging
from app.response import Response
from app.services.dashboard_share_service import dashboard_share_add_service, dashboard_share_update_service
from app.utilities.with_authentication import with_authentication
from flask import request, g


@with_authentication(allow_public=True)
def dashboard_audit():
    try:
        email = g.user
        args = request.args.to_dict()
        logTxt = 'User {} Action ' + args.get('action').upper()
        logging.info(logTxt.format(email))
        return Response(200, "Success").to_dict(), 200
    except Exception as err:
        logging.error(err)
        return Response(500, "Internal Server Error").to_dict(), 500


@with_authentication()
def dashboard_share_url():
    try:
        email = g.user
        data = request.json
        if request.method == 'POST':
            status, detail, *records = dashboard_share_add_service(data, email)
            return Response(status, detail).to_dict(), status
        elif request.method == 'PATCH':
            dashboard_id = request.args.to_dict().get('dashboard_id')
            status, detail, *records = dashboard_share_update_service(data, email, dashboard_id)
            return Response(status, detail).to_dict(), status
    except Exception as err:
        logging.error(err)
        return Response(500, "Internal Server Error").to_dict(), 500

