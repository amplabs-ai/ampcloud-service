import uuid
from app.model import ArchiveOperator, SharedDashboard
import logging


def dashboard_share_add_service(data, email):
    ao = ArchiveOperator()
    ao.set_session()
    data['shared_to'].append(email)
    try:
        dashboard_uuid = uuid.uuid4()
        dashboard_values = {
            "uuid": dashboard_uuid,
            "shared_by": email,
            "shared_to": ",".join(data['shared_to']),
            "cell_id": ",".join(data['cell_id']),
            "test": data['test'],
            "step": data['step'],
            "sample": data.get('sample'),
            "is_public": data['is_public']
        }
        ao.session.execute(SharedDashboard.__table__.insert(), dashboard_values)
        return 200, dashboard_uuid
    except Exception as err:
        logging.error(err)
        return 500, "Internal Server Error"
    finally:
        ao.release_session()


def dashboard_share_update_service(data, email, dashboard_id):
    ao = ArchiveOperator()
    ao.set_session()
    data['shared_to'].append(email)
    try:
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        dashboard_values = {
            "uuid": dashboard_data.uuid,
            "shared_by": email,
            "shared_to": ",".join(data['shared_to']),
            "cell_id": ",".join(data['cell_id']),
            "test": data['test'],
            "step": data['step'],
            "sample": data['sample'],
            "is_public": data['is_public']
        }
        ao.session.execute(SharedDashboard.__table__.update().where(SharedDashboard.uuid == dashboard_data.uuid),
                           dashboard_values)
        return 200, dashboard_data.uuid
    except Exception as err:
        logging.error(err)
        return 500, "Internal Server Error"
    finally:
        ao.release_session()


def dashboard_share_validate_id_service(email, dashboard_id):
    ao = ArchiveOperator()
    ao.set_session()
    try:
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if dashboard_data:
            return 200, "Valid Dashboard Id"
        return 401, "Unauthorised Access"
    except Exception as err:
        logging.error(err)
        return 500, "Internal Server Error"
    finally:
        ao.release_session()
