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
        records = []
        for element in response['Items']:
            records.append(element["Name"].split("||")[1])
        return 200,"Records Retrived", records
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']    