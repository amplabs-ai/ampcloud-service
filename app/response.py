from flask import jsonify


class Response():
    def __init__(self, status, detail, url=None,records=None):
        self.status = status
        self.detail = detail
        if records:
            self.records = records
        if url:
            self.response_url = url

    def to_dict(self):
        return jsonify(self.__dict__)

    def to_json(self):
        return self.__dict__