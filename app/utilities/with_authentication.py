
from functools import wraps
import json
from app.archive_constants import AUTH0_DOMAIN
from flask import request, g, abort
import urllib.request

def with_authentication(allow_public = None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                httprequest = urllib.request.Request(f'https://{AUTH0_DOMAIN}/userinfo', method="GET")
                httprequest.add_header("Authorization", request.headers.get("Authorization", None))
                with urllib.request.urlopen(httprequest) as httpresponse:
                    response = json.loads(httpresponse.read())
                    print('resp', response)
                g.user = response['email']
            except Exception as err:
                print('err', err)
                if allow_public:
                    g.user = "public"
                else:
                    abort(401)

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def skip_default_auth(arg):
    return dict()