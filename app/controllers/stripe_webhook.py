import stripe
from app.archive_constants import STRIPE_ENDPOINT_SECRET
from app.response import Response
from app.services.stripe_webhook_service import handle_customer_subscription_create, handle_customer_subscription_delete, handle_customer_subscription_update
from flask import request


def webhook():
    event = None
    payload = request.data
    sig_header = request.headers['STRIPE_SIGNATURE']
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_ENDPOINT_SECRET
        )
    except ValueError as e:
        return Response(400, "Invalid payload").to_dict(), 400
    except stripe.error.SignatureVerificationError as e:
        return Response(400, "Invalid signature").to_dict(), 400
    if event['type'] == 'customer.subscription.created':
        status, detail = handle_customer_subscription_create(event['data']['object'])
    elif event['type'] == 'customer.subscription.deleted':
        status, detail = handle_customer_subscription_delete(event['data']['object'])
    elif event['type'] == 'customer.subscription.updated':
        status, detail = handle_customer_subscription_update(event['data']['object'])
    else:
        pass
    return Response(status, detail).to_dict(), status