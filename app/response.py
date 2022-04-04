
class Response():
    def __init__(self, status, detail, records = None):
        self.status = status
        self.detail = detail
        if records:
            self.records = records
    
    def to_dict(self):
        return self.__dict__