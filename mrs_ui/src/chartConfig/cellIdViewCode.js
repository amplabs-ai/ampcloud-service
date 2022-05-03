export const cycleDataCodeContent = `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web 
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd

def get_amplabs_data():
    url = "https://www.amplabs.ai/download/cells/cycle_data_json/{0}"
    user = "{1}"
    httprequest = urllib.request.Request(
            url, method="GET"
        )
    httprequest.add_header("Cookie", f"userId={user}")

    try:
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
            return response
    except urllib.error.HTTPError as e:
        print(e)
    return None

#Fetch Data from Amplabs API
response = get_amplabs_data()

if response:
    df = pd.DataFrame(response['records'])
    print("Process complete", df.info())
`;
export const timeSeriesDataCodeContent = `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web 
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd

def get_amplabs_data():
    url = "http://www.amplabs.ai/download/cells/cycle_timeseries_json/{0}"
    user = "{1}"
    httprequest = urllib.request.Request(
            url, method="GET"
        )
    httprequest.add_header("Cookie", f"userId={user}")

    try:
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
            return response
    except urllib.error.HTTPError as e:
        print(e)
    return None

#Fetch Data from Amplabs API
response = get_amplabs_data()

if response:
    df = pd.DataFrame(response['records'])
    print("Process complete", df.info())
`;
