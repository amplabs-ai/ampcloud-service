import os
from os.path import exists
from src.app.meta_model import ArchiveMetaOperator
from pprint import pprint
rawTestDataPath = "/bas/tests/test_data/01_raw/"
tmpBasePath = rawTestDataPath + "tmp/"
os.makedirs(tmpBasePath, exist_ok=True)


def test_meta_db_model():
    amo = ArchiveMetaOperator()
    db = amo.db
    amo.client.drop_database('archive')
    print("DATABASE", db)
    cell_meta = {
        "schema": 1,
        "name": "mycell",
        "app": {},
        "tests": [],
        "params": {
            "device":{
            "id": "my_device_id",
            "mass": "units",
            "anode": "my_anode",
            "cathode": "my_cathode",
            "seperator": "my_separator",
            "supplier": "my_supplier",
            "manufacturer": "my_manufacturer",
            }
        }
    }
    print("CELL_META", db.cell_meta)
    test_meta = {
        "schema": 1,
        "name": "mytest",
        "app": {},
        "type": "cycle",
        "params": {},
        "stats": {}
    }
    print("TEST_META", db.test_meta)
    db.test_meta.insert_one(test_meta)
    db.cell_meta.insert_one(cell_meta)

    test_meta = db.test_meta.find_one({"name": "mytest"})
    print(test_meta['_id'])
    amo.update_cell_db({"name": "mycell"}, {
        '$push': {
            'tests': {
                "test_id": test_meta['_id'],
                "test_name": test_meta['name'],
                "test_type": test_meta['type']

            }
        }
    })

    result = list(db.cell_meta.find({"name": "mycell"}))
    print("LENGTH", len(result))
    pprint(result)


    assert False
