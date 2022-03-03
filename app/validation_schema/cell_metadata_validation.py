from marshmallow import Schema, ValidationError, fields, validate, validates_schema

from app.archive_constants import RESPONSE_MESSAGE

class CellMetadataSchema(Schema):
    cell_id = fields.String(required=True, allow_none= False, validate=validate.Length(min=1))
    anode = fields.String(required=False, allow_none= True)
    cathode = fields.String(required=False, allow_none= True)
    source = fields.String(required=False, allow_none= True)
    ah = fields.Integer(required=False, allow_none= True)
    form_factor = fields.String(required=False, allow_none= True)
    test = fields.String(required=False, validate=validate.OneOf(['cycle','abuse']), allow_none= True)
    tester = fields.String(required=False, allow_none= True)

class CellMetadataAddSchema(CellMetadataSchema):
    cell_id = fields.String(required=True, allow_none= False, validate=validate.Length(min=1))

class CellMetadataUpdateSchema(CellMetadataSchema):
    cell_id = fields.String(allow_none= False, validate=validate.Length(min=1))

    @validates_schema
    def validate(self, data, **kwargs):
        if not data.keys():
            raise ValidationError(RESPONSE_MESSAGE['ONE_REQUIRED_FIELD'])
