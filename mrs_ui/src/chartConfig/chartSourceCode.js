const sourceCode = {
  cycleIndexChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/energyAndCapacityDecay?{0}"
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

df = pd.DataFrame()
if status:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.line(df, x="cycle_index", y="value", color="series", labels={"cycle_index":"Cycle Index", "value":"Ah/Wh"}, title = "Cycle Index Data - Energy and Capacity Decay")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./cycleIndexChart.png', format="png", scale=1, width=1200, height=800)
    `,
  timeSeriesChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/energyAndCapacityDecay?{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 1
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

df = pd.DataFrame()
if status:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Wh/Ah"}, title = "Time Series Data - Energy and Capacity Decay")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./timeSeriesChart.png', format="png", scale=1, width=1200, height=800)
    `,
  efficiencyChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/efficiency?{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 1
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

df = pd.DataFrame()
if status:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.line(df, x="cycle_index", y="value", color="series", labels={"cycle_index":"Cycle Index", "value":"Enery and Coulombic Efficiencies"}, title = "Efficiencies")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./efficiencyChart.png', format="png", scale=1, width=1200, height=800)
    `,
  cycleQtyByStepChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/cycleQuantitiesByStep?{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 1
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

df = pd.DataFrame()
if status:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    fig = px.line(df, x="cycle_time", y="v", color="series", labels={"cycle_time":"Cycle Tiime (s)", "v":"Volateg (V)"}, title = "Cycle Quantities by step")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./cycleQtyByStepChart.png', format="png", scale=1, width=1200, height=800)
    `,
  compareByCycleTimeChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/compareByCycleTime?{0}"
httprequest = urllib.request.Request(
        url, method="GET"
    )
httprequest.add_header("Cookie", "userId={1}")
status = 1
try:
    with urllib.request.urlopen(httprequest) as httpresponse:
        response = json.loads(httpresponse.read())
        status = 1
except urllib.error.HTTPError as e:
    print(e)

df = pd.DataFrame()
if status:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.line(df, x="cycle_time", y="value", color="series_2", labels={"cycle_time":"Cycle Time (s)", "value":"Voltage (V)/Current (A)"}, title = "Compare by Cycle Time - Compare Cycle Voltage and Current")
    fig.update_traces(mode="markers+lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./compareByCycleTimeChart.png', format="png", scale=1, width=1200, height=800)
    `,
  forceAndDisplacementChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/forceAndDisplacement?{0}"
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

df = pd.DataFrame()

if status and response['records'][0]:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Force (N) / Displacement"}, title = "Force and Displacement - Abuse Force and Displacement")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseForceDisplacementChart.png', format="png", scale=1, width=1200, height=800)
    `,
  testTempraturesChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/testTempratures?{0}"
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

df = pd.DataFrame()
if status and response['records'][0]:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.line(df, x="test_time", y="value", color="series_1", labels={"test_time":"Time (s)", "value":"Temperature (T)"}, title = "Abuse Test Temperature")
    fig.update_traces(mode="lines", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseTestTemperatureChart.png', format="png", scale=1, width=1200, height=800)
    `,
  voltageChart: `
import sys
!{sys.executable} -m pip install pandas plotly kaleido
import warnings
warnings.filterwarnings('ignore')

import json
import urllib.error
import urllib.request
import pandas as pd
import plotly.express as px
import plotly.io as pio

url = "http://www.amplabs.ai/echarts/voltage?{0}"
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

df = pd.DataFrame()
if status and response['records'][0]:
    for item in response['records'][0]:
        df = df.append(pd.DataFrame.from_records(item['source']))
    df['value'] = pd.to_numeric(df['value'], errors='coerce')
    fig = px.scatter(df, x="test_time", y="value", color="series", labels={"test_time":"Time (s)", "value":"Voltage (V)"}, title = "Voltage - Abuse Voltage")
    fig.update_traces(mode="markers", hovertemplate=None)
    fig.update_layout(hovermode="x")
    pio.write_image(fig, file='./abuseVoltageChart.png', format="png", scale=1, width=1200, height=800)
    `,
};

export default sourceCode;
