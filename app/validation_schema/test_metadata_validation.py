from marshmallow import Schema, ValidationError, fields, validates_schema
from app.archive_constants import RESPONSE_MESSAGE


class CycleMetaSchema(Schema):
    temperature = fields.Float(required=False, allow_none = True)
    soc_max = fields.Float(required=False, allow_none = True)
    soc_min = fields.Float(required=False, allow_none = True)
    v_max = fields.Float(required=False, allow_none = True)
    v_min = fields.Float(required=False, allow_none = True)
    crate_c = fields.Float(required=False, allow_none = True)
    crate_d = fields.Float(required=False, allow_none = True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD'])


class AbuseMetaSchema(Schema):
    temperature = fields.Float(required=False, allow_none = True)
    thickness = fields.Float(required=False, allow_none = True)
    v_init = fields.Float(required=False, allow_none = True)
    indentor = fields.Float(required=False, allow_none = True)
    nail_speed = fields.Float(required=False, allow_none = True)

    @validates_schema
    def validate_schema(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD'])


