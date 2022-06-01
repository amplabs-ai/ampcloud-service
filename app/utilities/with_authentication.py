
from functools import wraps
from app.archive_constants import MAGIC_LINK_API_SECRET
from magic_admin import Magic
from magic_admin.utils.http import parse_authorization_header_value
from flask import request, g, abort

def with_authentication(allow_public = None):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                magic = Magic(api_secret_key=MAGIC_LINK_API_SECRET)
                issuer = parse_authorization_header_value(
                    request.headers.get('Authorization'),
                )
                user = magic.User.get_metadata_by_issuer(
                    issuer,
                )
                g.user = user.data['email']
                print('g.user', g.user)
            except Exception as e:
                if allow_public:
                    g.user = "public"
                else:
                    abort(401)

            return f(*args, **kwargs)
        return decorated_function
    return decorator

def skip_default_auth(arg):
    return dict()