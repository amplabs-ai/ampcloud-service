const sourceCode = {
  cycleIndexChart: `
    '''
    Install required dependencies
    >>>pip3 install pandas
    >>>pip3install matplotlib
    '''

    import json
    import urllib.error
    import urllib.request
    import pandas as pd
    import matplotlib.pyplot as plt

    url = "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/echarts/energyAndCapacityDecay?{0}"
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
    print(response)
    if status:
        for item in response['records'][0]:
            print(item)
            df = pd.DataFrame.from_records(item['source'])
            plt.plot(df['cycle_index'], pd.to_numeric(df['value'], errors='coerce'), label = item['id'])

        plt.title('Cycle Index Data - Enery and Capacity Decay', loc="left")
        plt.xlabel('Cycle Index')
        plt.ylabel('Ah/Wh')
        plt.legend()
        plt.show()
  `,
  timeSeriesChart: `
    '''
    Install required dependencies
    >>>pip3 install pandas
    >>>pip3 install matplotlib
    '''

    import json
    import urllib.error
    import urllib.request
    import pandas as pd
    import matplotlib.pyplot as plt

    url = "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/echarts/energyAndCapacityDecay?{0}"
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

    if status:
        for item in response['records'][0]:
            df = pd.DataFrame.from_records(item['source'])
            plt.scatter(df['test_time'], pd.to_numeric(df['value'], errors='coerce'), label = item['id'])

        plt.title('Time Series Data - Energy and Capacity Decay', loc="left")
        plt.xlabel('Time (s)')
        plt.ylabel('Wh/Ah')
        plt.legend()
        plt.show()
  `,
  efficiencyChart: `
    '''
    Install required dependencies
    >>>pip3 install pandas
    >>>pip3install matplotlib
    '''

    import json
    import urllib.error
    import urllib.request
    import pandas as pd
    import matplotlib.pyplot as plt

    url = "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/echarts/efficiency?{0}"
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

    if status:
        for item in response['records'][0]:
            df = pd.DataFrame.from_records(item['source'])
            plt.plot(df['cycle_index'], pd.to_numeric(df['value'], errors='coerce'), label = item['id'])

        plt.title('Efficiencies', loc="left")
        plt.xlabel('Cycle Index')
        plt.ylabel('Enery and Coulombic Efficiencies')
        plt.legend()
        plt.show()
  `,
  cycleQtyByStepChart: `
    '''
    Install required dependencies
    >>>pip3 install pandas
    >>>pip3 install matplotlib
    '''

    import json
    import urllib.error
    import urllib.request
    import pandas as pd
    import matplotlib.pyplot as plt

    url = "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/echarts/cycleQuantitiesByStep?{0}"
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

    if status:
        for item in response['records'][0]:
            df = pd.DataFrame.from_records(item['source'])
            plt.plot(df['cycle_time'], df['v'], label = item['id'])

        plt.title('Cycle Quantities by step', loc="left")
        plt.xlabel('Cycle Tiime (s)')
        plt.ylabel('Volateg (V)')
        plt.legend()
        plt.show()
    `,
  compareByCycleTimeChart: `
    '''
    Install required dependencies
    >>>pip3 install pandas
    >>>pip3install matplotlib
    '''

    import json
    import urllib.error
    import urllib.request
    import pandas as pd
    import matplotlib.pyplot as plt

    url = "http://batteryarchivemrstutoriallb-436798068.ap-south-1.elb.amazonaws.com:81/echarts/compareByCycleTime?{0}"
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

    if status:
        for item in response['records'][0]:
            df = pd.DataFrame.from_records(item['source'])
            plt.plot(df['cycle_time'], pd.to_numeric(df['value'], errors='coerce'), label = item['id'])

        plt.title('Compare by Cycle Time - Compare Cycle Voltage and Current', loc="left")
        plt.xlabel('Cycle time (s)')
        plt.ylabel('Voltage (V)/Current (A)')
        plt.legend()
        plt.show()
  `,
};

export default sourceCode;
