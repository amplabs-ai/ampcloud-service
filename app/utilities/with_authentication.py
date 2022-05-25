
from functools import wraps
from magic_admin import Magic
# Pass your API secret key directly to the Magic.
from magic_admin.utils.http import parse_authorization_header_value
from magic_admin.error import DIDTokenError
from flask import request, g, abort

def with_authentication():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                issuer = parse_authorization_header_value(
                    request.headers.get('Authorization'),
                )
                user = magic.User.get_metadata_by_issuer(
                    issuer,
                )
                print(user.data['email'])
                g.user = user
            except Exception as e:
                abort(401)

            return f(*args, **kwargs)
        return decorated_function
    return decorator