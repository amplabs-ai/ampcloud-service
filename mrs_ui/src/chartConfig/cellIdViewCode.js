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

def get_amplabs_data(params):
    url = "https://www.amplabs.ai/download/cells/cycle_data_json?{}".format(params)
    httprequest = urllib.request.Request(
            url, method="GET"
        )
    {1}
    try:
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
            return response
    except urllib.error.HTTPError as e:
        print(e)
    return None

#Fetch Data from Amplabs API
params = "{0}"
response = get_amplabs_data(params)

if response:
    df = pd.DataFrame(response['records'][0])
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

def get_amplabs_data(params):
    url = "http://www.amplabs.ai/download/cells/cycle_timeseries_json?{}".format(params)
    httprequest = urllib.request.Request(
            url, method="GET"
        )
    {1}
    try:
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
            return response
    except urllib.error.HTTPError as e:
        print(e)
    return None

#Fetch Data from Amplabs API
params = "{0}"
response = get_amplabs_data(params)

if response:
    df = pd.DataFrame(response['records'][0])
    print("Process complete", df.info())
`;

export const abuseCellIdViewCode = `
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

def get_amplabs_data(params):
    url = "https://www.amplabs.ai/download/cells/abuse_timeseries_json?{}".format(params)
    httprequest = urllib.request.Request(
            url, method="GET"
        )
    {1}
    try:
        with urllib.request.urlopen(httprequest) as httpresponse:
            response = json.loads(httpresponse.read())
            return response
    except urllib.error.HTTPError as e:
        print(e)
    return None

#Fetch Data from Amplabs API
params = "{0}"
response = get_amplabs_data(params)

if response:
    df = pd.DataFrame(response['records'])
    print("Process complete", df.info())
`;
