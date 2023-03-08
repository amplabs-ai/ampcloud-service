from app.archive_constants import ENV, STATUS_DOMAIN_NAME_SDB
from app.utilities.aws_connection import client_sdb
from json import dumps,loads

status = {}

def initialise_file_status(email,cell_id,object):
    if ENV == "production":
        response = client_sdb.list_domains()
        if(STATUS_DOMAIN_NAME_SDB not in response['DomainNames']):
            client_sdb.create_domain(DomainNames = STATUS_DOMAIN_NAME_SDB)
        res = client_sdb.batch_put_attributes(
                                    DomainName = STATUS_DOMAIN_NAME_SDB,
                                    Items = [{
                                        'Name': f"{email}|{cell_id}",
                                        'Attributes': [{
                                            'Name': 'value',
                                            'Value': dumps(object),
                                            'Replace': True
                                        }]
                                    },
                                ]
        )
    else:
        status[f"{email}|{cell_id}"] = object


def _get_key_from_status_object(email,cell_id,key=None):
    if key and ENV == "production":
        response = client_sdb.select(SelectExpression=f"select * from `{STATUS_DOMAIN_NAME_SDB}` where itemName() = '{email}|{cell_id}'", ConsistentRead=True)
        if response.get('Items'):
            for element in response['Items']:
                status_map = loads(element['Attributes'][0]['Value'])
                return status_map
    else:
        return status[f"{email}|{cell_id}"]

def _set_status(email,cell_id,percentage=None,message=None,step_key=None):
    if ENV == "production":
        response = client_sdb.list_domains()
        if(STATUS_DOMAIN_NAME_SDB not in response['DomainNames']):
            client_sdb.create_domain(DomainNames = STATUS_DOMAIN_NAME_SDB)
        response = client_sdb.select(SelectExpression=f"select * from `{STATUS_DOMAIN_NAME_SDB}` where itemName() = '{email}|{cell_id}'", ConsistentRead=True)

    if ENV != "production" or response.get('Items'):
        value = loads(response.get('Items')[0]['Attributes'][0]['Value']) if ENV == "production" else status[f"{email}|{cell_id}"]
        if percentage:
            value['progress']['percentage'] = percentage
        if message:
            value['progress']['message'] = message
        if step_key:
            value['progress']['steps'][step_key] = True
        
        if ENV == "production":
            res = client_sdb.batch_put_attributes(
                                    DomainName = STATUS_DOMAIN_NAME_SDB,
                                    Items = [{
                                        'Name': f"{email}|{cell_id}",
                                        'Attributes': [{
                                            'Name': 'value',
                                            'Value': dumps(value),
                                            'Replace': True
                                        }]
                                    },
                                ]
        )
        else:
            status[f"{email}|{cell_id}"] = value


def _delete_status(email,cell_ids):
    items = []
    for cell_id in cell_ids:
        if ENV == "production":
            items.append({'Name':f"{email}|{cell_id}"})
            response = client_sdb.batch_delete_attributes(
                                    DomainName = STATUS_DOMAIN_NAME_SDB,
                                    Items = items
            )
        else:
            del status[f"{email}|{cell_id}"]