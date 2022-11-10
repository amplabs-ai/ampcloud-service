const sourceCode = {
cycleIndexChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio

def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/energyAndCapacityDecay?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="value", color="series", labels={"cycle_index":"Cycle Index", "value":"Ah/Wh"}, title = "Cycle Index Data - Energy and Capacity Decay")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./cycleIndexChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
timeSeriesChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/energyAndCapacityDecay?{0}"
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

def plot_chart(df):
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Wh/Ah"}, title = "Time Series Data - Energy and Capacity Decay")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./timeSeriesChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
efficiencyChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/efficiency?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="value", color="series", labels={"cycle_index":"Cycle Index", "value":"Enery and Coulombic Efficiencies"}, title = "Efficiencies")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./efficiencyChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
cycleQtyByStepChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/cycleQuantitiesByStep?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="cycle_time", y="v", color="series", labels={"cycle_time":"Cycle Time (s)", "v":"Voltage (V)"}, title = "Cycle Quantities by step")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./cycleQtyByStepChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    plot_chart(df)
    `,
cycleQtyByStepWithCapacityChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/cycleQuantitiesByStep?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="ah", y="v", color="series", labels={"ah":"Capacity (Ah)", "v":"Voltage (V)"}, title = "Cycle Quantities by step - Capacity")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./cycleQtyByStepChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    plot_chart(df)
    `,
compareByCycleTimeChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/compareByCycleTime?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="cycle_time", y="value", color="series_2", labels={"cycle_time":"Cycle Time (s)", "value":"Voltage (V)/Current (A)"}, title = "Compare by Cycle Time - Compare Cycle Voltage and Current")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./compareByCycleTimeChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
forceAndDisplacementChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/forceAndDisplacement?{0}"
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

def plot_chart(df):
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Force (N) / Displacement"}, title = "Force and Displacement - Abuse Force and Displacement")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseForceDisplacementChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
testTempraturesChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/testTempratures?{0}"
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

def plot_chart(df):
    fig = px.line(df, x="test_time", y="value", color="series_1", labels={"test_time":"Time (s)", "value":"Temperature (T)"}, title = "Abuse Test Temperature")
    fig.update_traces(mode="lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseTestTemperatureChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
voltageChart: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import urllib.error
import urllib.request

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata():
    url = "https://65.1.73.220:4000/echarts/voltage?{0}"
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

def plot_chart(df):
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Voltage (V)"}, title = "Voltage - Abuse Voltage")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseVoltageChart.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
response = get_amplabs_chartdata()

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    plot_chart(df)
    `,
plotterChart_timeSeries: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# import graph_objects from plotly package

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio
import plotly.graph_objects as go

# import make_subplots function from plotly.subplots
# to make grid of plots
from plotly.subplots import make_subplots

def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/timeseries"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    x = req_data['columns'][0]
    req_data['columns'].pop(0)
    for cell_id in req_data['cell_ids']:
        df_cell_id = df[df['cell_id']==cell_id]
        for y in req_data['columns']:
            fig.add_trace(
            go.Scatter(x=df_cell_id[x], y=df_cell_id[y],  name=f"{cell_id}: {col_mapping[y]}"),
            secondary_y=False)
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    fig.update_layout(title_text="Timeseries plot")
    fig.update_xaxes(title_text="__xlabel__")
    pio.write_image(fig, file='./TimeSeriesPlot.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
col_mapping = __mapping__
req_data = __req_data__
response = get_amplabs_chartdata(req_data)

if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    plot_chart(df)


    `,
plotterChart_cycleSeries: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# import graph_objects from plotly package

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio
import plotly.graph_objects as go

# import make_subplots function from plotly.subplots
# to make grid of plots
from plotly.subplots import make_subplots

def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/stats"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = make_subplots(specs=[[{"secondary_y": True}]])
    x = req_data['columns'][0]
    req_data['columns'].pop(0)
    for cell_id in req_data['cell_ids']:
        df_cell_id = df[df['cell_id']==cell_id]
        for y in req_data['columns']:
            fig.add_trace(
            go.Scatter(x=df_cell_id[x], y=df_cell_id[y],  name=f"{cell_id}: {col_mapping[y]}"),
            secondary_y=False)
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    fig.update_layout(title_text="CycleSeries plot")
    fig.update_xaxes(title_text="__xlabel__")
    pio.write_image(fig, file='./CycleSeriesPlot.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
col_mapping = __mapping__
req_data = __req_data__
response = get_amplabs_chartdata(req_data)

if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    plot_chart(df)


    `,
capacityRetention: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
from ast import operator
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/capacityRetention"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="capacity_retention", color="cell_id", labels={"cycle_index":"Cycle Index", "capacity_retention":"Discharge Capacity Retention"}, title = "Capacity Retention vs Cycle Index")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./capacityRetention.png', format="png", scale=1, width=1200, height=800)



#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`,
coulombicEfficiency: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/coulombicEfficiency"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="value",color="cell_id", labels={"cycle_index":"Cycle Index", "value":"Coulombic Efficiency"}, title = "Coulombic Efficiency VS Cycle Index")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./coulombicEfficiency.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)

if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`,
galvanostaticPlot: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/galvanostaticPlot"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df,x="specific_capacity" ,y="v",color="series",labels={"specific_capacity":"Specific Capacity", "v":"Voltage"}, title = "Specific Capacity VS Voltage")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./galvanostaticPlot.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)


if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`,
voltageTime: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/voltageTime"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="test_time", y="voltage",color="cell_id", labels={"test_time":"Test Time", "voltage":"Voltage"}, title = "Voltage VS Test Time")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./voltageVStestTime.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)


if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    if not df.empty:
        plot_chart(df)
    
`,
currentTime: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/currentTime"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="test_time", y="current",color="cell_id", labels={"test_time":"Test Time", "current":"Current"}, title = "Current VS Test Time")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./currentVStestTime.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)


if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`,
energyDensity: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/energyDensity"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="energy_density",color="series", labels={"cycle_index":"Cycle Index", "energy_density":"Enery Density"}, title = "Energy Density VS Cycle Index")
    fig.update_traces(mode="lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./energyDensity.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)


if response['records'][0]:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['energy_density'] = pd.to_numeric(df['energy_density'], errors='coerce')

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`,
differentialCapacity: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://65.1.73.220:4000/echarts/differentialCapacity"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload, verify=False)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="voltage", y="dq_dv",color="series", labels={"voltage":"Voltage", "dq_dv":"dQ/dV"}, title = "dQ/dV VS Voltage")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./differentialCapacity.png', format="png", scale=1, width=1200, height=800)


#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)


if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))
    df['dq_dv'] = pd.to_numeric(df['dq_dv'], errors='coerce')

    #Plot the chart
    if not df.empty:   
        plot_chart(df)
`,
capacity: `
# Download python packages to your system using pip install
import sys
!{sys.executable} -m pip install pandas plotly kaleido requests

#suppressing warnings in Jupyter Notebooks
import warnings
warnings.filterwarnings('ignore')

# Useful for fetching data from the web
from ast import operator
import json
import requests

# PyData Libraries
import pandas as pd
import plotly.express as px
import plotly.io as pio


def get_amplabs_chartdata(req_data):
    url = "https://www.amplabs.ai/echarts/capacity"
    payload = json.dumps(req_data)
    headers = {
    'Authorization': 'Bearer __accesstoken__',
    'Content-Type': 'application/json'
    }
    try:
        response = requests.request("POST", url, headers=headers, data=payload)
        return json.loads(response.text)
    except Exception as e:
        print(e)
        return None

def plot_chart(df):
    fig = px.line(df, x="cycle_index", y="value", color="series", labels={"cycle_index":"Cycle Index", "value":"Capacity"}, title = "Capacity vs Cycle Index")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./capacityRetention.png', format="png", scale=1, width=1200, height=800)



#Fetch Data from Amplabs API
req_data = __req_data__
response = get_amplabs_chartdata(req_data)

if response:
    #Convert JSON Records to Dataframe
    df = pd.DataFrame()
    for item in response['records'][0]:
            df = df.append(pd.DataFrame.from_records(item['source']))

    #Plot the chart
    if not df.empty:
        plot_chart(df)
`
};

export default sourceCode;
