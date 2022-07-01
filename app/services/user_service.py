import logging
from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator, UserPlan


def get_user_plan_service(email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        user_plan = ao.get_all_data_from_table_with_email(UserPlan, email)
        records = [plan.to_dict() for plan in user_plan]   
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()