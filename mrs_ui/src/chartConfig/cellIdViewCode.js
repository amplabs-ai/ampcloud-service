const codeContent = `
'''
Install required dependencies
>>>pip3 install pandas
>>>pip3 install plotly
>>>pip3 install kaleido
'''

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


url = "/echarts/energyAndCapacityDecay?{0}"
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
`;

export default codeContent;
