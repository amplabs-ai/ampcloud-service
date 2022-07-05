from functools import wraps
import logging
from app.model import ArchiveOperator, UserPlan
from flask import g

def set_user_plan():
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                ao = ArchiveOperator()
                ao.set_session()
                user_plan = ao.get_all_data_from_table_with_email(UserPlan, g.user)
                records = [plan.to_dict() for plan in user_plan]   
                if records:
                    g.user_plan = records[0]['plan_type']
                else:
                    data = {
                        "email": g.user,
                        "stripe_customer_id": None,
                        "stripe_subscription_id": None,
                        "plan_type": "COMMUNITY",
                        "state": "SUCCESS"
                    }
                    ao.add_user_plan(data)
                    g.user_plan = "COMMUNITY"
            except Exception as err:
                logging.error(err)
                g.user_plan = "COMMUNITY"
            finally:
                ao.release_session()
            return f(*args, **kwargs)
        return decorated_function
    return decorator