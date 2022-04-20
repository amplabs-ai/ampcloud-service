export const cycleDataCodeContent = `
import sys
!{sys.executable} -m pip install pandas
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd

url = "http://www.amplabs.ai:81/download/cells/cycle_data_json/{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 0
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

if status and response['records']:
    df = pd.DataFrame(response['records'])
    print("Process complete", df.info())
`;
export const timeSeriesDataCodeContent = `
import sys
!{sys.executable} -m pip install pandas
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd

url = "http://www.amplabs.ai:81/download/cells/cycle_timeseries_json/{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 0
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

if status and response['records']:
    df = pd.DataFrame(response['records'])
    print("Process complete", df.info())
`;
