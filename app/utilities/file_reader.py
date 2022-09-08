import gzip
import datetime
import pandas as pd
from app.archive_constants import ARCHIVE_COLS, FORMAT, INP_LABELS, LABEL


def read_generic(file, mapping='test_time,current,voltage', column_mapping=None):
    df_tmerge = pd.DataFrame()
    with gzip.open(file, 'rb') as decompressed_file:
        df_time_series_file = pd.read_csv(decompressed_file, sep=',')
    # validating renaming optional columns:
    columns_to_rename = {}
    if not column_mapping:
         for col in df_time_series_file.columns:
            column = col.lower().strip()
            if 'discharge' in column and 'capacity' in column:
                columns_to_rename[col] = LABEL.AH_D.value
            elif 'charge' in column and 'capacity' in column:
                columns_to_rename[col] = LABEL.AH_C.value
            elif 'discharge' in column and 'energy' in column:
                columns_to_rename[col] = LABEL.E_D.value
            elif 'charge' in column and 'energy' in column:
                columns_to_rename[col] = LABEL.E_C.value
            elif 'date' in column and 'time' in column:
                columns_to_rename[col] = LABEL.DATE_TIME.value
            elif 'cell' in column and 'temperature' in column:
                columns_to_rename[col] = LABEL.CELL_TEMP.value
            elif 'environment' in column and 'temperature' in column:
                columns_to_rename[col] = LABEL.ENV_TEMP.value
            elif 'step' in column and 'index' in column:
                columns_to_rename[col] = LABEL.STEP_INDEX.value
    else:
        updated_columns = []
        missing_col_count = 1
        for a in df_time_series_file.columns:
            if "Unnamed" in a:
                updated_columns.append(f"--missing header({missing_col_count})--")
                missing_col_count+=1
            else:
                updated_columns.append(a)

        df_time_series_file.columns = updated_columns
        for key, value in column_mapping.items():
            if value == "" or value == None:
                df_time_series_file.drop(key, axis=1, inplace=True)
            else:
                columns_to_rename[key] = value

    df_time_series_file.rename(columns=columns_to_rename, inplace=True)
    column_list = mapping.split(",")
    missing_columns = set(column_list).difference(set(df_time_series_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")

    df_ts = pd.DataFrame()
    for col in column_list:
        if col == 'date_time':
            df_ts['date_time'] = pd.to_datetime(
                df_time_series_file[col], format='%Y-%m-%d %H:%M:%S.%f')
        elif col == 'test_time' and df_time_series_file.dtypes[col] == 'object':
            df_ts['test_time'] = pd.to_datetime(
                df_time_series_file[col])
            df_ts['test_time'] = (df_ts['test_time'] - df_ts['test_time'][0]).dt.total_seconds()
        elif col != "skip":
            df_ts[col] = df_time_series_file[col].apply(
                pd.to_numeric)

    # need at the least one of date_time or test_time
    # TODO: how do we fail the import?
    
    if "date_time" not in df_ts.columns and "test_time" in df_ts.columns:
        df_ts['date_time'] = pd.Timestamp(
            datetime.datetime.now()) + pd.to_timedelta(df_ts['test_time'], unit='s')

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
    #     'cycle'].apply(pd.to_numeric)
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
        df_ts[LABEL.CYCLE_INDEX.value] = df_time_series_file['cycle_index'].apply(pd.to_numeric)

    if df_tmerge.empty:
        df_tmerge = df_ts[df_ts[LABEL.TEST_TIME.value] > 0]
    else:
        df_tmerge = df_tmerge.append(
            df_ts[df_ts[LABEL.TEST_TIME.value] > 0], ignore_index=True)

    # df_tmerge.rename(columns={'current': 'i', 'voltage': 'v'}, inplace=True)
    return df_tmerge


# import data from Arbin-generated Excel files
def read_arbin(file, file_type='xlsx'):

    # the importer can read Excel worksheets with the Channel number from Arbin files.
    # it assumes column names generated by the Arbin:
    # Cycle_Index -> cycle_index
    # Test_Time(s) -> test_time
    # Current(A) -> i
    # Voltage(V) -> v
    # Date_Time -> date_time

    df_tmerge = pd.DataFrame()

    timeseries = ""

    df_cell = []
    if file_type == FORMAT.XLSX.value:
        with gzip.open(file, 'rb') as decompressed_file:
            df_cell = pd.read_excel(decompressed_file, None)
    if file_type == FORMAT.FEATHER.value:
        with gzip.open(file, 'rb') as decompressed_file:
            df_cell = pd.read_feather(decompressed_file, None)

    for k in df_cell.keys():
        if "hannel" in k:
            # logging.info("file: " + filename + " sheet:" + str(k))
            timeseries = k

            df_time_series_file = df_cell[timeseries]

            df_ts = pd.DataFrame()

            df_ts['cycle_index_file'] = df_time_series_file[
                'Cycle_Index']
            df_ts['test_time'] = df_time_series_file[
                'Test_Time(s)']
            df_ts['i'] = df_time_series_file['Current(A)']
            df_ts['v'] = df_time_series_file['Voltage(V)']
            df_ts['date_time'] = df_time_series_file['Date_Time']
            df_ts['filename'] = file.filename
            df_ts['ah_c'] = 0
            df_ts['e_c'] = 0
            df_ts['ah_d'] = 0
            df_ts['e_d'] = 0
            df_ts['cycle_index'] = 0
            df_ts['cycle_time'] = 0

            cycles_index = df_ts[["cycle_index_file"]].to_numpy()
            past_cycle = 0
            start = 0

            for x in cycles_index:
                if start == 0:
                    past_cycle = x[0]
                    start += 1
                else:
                    if x[0] < past_cycle:
                        x[0] = past_cycle
                    past_cycle = x[0]

            df_tmp = pd.DataFrame(data=cycles_index[:, [0]],
                                  columns=["cycle_index_file"])
            df_ts['cycle_index_file'] = df_tmp['cycle_index_file']

            if df_tmerge.empty:
                df_tmerge = df_ts
            else:
                df_tmerge = df_tmerge.append(df_ts,
                                             ignore_index=True)

    return df_tmerge


# import data from MACCOR-generated  files
def read_maccor(file):

    # the importer can read Excel worksheets with the Channel number from Arbin files.
    # it assumes column names generated by the MACCOR:
    # Cycle_Index -> cycle_index
    # Test_Time(s) -> test_time
    # Current(A) -> i
    # Voltage(V) -> v
    # Date_Time -> date_time

    df_tmerge = pd.DataFrame()

    file_df = prepare_maccor_file(file)
    df_cell = pd.read_csv(file_df, sep='\t')

    df_time_series_file = df_cell

    df_time_series = pd.DataFrame()

    df_time_series['cycle_index_file'] = df_time_series_file[
        'Cycle'].apply(pd.to_numeric)
    df_time_series['test_time'] = df_time_series_file[
        'Test Time (sec)'].str.replace(',',
                                       '').apply(pd.to_numeric)

    df_time_series['i'] = df_time_series_file['Current'].apply(
        pd.to_numeric)
    df_time_series['MD'] = df_time_series_file['MD']

    df_time_series['i'] = df_time_series.apply(
        lambda x: signedCurrent(x.MD, x.i), axis=1)

    df_time_series.drop('MD', axis=1, inplace=True)

    df_time_series['v'] = df_time_series_file['Voltage'].apply(
        pd.to_numeric)
    df_time_series['date_time'] = pd.to_datetime(
        df_time_series_file['DPT Time'],
        format='%m/%d/%Y %I:%M:%S %p')
    df_time_series['filename'] = file.filename

    df_time_series['ah_c'] = 0
    df_time_series['e_c'] = 0
    df_time_series['ah_d'] = 0
    df_time_series['e_d'] = 0
    df_time_series['cycle_index'] = 0
    df_time_series['cycle_time'] = 0

    if df_tmerge.empty:
        df_tmerge = df_time_series
    else:
        df_tmerge = df_tmerge.append(df_time_series,
                                     ignore_index=True)
    return df_tmerge


def read_ornlabuse(file):
    # excels = glob.glob(file_path + '*.xls*')
    column_list = ['Running Time', 'Axial Force', 'Analog 1', 'Axial Displacement', 'Running Time 1', 'TC 01', 'TC 02',
                   'TC 03', 'TC 04', 'TC 05', 'TC 06']
    df_tmerge = pd.DataFrame()
    # for excel in excels:
    #     if '~$' in excel:
    #         continue
    with gzip.open(file, 'rb') as decompressed_file:
        df_ts_file = pd.read_excel(decompressed_file, sheet_name='data')

    missing_columns = set(column_list).difference(set(df_ts_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")
    df_ts_a = pd.DataFrame()
    df_ts_a['test_time'] = df_ts_file['Running Time']
    df_ts_a['axial_d'] = df_ts_file['Axial Displacement']
    df_ts_a['v'] = df_ts_file['Analog 1']
    df_ts_a['axial_f'] = df_ts_file['Axial Force']
    df_ts_a[ARCHIVE_COLS.temp_1.value] = 0
    df_ts_a[ARCHIVE_COLS.temp_2.value] = 0
    df_ts_a[ARCHIVE_COLS.temp_3.value] = 0
    df_ts_a[ARCHIVE_COLS.temp_4.value] = 0
    df_ts_a[ARCHIVE_COLS.temp_5.value] = 0
    df_ts_a[ARCHIVE_COLS.temp_6.value] = 0
    # df_time_series_a['cell_id'] = cell_id

    df_ts_b = pd.DataFrame()
    df_ts_b['test_time'] = df_ts_file['Running Time 1']
    df_ts_b[ARCHIVE_COLS.AXIAL_D.value] = 0
    df_ts_b[ARCHIVE_COLS.V.value] = 0
    df_ts_b[ARCHIVE_COLS.AXIAL_F.value] = 0
    df_ts_b[ARCHIVE_COLS.temp_1.value] = df_ts_file[
        INP_LABELS.TC_01.value]
    df_ts_b[ARCHIVE_COLS.temp_2.value] = df_ts_file[
        INP_LABELS.TC_02.value]
    df_ts_b[ARCHIVE_COLS.temp_3.value] = df_ts_file[
        INP_LABELS.TC_03.value]
    df_ts_b[ARCHIVE_COLS.temp_4.value] = df_ts_file[
        INP_LABELS.TC_04.value]
    df_ts_b[ARCHIVE_COLS.temp_5.value] = df_ts_file[
        INP_LABELS.TC_05.value]
    df_ts_b[ARCHIVE_COLS.temp_6.value] = df_ts_file[
        INP_LABELS.TC_06.value]
    # df_time_series_b['cell_id'] = cell_id

    # if df_tmerge.empty:
    df_tmerge = df_ts_a
    df_tmerge = df_tmerge.append(df_ts_b, ignore_index=True)
    # else:
    #     df_tmerge = df_tmerge.append(df_ts_a, ignore_index=True)
    #     df_tmerge = df_tmerge.append(df_ts_b, ignore_index=True)

    return df_tmerge


# read the abuse excel files from SNL
def read_snlabuse(file):
    # excels = glob.glob(file_path + '*.xls*')
    column_list = ['Running Time', 'Axial Displacement', 'Axial Force', 'Analog 1', 'TC 01', 'TC 02', 'TC 03', 'TC 04',
                   'TC 05', 'TC 06']

    df_tmerge = pd.DataFrame()

    # for excel in excels:
    #     if '~$' in excel:
    #         continue

    with gzip.open(file, 'rb') as decompressed_file:
        df_ts_file = pd.read_excel(decompressed_file, sheet_name='data')

    missing_columns = set(column_list).difference(set(df_ts_file.columns))
    if missing_columns:
        raise KeyError(f"{missing_columns} columns are not present")

    df_ts = pd.DataFrame()
    df_ts[ARCHIVE_COLS.TEST_TIME.value] = df_ts_file[
        INP_LABELS.TEST_TIME.value]
    df_ts[ARCHIVE_COLS.AXIAL_D.value] = df_ts_file[
        INP_LABELS.AXIAL_D.value]
    df_ts[ARCHIVE_COLS.AXIAL_F.value] = df_ts_file[
        INP_LABELS.AXIAL_F.value]
    df_ts[ARCHIVE_COLS.V.value] = df_ts_file[INP_LABELS.V.value]
    df_ts[ARCHIVE_COLS.temp_1.value] = df_ts_file[
        INP_LABELS.TC_01.value]
    df_ts[ARCHIVE_COLS.temp_2.value] = df_ts_file[
        INP_LABELS.TC_02.value]
    df_ts[ARCHIVE_COLS.temp_3.value] = df_ts_file[
        INP_LABELS.TC_03.value]
    df_ts[ARCHIVE_COLS.temp_4.value] = df_ts_file[
        INP_LABELS.TC_04.value]
    df_ts[ARCHIVE_COLS.temp_5.value] = df_ts_file[
        INP_LABELS.TC_05.value]
    df_ts[ARCHIVE_COLS.temp_6.value] = df_ts_file[
        INP_LABELS.TC_06.value]
    # df_time_series['cell_id'] = cell_id

    df_tmerge = df_ts

    return df_tmerge


def prepare_maccor_file(file):
    with gzip.open(file, 'rb') as decompressed_file:
        lines = decompressed_file.readlines()
    file.close()

    cellpath_df = "test" + "_df"

    new_file = open(cellpath_df, "wb")
    for line in lines:
        forget_line = line.startswith(b"Today") or line.startswith(
            b"Filename") or line.startswith(b"Procedure") or line.startswith(
            b"Comment")
        if not forget_line:
            new_file.write(line)
    new_file.close()
    return cellpath_df


# identify the sign of the current for a MACCOR file
def signedCurrent(x, y):
    if x == "D":
        return -y
    else:
        return y
