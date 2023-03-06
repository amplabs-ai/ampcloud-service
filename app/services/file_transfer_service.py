import logging
from pandas import DataFrame
from app.archive_constants import LABEL, RESPONSE_MESSAGE, TESTER, S3_DATA_BUCKET
from app.model import ArchiveOperator
from app.utilities.file_reader import read_generic, read_snlabuse, read_ornlabuse
from app.utilities.utils import calc_cycle_stats, calc_abuse_stats
from app.utilities.s3_file_upload import insert_through_s3
from collections import OrderedDict
from sqlalchemy.exc import DataError
from app.utilities.aws_connection import s3_client
from app.utilities.file_status import initialise_file_status, _get_from_simple_db, _set_status

def init_file_upload_service(email, request):
    cell_ids = [cell['cell_id'] for cell in request]
    try:
        ao = ArchiveOperator()
        ao.set_session()
        existing_public_cell_id = ao.get_public_cell_meta(cell_ids)
        if existing_public_cell_id:
            return 400, RESPONSE_MESSAGE['RESERVED_PUBLIC_CELL_ID'].format(existing_public_cell_id.cell_id)
    except Exception as err:
        print(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()
    for data in request:
        status = {
            "template": data.get('template'),
            "is_public": data.get('is_public'),
            "progress": {'percentage': 1, 'message': "IN PROGRESS", "steps": OrderedDict([
                ("READ FILE", False),
                ("STATS CALCULATION", False),
                ("WRITING TO DATABASE", False)
            ])},
            "test_type": data.get('test_type')}
        initialise_file_status(email,data.get('cell_id'),status)
    _uri = s3_client.generate_presigned_url('put_object', 
                                        Params = {'Bucket': S3_DATA_BUCKET, 'Key': f"raw/{email}/{data.get('cell_id')}"},ExpiresIn = 300)
    return 200, "Success", _uri


def file_data_read_service(tester ,template,email,cell_id):
    if tester == TESTER.GENERIC.value:
        data = read_generic(template,email,cell_id)
    else:
        data = read_snlabuse(template,email,cell_id)
    return data


def file_data_process_service(cell_id, email, df_tmerge, tester):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        _set_status(email,cell_id,percentage = 10)
        if tester == TESTER.GENERIC.value:
            test = "cycle"
        else:
            test = "abuse"
        cell_metadata = DataFrame([{
            "cell_id": cell_id,
            "email": email,
            "is_public": _get_from_simple_db(email,cell_id,key="is_public")["is_public"],
            "test": test
        }])
        test_metadata = DataFrame([{
            "cell_id": cell_id,
            "email": email
        }])
        ao.remove_cell_from_archive(cell_id, email)
        ao.add_all(cell_metadata, 'cell_metadata')
        _set_status(email,cell_id,percentage = 25)
        if test == "cycle":
            stat_df, final_df = calc_cycle_stats(df_tmerge, cell_id, email)
            _set_status(email,cell_id,step_key = "STATS CALCULATION")
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            _set_status(email,cell_id,percentage = 70)
            ao.add_all(test_metadata, 'cycle_metadata')
            _set_status(email,cell_id,percentage = 75)
            if stat_df is not None:
                stat_df['cell_id'] = cell_id
                stat_df['email'] = email
                insert_through_s3(stat_df, email, cell_id, ao, type="cycle_stats")
                # ao.add_all(stat_df, 'cycle_stats')
            else:
                final_df.drop(['cycle_index'], axis=1, inplace=True)
            _set_status(email,cell_id,percentage = 80)
            insert_through_s3(final_df, email, cell_id, ao, type="cycle_timeseries")
            # ao.add_all(final_df, 'cycle_timeseries')
        else:
            test_metadata["thickness"] = 1
            final_df = calc_abuse_stats(df_tmerge, test_metadata, cell_id, email)
            _set_status(email,cell_id,step_key = "STATS CALCULATION")
            final_df['cell_id'] = cell_id
            final_df['email'] = email
            _set_status(email,cell_id,percentage = 70)
            ao.add_all(test_metadata, 'abuse_metadata')
            # ao.add_all(final_df, 'abuse_timeseries')
            insert_through_s3(final_df, email, cell_id, ao, type="abuse_timeseries")
        _set_status(email,cell_id,percentage = 78)
        _set_status(email,cell_id,percentage = 100,message="COMPLETED",step_key="WRITING TO DATABASE")
    except Exception as err:
        logging.error(err)
        _set_status(email,cell_id,percentage = -1)
        steps = _get_from_simple_db(email,cell_id,key = "steps")["progress"]["steps"]
        for key,value in steps.items():
            if not value:
                _set_status(email,cell_id,message = f"{key} Failed")
                break
    finally:
        ao.release_session()


def download_cycle_timeseries_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_cycle_ts_with_cell_id(cell_id, email)
    df.drop(LABEL.EMAIL.value, inplace=True, axis=1)
    df.drop(LABEL.INDEX.value, inplace=True, axis=1)
    df.drop(LABEL.CELL_ID.value, inplace=True, axis=1)
    ao.release_session()
    return 200, "Records Retrieved", df


def download_cycle_data_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_cycle_data_with_cell_id(cell_id, email)
    df.drop(LABEL.EMAIL.value, inplace=True, axis=1)
    df.drop(LABEL.INDEX.value, inplace=True, axis=1)
    df.drop(LABEL.CELL_ID.value, inplace=True, axis=1)
    ao.release_session()
    return 200, "Records Retrieved", df


def download_timeseries_plot_data_service(data, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        columns = (',').join(data['columns'])
        cell_ids =", ".join("'{0}'".format(i) for i in data['cell_ids'])
        filters = ""
        for filter in data['filters']:
            if filter['operation'] == '%':
                filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
            else:
                filter_str = f"{filter['column']}{filter['operation']}'{filter['filterValue']}'"
            filters = filters+f"and {filter_str}"
        df = ao.get_all_data_from_timeseries_query(columns, cell_ids, email, filters, get_df = True)
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], df
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def download_stats_plot_data_service(data, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        columns = (',').join(data['columns'])
        cell_ids =", ".join("'{0}'".format(i) for i in data['cell_ids'])
        filters = ""
        for filter in data['filters']:
            if filter['operation'] == '%':
                filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
            else:
                filter_str = f"{filter['column']}{filter['operation']}'{filter['filterValue']}'"
            filters = filters+f"and {filter_str}"
        df = ao.get_all_data_from_stats_query(columns, cell_ids, email, filters, get_df = True)
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], df
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def download_abuse_timeseries_service(cell_id, email, dashboard_id=None):
    ao = ArchiveOperator()
    ao.set_session()
    if dashboard_id and email != "public":
        dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
        if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to):
            return 401, "Unauthorised Access"
        else:
            email = dashboard_data.shared_by
            cell_id = cell_id if cell_id in dashboard_data.cell_id else None
    df = ao.get_df_abuse_ts_with_cell_id(cell_id, email)
    ao.release_session()
    return 200, "Records Retrieved", df


