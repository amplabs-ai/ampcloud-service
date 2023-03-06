import datetime
from pandas import read_csv, DataFrame, to_datetime, to_numeric, Timestamp, to_timedelta
from app.amplabs_exception.amplabs_exception import AmplabsException
from app.archive_constants import LABEL,S3_DATA_BUCKET, INP_LABELS
from app.utilities.file_parsing import unit_conversion, col_mappings, get_template_data
from app.utilities.aws_connection import s3_client


def read_generic(template, email,cell_id, mapping='test_time,current,voltage'):
    df_tmerge = DataFrame()
    df_time_series_file = read_csv(
                            f's3://{S3_DATA_BUCKET}/raw/{email}/{cell_id}',
                            compression='gzip'
                        )
    s3_client.delete_object(Bucket=S3_DATA_BUCKET, Key=f'raw/{email}/{cell_id}')
    try:
        if template:
            template_data = get_template_data(template,email)
            unit_conversion(df_time_series_file,template_data)
            df_time_series_file = col_mappings(df_time_series_file,template_data)
    except Exception as err:
        print(err)
        raise AmplabsException("File not in accordance with the selected template")

    column_list = mapping.split(",")
    missing_columns = set(column_list).difference(set(df_time_series_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")
    df_ts = DataFrame()
    for col in column_list:
        if col == 'date_time':
            df_ts['date_time'] = to_datetime(
                df_time_series_file[col], format='%Y-%m-%d %H:%M:%S.%f')
        elif col == 'test_time' and df_time_series_file.dtypes[col] == 'object':
            df_ts['test_time'] = to_datetime(
                df_time_series_file[col])
            df_ts['test_time'] = (df_ts['test_time'] - df_ts['test_time'][0]).dt.total_seconds()
        elif col != "skip":
            df_ts[col] = df_time_series_file[col].apply(
                to_numeric)

    # need at the least one of date_time or test_time
    # TODO: how do we fail the import?

    if "date_time" not in df_ts.columns and "test_time" in df_ts.columns:
        df_ts['date_time'] = Timestamp(
            datetime.datetime.now()) + to_timedelta(df_ts['test_time'], unit='s')

    if "date_time" in df_ts.columns and "test_time" not in df_ts.columns:
        df_ts['test_time'] = df_ts['date_time'] - \
                             df_ts['date_time'].iloc[0]
        df_ts['test_time'] = df_ts['test_time'].dt.total_seconds()

    df_ts[LABEL.AH_C.value] = df_time_series_file[
        LABEL.AH_C.value] if LABEL.AH_C.value in df_time_series_file.columns else 0
    df_ts[LABEL.E_C.value] = df_time_series_file[
        LABEL.E_C.value] if LABEL.E_C.value in df_time_series_file.columns else 0
    df_ts[LABEL.AH_D.value] = df_time_series_file[
        LABEL.AH_D.value] if LABEL.AH_D.value in df_time_series_file.columns else 0
    df_ts[LABEL.E_D.value] = df_time_series_file[
        LABEL.E_D.value] if LABEL.E_D.value in df_time_series_file.columns else 0
    # df_ts['cycle_index_file'] = df_ts[
    #     'cycle'].apply(to_numeric)
    df_ts[LABEL.CYCLE_TIME.value] = 0
    # df_ts['filename'] = file.filename

    if LABEL.CELL_TEMP.value in df_time_series_file:
        df_ts[LABEL.CELL_TEMP.value] = df_time_series_file[LABEL.CELL_TEMP.value]
        df_ts[LABEL.DATAPOINT_DTEMP.value] = df_time_series_file[LABEL.CELL_TEMP.value].diff().fillna(0)

    if LABEL.ENV_TEMP.value in df_time_series_file:
        df_ts[LABEL.ENV_TEMP.value] = df_time_series_file[LABEL.ENV_TEMP.value]

    if LABEL.STEP_INDEX.value in df_time_series_file:
        df_ts[LABEL.STEP_INDEX.value] = df_time_series_file[LABEL.STEP_INDEX.value]
    
    if "cycle_index" in df_time_series_file.columns:
        df_ts[LABEL.CYCLE_INDEX.value] = df_time_series_file['cycle_index'].apply(to_numeric)

    if df_tmerge.empty:
        df_tmerge = df_ts[df_ts[LABEL.TEST_TIME.value] > 0]
    else:
        df_tmerge = df_tmerge.append(
            df_ts[df_ts[LABEL.TEST_TIME.value] > 0], ignore_index=True)
    # df_tmerge.rename(columns={'current': 'i', 'voltage': 'v'}, inplace=True)
    return df_tmerge


def read_ornlabuse(template, email, cell_id):
    df_tmerge = DataFrame()
    df_ts_file = read_csv(
                            f's3://{S3_DATA_BUCKET}/raw/{email}/{cell_id}',
                            compression='gzip'
                        )
    s3_client.delete_object(Bucket=S3_DATA_BUCKET, Key=f'raw/{email}/{cell_id}')

    try:
        if template:
            template_data = get_template_data(template,email)
            unit_conversion(df_ts_file,template_data)
            df_ts_file = col_mappings(df_ts_file,template_data)
    except Exception as err:
        print(err)
        raise AmplabsException("File not in accordance with the selected template")

    column_list = ['Running Time', 'Axial Force', 'Analog 1', 'Axial Displacement', 'Running Time 1', 'TC 01', 'TC 02',
                   'TC 03', 'TC 04', 'TC 05', 'TC 06']
    missing_columns = set(column_list).difference(set(df_ts_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")
    
    df_ts_a = DataFrame()
    df_ts_a['test_time'] = df_ts_file['Running Time']
    df_ts_a['axial_d'] = df_ts_file['Axial Displacement']
    df_ts_a['voltage'] = df_ts_file['Analog 1']
    df_ts_a['axial_f'] = df_ts_file['Axial Force']
    df_ts_a[LABEL.temp_1.value] = 0
    df_ts_a[LABEL.temp_2.value] = 0
    df_ts_a[LABEL.temp_3.value] = 0
    df_ts_a[LABEL.temp_4.value] = 0
    df_ts_a[LABEL.temp_5.value] = 0
    df_ts_a[LABEL.temp_6.value] = 0

    df_ts_b = DataFrame()
    df_ts_b['test_time'] = df_ts_file['Running Time 1']
    df_ts_b[LABEL.AXIAL_D.value] = 0
    df_ts_b[LABEL.V.value] = 0
    df_ts_b[LABEL.AXIAL_F.value] = 0
    df_ts_b[LABEL.temp_1.value] = df_ts_file[
        INP_LABELS.TC_01.value]
    df_ts_b[LABEL.temp_2.value] = df_ts_file[
        INP_LABELS.TC_02.value]
    df_ts_b[LABEL.temp_3.value] = df_ts_file[
        INP_LABELS.TC_03.value]
    df_ts_b[LABEL.temp_4.value] = df_ts_file[
        INP_LABELS.TC_04.value]
    df_ts_b[LABEL.temp_5.value] = df_ts_file[
        INP_LABELS.TC_05.value]
    df_ts_b[LABEL.temp_6.value] = df_ts_file[
        INP_LABELS.TC_06.value]
    
    df_tmerge = df_ts_a
    df_tmerge = df_tmerge.append(df_ts_b, ignore_index=True)
    return df_tmerge



def read_snlabuse(template, email, cell_id):
    df_tmerge = DataFrame()
    df_ts_file = read_csv(
                            f's3://{S3_DATA_BUCKET}/raw/{email}/{cell_id}',
                            compression='gzip'
                        )
    s3_client.delete_object(Bucket=S3_DATA_BUCKET, Key=f'raw/{email}/{cell_id}')
    try:
        if template:
            template_data = get_template_data(template,email)
            unit_conversion(df_ts_file,template_data)
            df_ts_file = col_mappings(df_ts_file,template_data)
    except Exception as err:
        print(err)
        raise AmplabsException("File not in accordance with the selected template")
    column_list = ['test_time', 'v', 'pos_terminal_temperature', 'neg_terminal_temperature', 'left_bottom_temperature', 'right_bottom_temperature',
                   'above_punch_temperature', 'below_punch_temperature']
    missing_columns = set(column_list).difference(set(df_ts_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")
    df_ts = DataFrame()
    if "axial_d" in (list(df_ts_file.columns)):
        df_ts[LABEL.AXIAL_D.value] = df_ts_file[
            INP_LABELS.AXIAL_D.value]
        df_ts[LABEL.AXIAL_F.value] = df_ts_file[
            INP_LABELS.AXIAL_F.value]
    df_ts[LABEL.TEST_TIME.value] = df_ts_file[
        INP_LABELS.TEST_TIME.value]
    df_ts[LABEL.V_ABUSE.value] = df_ts_file[INP_LABELS.V.value]
    df_ts[LABEL.temp_1.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_01.value])
    df_ts[LABEL.temp_2.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_02.value])
    df_ts[LABEL.temp_3.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_03.value])
    df_ts[LABEL.temp_4.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_04.value])
    df_ts[LABEL.temp_5.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_05.value])
    df_ts[LABEL.temp_6.value] = to_numeric(df_ts_file[
        INP_LABELS.TC_06.value])
    
    df_tmerge = df_ts
    return df_tmerge