from app.archive_constants import (GA_API_HOST, LABEL,
                                   TEST_TYPE, TESTER)
import datetime
import batteryclient
from batteryclient.api import users_api
import numpy as np


class GAReader:
    def __init__(self, token):
        self.host = GA_API_HOST
        self.token = token


    def read_metadata(self, dataset_id):
        configuration = batteryclient.Configuration(
            host=self.host,
            access_token=self.token
        )
        # Enter a context with an instance of the API client
        with batteryclient.ApiClient(configuration) as api_client:
            try:
                # Create an instance of the API class
                api_instance = users_api.UsersApi(api_client)
                response = api_instance.get_dataset(dataset_id)
                cell = response.cell
                name = response.name
                columns = response.columns
                metadata = {}
                metadata[LABEL.SOURCE.value] = 'OX'
                metadata[LABEL.CELL_ID.value] = metadata[LABEL.SOURCE.value] + '-' + name
                metadata[LABEL.AH.value] = cell['nominal_capacity']
                metadata[LABEL.ANODE.value] = cell['anode_chemistry']
                metadata[LABEL.CATHODE.value] = cell['cathode_chemistry']
                metadata[LABEL.FORM_FACTOR.value] = 'test-form-factor'
                metadata[LABEL.TEST.value] = TEST_TYPE.CYCLE.value
                metadata[LABEL.TESTER.value] = TESTER.MACCOR.value
                metadata[LABEL.CRATE_C.value] = None
                metadata[LABEL.CRATE_D.value] = None
                metadata[LABEL.SOC_MAX.value] = None
                metadata[LABEL.SOC_MIN.value] = None
                metadata[LABEL.TEMP.value] = None
                return metadata, columns
            except batteryclient.ApiException as e:
                print("Exception when calling UsersApi->get_dataset: %s\n" % e)
            except Exception as e:
                print(e)


    def read_data(self, dataset_id, columns):
        configuration = batteryclient.Configuration(
            host=self.host,
            access_token=self.token
        )
        column_ids = {}
        for col in columns:
            if col['name'] == 'time/s':
                column_ids['time/s'] = col['id']
            if col['name'] == 'Ewe/V':
                column_ids['Ewe/V'] = col['id']
            if col['name'] == 'I/mA':
                column_ids['I/mA'] = col['id']
        print("READING DATA:", dataset_id)
        # Enter a context with an instance of the API client
        with batteryclient.ApiClient(configuration) as api_client:
            try:
                # Create an instance of the API class
                api_instance = users_api.UsersApi(api_client)

                data = {
                    column_name: np.frombuffer(
                        api_instance.get_column(dataset_id, column_id).read(),
                        dtype=np.float32
                    ) for column_name, column_id in column_ids.items()
                }
                data[LABEL.V.value] = data['Ewe/V']
                data[LABEL.I.value] = data['I/mA']
                data[LABEL.CYCLE_INDEX.value] = [1] * len(data['I/mA'])
                data[LABEL.TEST_TIME.value] = data['time/s']
                data[LABEL.DATE_TIME.value] = [datetime.datetime(
                    2020, 1, 1) + datetime.timedelta(seconds=d.item()) for d in data['time/s']]
                data.pop('time/s')
                data.pop('Ewe/V')
                data.pop('I/mA')
                return data
            except batteryclient.ApiException as e:
                print("Exception when calling UsersApi->get_dataset: %s\n" % e)
            except Exception as e:
                print(e)

