import copy
from app.utilities.aws_connection import client_sdb
from app.archive_constants import DOMAIN_NAME, units


def get_template_data(template,email):
    response = client_sdb.select(
                        SelectExpression=f"select * from `{DOMAIN_NAME}` WHERE itemName() = '{email}||{template}'",ConsistentRead = True)
    return response


def unit_conversion(df_time_series_file,template_data):
    for elements in template_data["Items"][0]["Attributes"]:
        column_name = elements['Name']
        temp = elements['Value'].split("||")
        unit = temp[1]
        if unit != "none":
            df_time_series_file.eval(units[unit].replace('COL_NAME',f"`{column_name}`"),inplace=True)


def col_mappings(df_time_series_file,template_data):
    column_mapping = {}
    for elements in template_data["Items"][0]["Attributes"]:
        column_name = elements['Name']
        temp = elements['Value'].split("||")
        mapping = temp[0]
        column_mapping[column_name] = mapping
    columns_to_drop = []
    df_columns = copy.deepcopy(df_time_series_file.columns.values)
    for i, (key, value) in enumerate(column_mapping.items()):
        col_index_in_df =  int(key.split("||")[1]) if "missing header" in key else df_time_series_file.columns.get_loc(key)
        if value == "" or value == None:
            columns_to_drop.append(df_columns[col_index_in_df])
        else:
            df_columns[col_index_in_df] = value
    df_time_series_file.columns = df_columns
    df_time_series_file.drop(columns_to_drop, axis=1, inplace=True)
    return df_time_series_file
    