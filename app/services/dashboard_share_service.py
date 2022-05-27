import uuid
from app.model import ArchiveOperator, SharedDashboard
import logging

def dashboard_share_url_service(data, email):
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
            "sample": data['sample'],
            "is_public": data['is_public']
        }
        ao.session.execute(SharedDashboard.__table__.insert(), dashboard_values)
        return 200, dashboard_uuid
    except Exception as err:
        logging.error(err)
        return 500, "Internal Server Error"
    finally:
        ao.release_session()