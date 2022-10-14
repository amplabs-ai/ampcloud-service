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
            df_time_series_file.eval(units[unit].replace('COL_NAME',column_name),inplace=True)

def col_mappings(df_time_series_file,template_data):
    column_mapping = {}
    for elements in template_data["Items"][0]["Attributes"]:
        column_name = elements['Name']
        temp = elements['Value'].split("||")
        map = temp[0]
        column_mapping[column_name] = map
    # columns_to_rename = {}
    # if not column_mapping:
        # for col in df_time_series_file.columns:
        #     column = col.lower().strip()
        #     if 'discharge' in column and 'capacity' in column:
        #         columns_to_rename[col] = LABEL.AH_D.value
        #     elif 'charge' in column and 'capacity' in column:
        #         columns_to_rename[col] = LABEL.AH_C.value
        #     elif 'discharge' in column and 'energy' in column:
        #         columns_to_rename[col] = LABEL.E_D.value
        #     elif 'charge' in column and 'energy' in column:
        #         columns_to_rename[col] = LABEL.E_C.value
        #     elif 'date' in column and 'time' in column:
        #         columns_to_rename[col] = LABEL.DATE_TIME.value
        #     elif 'cell' in column and 'temperature' in column:
        #         columns_to_rename[col] = LABEL.CELL_TEMP.value
        #     elif 'environment' in column and 'temperature' in column:
        #         columns_to_rename[col] = LABEL.ENV_TEMP.value
        #     elif 'step' in column and 'index' in column:
        #         columns_to_rename[col] = LABEL.STEP_INDEX.value
    # else:
    columns_to_drop = []
    for i, (key, value) in enumerate(column_mapping.items()):
        if value == "" or value == None:
            columns_to_drop.append(df_time_series_file.columns.values[i])
        else:
            df_time_series_file.columns.values[i] = value

    df_time_series_file.drop(columns_to_drop, axis=1, inplace=True)
    