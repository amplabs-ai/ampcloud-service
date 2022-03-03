
from marshmallow import Schema, ValidationError, fields, post_load, validate, validates_schema

from app.archive_constants import RESPONSE_MESSAGE


class AbuseTimeseriesBaseSchema(Schema):
    axial_d = fields.Float(allow_none = True)
    axial_f = fields.Float(allow_none = True)
    v = fields.Float(allow_none = True)
    norm_d = fields.Float(required = True, allow_none = True)
    strain = fields.Float(allow_nan = True, required = True, allow_none = True)
    pos_terminal_temperature = fields.Float(allow_none = True)
    neg_terminal_temperature = fields.Float(allow_none = True)
    left_bottom_temperature = fields.Float(allow_none = True)
    right_bottom_temperature = fields.Float(allow_none = True)
    above_punch_temperature = fields.Float(allow_none = True)
    below_punch_temperature = fields.Float(allow_none = True)
    test_time = fields.Float(allow_none = True)

    @validates_schema
    def validate(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD'])

class CycleTimeseriesBaseSchema(Schema):
    i = fields.Float(allow_none = True)
    v = fields.Float(allow_none = True)
    ah_c = fields.Float(allow_none = True)
    ah_d = fields.Float(allow_none = True)
    e_c = fields.Float(allow_none = True)
    e_d = fields.Float(allow_none = True)
    env_temperature = fields.Float(allow_none = True)
    cell_temperature = fields.Float(allow_none = True)
    cycle_time = fields.Float(allow_none = True)
    date_time = fields.DateTime(format= "iso",allow_none = True)
    cycle_index = fields.Float(allow_none = True)
    test_time = fields.Float(allow_none = True)

    @validates_schema
    def validate(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD']) 

class CycleStatsSchema(Schema):
    v_max = fields.Float(allow_none = True)
    v_min = fields.Float(allow_none = True)
    ah_c = fields.Float(allow_none = True)
    ah_d = fields.Float(allow_none = True)
    e_c = fields.Float(allow_none = True)
    e_d = fields.Float(allow_none = True)
    i_max = fields.Float(allow_none = True)
    i_min = fields.Float(allow_none = True)
    v_c_mean = fields.Float(allow_nan = True,allow_none = True)
    v_d_mean = fields.Float(allow_nan = True, allow_none = True)
    e_eff = fields.Float(allow_none = True)
    ah_eff = fields.Float(allow_none = True)
    cycle_index = fields.Integer(allow_none = True)
    test_time = fields.Float(allow_none = True)

    @validates_schema
    def validate(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD']) 

class AbuseTimeseriesSchema(Schema):
    timeseries_data = fields.List(fields.Nested(AbuseTimeseriesBaseSchema()))

    @validates_schema
    def validate(self, data, **kwargs):
        if 'timeseries_data' not in data:
            raise ValidationError(RESPONSE_MESSAGE['REQUIRED']) 
        if not len(data['timeseries_data']):
            raise ValidationError(RESPONSE_MESSAGE['LIST_NOT_EMPTY'])

class CycleTimeseriesSchema(Schema):
    timeseries_data = fields.List(fields.Nested(CycleTimeseriesBaseSchema()))
    stats = fields.Nested(CycleStatsSchema())

    @validates_schema
    def validate(self, data, **kwargs):
        if (data.get('timeseries_data') and data.get('stats_data')):
            raise ValidationError(RESPONSE_MESSAGE['REQUIRED']) 
        if not len(data['timeseries_data']):
            raise ValidationError(RESPONSE_MESSAGE['LIST_NOT_EMPTY'])


