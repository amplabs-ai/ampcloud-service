from boto3 import client
from app.archive_constants import AWS_KEY_ID, AWS_SECRET_KEY, AWS_REGION
from botocore.client import Config

client_sdb = client('sdb',
                            region_name = AWS_REGION,
                            aws_access_key_id = AWS_KEY_ID,
                            aws_secret_access_key = AWS_SECRET_KEY)


s3_client = client('s3',
                        aws_access_key_id = AWS_KEY_ID,
                        aws_secret_access_key = AWS_SECRET_KEY)