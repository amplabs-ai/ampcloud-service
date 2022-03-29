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
    httprequest.add_header("Cookie", "{1}")
    status = 1
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
            plt.plot(df['cycle_index'], df['value'], label = item['id'])

        plt.title('Cycle Index Data - Enery and Capacity Decay', loc="left")
        plt.xlabel('Cycle Index')
        plt.ylabel('Ah/Wh')
        plt.legend()
        plt.show()
  `,
	timeSeriesChart: `
  time
    from matplotlib import pyplot as plt
    import numpy as np

    # Generate 100 random data points along 3 dimensions
    x, y, scale = np.random.randn(3, 100)
    fig, ax = plt.subplots()

    # Map each onto a scatterplot we'll create with Matplotlib
    ax.scatter(x=x, y=y, c=scale, s=np.abs(scale)*500)
    ax.set(title="Some random data, created with JupyterLab!")
    plt.show()XZx
  `,
	efficiencyChart: `
  eff
    from matplotlib import pyplot as plt
    import numpy as np

    # Generate 100 random data points along 3 dimensions
    x, y, scale = np.random.randn(3, 100)
    fig, ax = plt.subplots()

    # Map each onto a scatterplot we'll create with Matplotlib
    ax.scatter(x=x, y=y, c=scale, s=np.abs(scale)*500)
    ax.set(title="Some random data, created with JupyterLab!")
    plt.show()XZx
  `,
	cycleQtyByStepChart: `
  bystep
    from matplotlib import pyplot as plt
    import numpy as np

    # Generate 100 random data points along 3 dimensions
    x, y, scale = np.random.randn(3, 100)
    fig, ax = plt.subplots()

    # Map each onto a scatterplot we'll create with Matplotlib
    ax.scatter(x=x, y=y, c=scale, s=np.abs(scale)*500)
    ax.set(title="Some random data, created with JupyterLab!")
    plt.show()XZx
    `,
	compareByCycleTimeChart: `
  cycletime
    from matplotlib import pyplot as plt
    import numpy as np

    # Generate 100 random data points along 3 dimensions
    x, y, scale = np.random.randn(3, 100)
    fig, ax = plt.subplots()

    # Map each onto a scatterplot we'll create with Matplotlib
    ax.scatter(x=x, y=y, c=scale, s=np.abs(scale)*500)
    ax.set(title="Some random data, created with JupyterLab!")
    plt.show()XZx
  `,
};

export default sourceCode;
