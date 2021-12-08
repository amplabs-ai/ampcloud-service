import pandas as pd
from archive_constants import (DEGREE, ARCHIVE_TABLE, SQLDB_TEST_URL,
                               TEST_TYPE, MONGODB_URL)
from pymongo import MongoClient
"""
Archive Meta Operator
- Manages metadata in Archive
- Performs all necessary NoSQL queries related to Archive Metadata
"""

class ArchiveMetaOperator:
    def __init__(self):
        self.client = MongoClient(MONGODB_URL)
        self.db = self.client['archive']

    def insert_cell_db(self, cell_meta):
        self.db.cell_meta.insert_one(cell_meta)

    def update_cell_db(self, filter, update_object):
        self.db.cell_meta.update_one(filter, update_object)
