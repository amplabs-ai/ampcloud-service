from app.utilities.aws_connection import client_sdb
from app.archive_constants import ENV, TEMPLATE_DOMAIN_NAME_SDB, RESPONSE_MESSAGE
from flask import current_app

def create_template_service(email,request):
    try:
        response = client_sdb.list_domains()
        if(TEMPLATE_DOMAIN_NAME_SDB not in response['DomainNames']):
            dom = client_sdb.create_domain(DomainName=TEMPLATE_DOMAIN_NAME_SDB)
        data = []
        data_dict = {}
        request['name'] = f"{email}||{request['name']}"
        data_dict['Name'] = request['name']
        Attributes = []
        for key,value in request['properties'].items():
            temp = {}
            temp['Name'] = key
            temp["Value"] = value[0]+"||"+value[1]
            Attributes.append(temp)
        data_dict['Attributes'] = Attributes
        data.append(data_dict)
        if ENV == "production":
            if(client_sdb.batch_put_attributes(DomainName = TEMPLATE_DOMAIN_NAME_SDB,Items = data)):
                return 200, "Success"
        else: 
            current_app.config['local_template'].append(data[0])
            return 200, "Success"
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def get_details_from_template_service(email):
    response = {}
    try:
        if ENV == "production":
            response = client_sdb.select(
                            SelectExpression=f"select * from `{TEMPLATE_DOMAIN_NAME_SDB}` where itemName() LIKE '{email}||%' ")
        else:
            response['Items'] = current_app.config['local_template']
        records = {}
        if response.get('Items'):
            for element in response['Items']:
                attri_lst = []
                for value in element['Attributes']:
                    attri_dict = {}
                    attri_dict["column"] = value['Name']
                    attri_dict["mapping"] = value['Value'].split("||")[0]
                    attri_dict["unit"] = value['Value'].split("||")[1]
                    attri_lst.append(attri_dict)
                records[element["Name"].split("||")[1]] = attri_lst
        return 200,"Records Retrived", records
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def delete_template_service(email,template):
    try:
        template = f"{email}||{template}"
        response = client_sdb.delete_attributes(DomainName=TEMPLATE_DOMAIN_NAME_SDB,ItemName=template)
        return 200,"Template Deleted"
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']