
import datetime
from functools import wraps
import json
from app.archive_constants import AUTH0_ALGORITHMS, AUTH0_AUDIENCE, AUTH0_DOMAIN
from flask import request, g, abort
import urllib.request
from jose import jwt

_last_result_time = None
_last_result_value = None

def get_keys():
    global _last_result_time
    global _last_result_value
    now = datetime.datetime.now()
    if not _last_result_time or now - _last_result_time > datetime.timedelta(seconds=300):
        httprequest = urllib.request.Request("https://"+AUTH0_DOMAIN+"/.well-known/jwks.json", method="GET")
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
        _last_result_value = response
        _last_result_time = now
    return _last_result_value


def with_authentication(allow_public = None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                auth = request.headers.get("Authorization", None)
                token = auth.split()[1]
                unverified_header = jwt.get_unverified_header(token)
                jwks = get_keys()
                rsa_key = {}
                for key in jwks["keys"]:
                    if key["kid"] == unverified_header["kid"]:
                        rsa_key = {
                            "kty": key["kty"],
                            "kid": key["kid"],
                            "use": key["use"],
                            "n": key["n"],
                            "e": key["e"]
                        }
                if rsa_key:
                    payload = jwt.decode(
                        token,
                        rsa_key,
                        algorithms=AUTH0_ALGORITHMS,
                        audience=AUTH0_AUDIENCE,
                        issuer="https://"+AUTH0_DOMAIN+"/"
                    )
                g.user = payload['https://user.com/email']
            except Exception as e:
                print(e)
                if allow_public:
                    g.user = "public"
                else:
                    abort(401)

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def skip_default_auth(arg):
    return dict()