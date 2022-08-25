from app.archive_constants import RESPONSE_MESSAGE
from app.model import ArchiveOperator
import logging
from sqlalchemy.exc import DataError


def get_cycle_quantities_by_step_service(cell_id, step, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or \
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_CQBS_query(cell_id, step, email)
        records = []
        series = {}

        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_energy_and_capacity_decay_service(cell_id, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_ECAD_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_efficiency_service(cell_id, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_Eff_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_compare_by_cycle_time_service(cell_id, email, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_CCVC_query(cell_id, email)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series_2']}||{row['cell_id']}"):
                series[f"{row['series_2']}||{row['cell_id']}"] = []
            series[f"{row['series_2']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_force_and_displacement_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_AFD_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_test_tempratures_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_ATT_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series_1']}||{row['cell_id']}"):
                series[f"{row['series_1']}||{row['cell_id']}"] = []
            series[f"{row['series_1']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_voltage_service(cell_id, email, sample, dashboard_id=None):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        if dashboard_id and email != "public":
            dashboard_data = ao.get_shared_dashboard_by_id(dashboard_id)
            if not dashboard_data or not (dashboard_data.is_public or email in dashboard_data.shared_to) or\
                    not(set(cell_id).issubset(set(dashboard_data.cell_id.split(',')))):
                return 401, "Unauthorised Access"
            else:
                email = dashboard_data['shared_by']
        archive_cells = ao.get_all_data_from_AV_query(cell_id, email, sample)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(f"{row['series']}||{row['cell_id']}"):
                series[f"{row['series']}||{row['cell_id']}"] = []
            series[f"{row['series']}||{row['cell_id']}"].append(row)

        for key, value in series.items():
            records.append({"id": key.split('||')[0], "cell_id": key.split('||')[1], "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_timeseries_columns_data_service(data, email):
    try:
        ao = ArchiveOperator()
        ao.set_session()
        columns = (',').join(data['columns'])
        cell_ids =", ".join("'{0}'".format(i) for i in data['cell_ids'])
        filters = ""
        is_diff_capacity_plot = False
        for filter in data['filters']:
            #if reduction factor is applied 
            if filter['column'] == "reduction_factor" and (filter["operation"] != "=" or not(all( x in {"voltage", "dq_dv"}for x in data['columns']))):
                return 400, "Reduction Factor is only applicable while plotting DQ_DV vs Voltage. It only supports = operation."
            elif filter['column'] == "reduction_factor":
                reduction_factor = int(filter['filterValue'])
                is_diff_capacity_plot = True
                continue
            #for other plots
            if filter['operation'] == '%':
                filter_str = f"MOD({filter['column']},{filter['filterValue']})=0"
            else:
                filter_str = f"{filter['column']}{filter['operation']}'{filter['filterValue']}'"
            filters = filters+f"and {filter_str}"
        archive_cells = ao.get_all_data_from_timeseries_query(columns, cell_ids, email, filters, get_df=is_diff_capacity_plot)
        records = []
        if is_diff_capacity_plot:
            for cell_id in data["cell_ids"]:
                df = archive_cells[archive_cells['cell_id'] == cell_id]
                
                df = df.groupby(df.index//reduction_factor).mean()
                if 'dq_dv' not in df:
                    df['dq_dv'] = None
                df['cell_id'] = cell_id
                df = df.sort_values(by = ['voltage'])
                df = df.replace([np.inf, -np.inf], np.NaN)
                records.append({"id": cell_id, "cell_id": cell_id, "source": df.to_dict('records')})
        else:
            series = {}
            for row in archive_cells:
                row = dict(row)
                if not series.get(row['cell_id']):
                    series[row['cell_id']] = []
                series[row['cell_id']].append(row)

            for key, value in series.items():
                records.append({"id": key,"cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        print(err)
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()


def get_stats_columns_data_service(data, email):
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
        archive_cells = ao.get_all_data_from_stats_query(columns, cell_ids, email, filters)
        records = []
        series = {}
        for row in archive_cells:
            row = dict(row)
            if not series.get(row['cell_id']):
                series[row['cell_id']] = []
            series[row['cell_id']].append(row)

        for key, value in series.items():
            records.append({"id": key,"cell_id": key, "source": value})
        return 200, RESPONSE_MESSAGE['RECORDS_RETRIEVED'], records
    except DataError as err:
        return 400, str(err.__dict__['orig']).split('\n')[0]
    except Exception as err:
        logging.error(err)
        return 500, RESPONSE_MESSAGE['INTERNAL_SERVER_ERROR']
    finally:
        ao.release_session()