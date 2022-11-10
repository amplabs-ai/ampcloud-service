from app.utilities.aws_connection import client_sdb
from app.archive_constants import DOMAIN_NAME, RESPONSE_MESSAGE


def create_template_service(email,request):
    try:
        response = client_sdb.list_domains()
        if(DOMAIN_NAME not in response['DomainNames']):
            dom = client_sdb.create_domain(DomainName=DOMAIN_NAME)
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
        if(client_sdb.batch_put_attributes(DomainName = DOMAIN_NAME,Items = data)):
            return 200, "Success"
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']


def get_details_from_template_service(email):
    try:
        response = client_sdb.select(
                        SelectExpression=f"select * from `{DOMAIN_NAME}` where itemName() LIKE '{email}||%' ")
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
        response = client_sdb.delete_attributes(DomainName=DOMAIN_NAME,ItemName=template)
        return 200,"Template Deleted"
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']