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
    url = "https://www.amplabs.ai/echarts/energyAndCapacityDecay?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/energyAndCapacityDecay?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/efficiency?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/cycleQuantitiesByStep?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/cycleQuantitiesByStep?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/compareByCycleTime?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/forceAndDisplacement?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/testTempratures?{0}{2}"
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
    url = "https://www.amplabs.ai/echarts/voltage?{0}{2}"
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
};

export default sourceCode;
