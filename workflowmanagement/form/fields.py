class Field(object):
    field_type = "field"

    def __init__(self, cid, label, required, field_options):
        self.cid = cid
        self.label = label
        self.required = required
        self.field_options = field_options

    def getAnswer(self, data):
        raise NotImplementedError("Field getAnswer() is abstract and must be implemented by children classes")

    def getLabel(self):
        return self.label

class SectionBreak(Field):
    field_type = "section_break"

    def getAnswer(self, data):
        return ""

class Text(Field):
    field_type = "text"

    def getAnswer(self, data):
        return data

class Paragraph(Text):
    pass

class Schema(object):
    map = {
        "text": Text
    }
    def __init__(self, schema):
        self.fields = {}
        cerror = "schema must be a list of dictionaries containing a formbuilder compliant schema."

        if not isinstance(schema, list):
            raise NotCompliant(cerror)

        for member in schema:
            if not (isinstance(member, dict) and member.cid and member.type):
                raise NotCompliant(cerror)

            self.set(Schema.translate(member))

    def set(self, field):
        if(isinstance(field, Field)):
            self.fields[field.cid] = field
        else:
            raise self.UnsupportedField("The schema object only supports valid Field objects")

    def getAnswer(self, cid, data):
        return self.fields[cid].getAnswer(data)

    @staticmethod
    def translate(self, schema):
        try:
            return Schema.map[schema.type]
        except KeyError:
            raise self.UnsupportedField("The schema type %s doesnt have a valid class translation" % schema.type)

    class UnsupportedField(Exception):
        pass

    class NotCompliant(Exception):
        pass

'''
[
                        {
                            "field_type": "radio",
                            "required": true,
                            "label": "Será do Guaraná ?",
                            "field_options": {
                                "include_other_option": true,
                                "options": [
                                    {
                                        "checked": false,
                                        "label": "Opção 1"
                                    },
                                    {
                                        "checked": false,
                                        "label": "Opção 2"
                                    }
                                ],
                                "description": "Da antartida !!"
                            },
                            "cid": "c32"
                        },
                        {
                            "field_type": "checkboxes",
                            "required": true,
                            "label": "Coisas malaicas",
                            "field_options": {
                                "include_other_option": true,
                                "options": [
                                    {
                                        "checked": false,
                                        "label": "Coisa coisa coisa"
                                    },
                                    {
                                        "checked": false,
                                        "label": "Outra coisa"
                                    },
                                    {
                                        "checked": false,
                                        "label": "Munta coisa"
                                    },
                                    {
                                        "checked": false,
                                        "label": "Munta mais ainda"
                                    },
                                    {
                                        "checked": false,
                                        "label": "estes"
                                    }
                                ],
                                "description": "Descrição de coisas malaicas !"
                            },
                            "cid": "c37"
                        },
                        {
                            "field_type": "date",
                            "required": true,
                            "label": "Untitled",
                            "field_options": {},
                            "cid": "c24"
                        },
                        {
                            "field_type": "dropdown",
                            "required": true,
                            "label": "Untitled",
                            "field_options": {
                                "options": [
                                    {
                                        "checked": false,
                                        "label": "teste"
                                    },
                                    {
                                        "checked": false,
                                        "label": "teste"
                                    }
                                ],
                                "include_blank_option": true
                            },
                            "cid": "c28"
                        },
                        {
                            "field_type": "number",
                            "required": false,
                            "label": "number",
                            "field_options": {
                                "units": "teste",
                                "integer_only": true
                            },
                            "cid": "c36"
                        },
                        {
                            "field_type": "time",
                            "required": false,
                            "label": "Untitled",
                            "field_options": {},
                            "cid": "c32"
                        },
                        {
                            "field_type": "website",
                            "required": true,
                            "label": "http",
                            "field_options": {
                                "size": "large"
                            },
                            "cid": "c40"
                        },
                        {
                            "field_type": "email",
                            "required": true,
                            "label": "email",
                            "field_options": {
                                "size": "large"
                            },
                            "cid": "c44"
                        }
                    ],
'''

