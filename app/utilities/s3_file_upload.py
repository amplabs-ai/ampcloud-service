from app.queries import COPY_S3_TO_REDSHIFT
from app.utilities.aws_connection import s3_client
from app.archive_constants import AWS_IAM_ROLE, S3_DATA_BUCKET, REDSHIFT_DATABASE, REDSHIFT_SCHEMA, AWS_REGION
from shortuuid import uuid
from json import dumps
import gzip,io


def insert_through_s3(df, email, cell_id, ao, type):
        file_path = f"{type}/{email}||{cell_id}"
        df.to_csv(f's3://{S3_DATA_BUCKET}/{file_path}', index = False)
        ao.session.execute(COPY_S3_TO_REDSHIFT.format(
                database = REDSHIFT_DATABASE,
                schema = REDSHIFT_SCHEMA,
                table = type,
                columns = ', '.join(list(df.columns)),
                bucket = S3_DATA_BUCKET,
                file_path = file_path,
                iam_role = AWS_IAM_ROLE,
                region = AWS_REGION,
        ))
        s3_client.delete_object(Bucket=S3_DATA_BUCKET, Key=file_path)

def add_response_to_s3(email,response):
        response_id = uuid()
        key = f"response/{email}/{response_id}.gzip"
        inmem = io.BytesIO()
        with gzip.GzipFile(fileobj=inmem, mode='wb') as fh:
                with io.TextIOWrapper(fh, encoding='utf-8') as wrapper:
                        wrapper.write( dumps(response, indent=2, default=str))
        inmem.seek(0)
        s3_client.put_object(
                Bucket= S3_DATA_BUCKET,
                Key=key, 
                Body= inmem
                )
        _uri = s3_client.generate_presigned_url('get_object', 
                                        Params = {'Bucket': S3_DATA_BUCKET, 'Key': key},ExpiresIn = 300)
        return _uri

def add_df_to_s3(email, df, cell_id, type):
        key = f"response/{email}/{uuid()}.zip"
        compression_options = dict(method='zip', archive_name=f'{cell_id}_{type}_data.csv')
        df.to_csv( f's3://{S3_DATA_BUCKET}/{key}', index = False, compression=compression_options)
        _uri = s3_client.generate_presigned_url('get_object', 
                                        Params = {'Bucket': S3_DATA_BUCKET, 'Key': key},ExpiresIn = 300)
        return _uri

