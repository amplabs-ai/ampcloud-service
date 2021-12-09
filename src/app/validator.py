import pandas as pd
import os

def fetch_schema(tester, path):
    split_tup = os.path.splitext(path)
    file_name = split_tup[0]
    file_extension = split_tup[1]
    print("DETECTING", file_name)
    if file_extension == ".csv":
        print("CSV")
    elif file_extension == ".txt":
        print("TXT")
    elif file_extension == ".xlsx":
        print("XLSX")
    else:
        print("Unknown")
