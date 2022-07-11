from matplotlib.pyplot import table
from app.archive_constants import RESPONSE_MESSAGE, STRIPE_API_KEY
from app.model import ArchiveOperator, UserPlan
import stripe
import logging


def handle_customer_subscription_create(create_event_obj):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        customer_id = create_event_obj['customer']
        customer = stripe.Customer.retrieve(customer_id, api_key=STRIPE_API_KEY)
        customer_email = customer['email']
        subscription_id = create_event_obj['id']
        product = stripe.Product.retrieve(create_event_obj['plan']['product'], api_key=STRIPE_API_KEY)['name']
        data = {
                "email": customer_email,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "plan_type": product.upper(),
                "state": "SUCCESS"
            }
        if ao.get_all_data_from_table_with_email(UserPlan, customer_email):
            ao.update_user_plan(data)
        else:
            ao.add_user_plan(data)
        return 200, RESPONSE_MESSAGE['PROCESS_COMPLETE']
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def handle_customer_subscription_update(update_event_obj):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        customer_id = update_event_obj['customer']
        customer = stripe.Customer.retrieve(customer_id, api_key=STRIPE_API_KEY)
        customer_email = customer['email']
        subscription_id = update_event_obj['id']
        status = update_event_obj['data']['object']['status']
        if status != "active":
            data = {
                "email": customer_email,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "plan_type": "COMMUNITY",
                "state": "SUCCESS"
            }
            ao.update_user_plan(data)
        return 200, RESPONSE_MESSAGE['PROCESS_COMPLETE']
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def handle_customer_subscription_delete(delete_event_obj):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        customer_id = delete_event_obj['customer']
        customer = stripe.Customer.retrieve(customer_id, api_key=STRIPE_API_KEY)
        customer_email = customer['email']
        subscription_id = delete_event_obj['id']
        data = {
                "email": customer_email,
                "stripe_customer_id": customer_id,
                "stripe_subscription_id": subscription_id,
                "plan_type": "COMMUNITY",
                "state": "SUCCESS"
            }
        ao.update_user_plan(data)  
        return 200, RESPONSE_MESSAGE['PROCESS_COMPLETE']
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()