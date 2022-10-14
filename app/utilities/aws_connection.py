import boto3
from app.archive_constants import AWS_KEY_ID, AWS_SECRET_KEY

client_sdb = boto3.client('sdb',
                            region_name = 'us-east-1',
                            aws_access_key_id = AWS_KEY_ID,
                            aws_secret_access_key = AWS_SECRET_KEY)

s3_client = boto3.client('s3',
                            aws_access_key_id = AWS_KEY_ID,
                            aws_secret_access_key = AWS_SECRET_KEY)