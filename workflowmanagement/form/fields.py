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
        try:
            return data[self.cid]
        except KeyError:
            return None

class Paragraph(Text):
    field_type = "paragraph"
    pass

class Radio(Field):
    field_type = "radio"
    def getAnswer(self, data):
        try:
            tmp = data[self.cid]

            if tmp == 'Other':
                try:
                    tmp += ' (%s)' % data["%s_other" % self.cid]
                except KeyError:
                    pass

            return tmp
        except KeyError:
            return None

class Checkboxes(Field):
    field_type = "checkboxes"
    def getAnswer(self, data):
        try:
            answers = []
            tmp = data[self.cid]

            options = self.field_options["options"]

            if isinstance(tmp, dict):
                for index, state in tmp.items():
                    if state == 'on' and index != 'other':
                        if index == 'other_checkbox':
                            try:
                                answers.append("Other (%s)" % tmp['other'])
                            except KeyError:
                                answer.append('Other')
                        else:
                            answers.append(options[int(index)]['label'])

            return answers
        except KeyError:
            pass

        return None

class Date(Field):
    field_type = "date"
    def getAnswer(self, data):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, dict):
                return "%s/%s/%s" % (tmp['year'], tmp['month'], tmp['day'])

        except KeyError:
            pass
        return None

class Timestamp(Field):
    field_type = "time"
    def getAnswer(self, data):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, dict):
                return "%s:%s:%s %s" % (tmp['hours'], tmp['minutes'], tmp['seconds'], tmp['am_pm'])

        except KeyError:
            pass
        return None

class Dropdown(Text):
    field_type = "dropdown"
    pass

class NumberField(Text):
    field_type = "number"
    pass

class WebsiteField(Text):
    field_type = "website"
    pass

class EmailField(Text):
    field_type = "email"
    pass

class Schema(object):
    map = {
        "section_break": SectionBreak,
        "text": Text,
        "paragraph": Paragraph,
        "radio": Radio,
        "checkboxes": Checkboxes,
        "date": Date,
        "time": Timestamp,
        "dropdown": Dropdown,
        "number": NumberField,
        "website": WebsiteField,
        "email": EmailField
    }

    def __init__(self, schema):
        self.fields = {}
        cerror = "schema must be a list of dictionaries containing a formbuilder compliant schema."

        if not isinstance(schema, list):
            raise NotCompliant(cerror)

        for member in schema:

            if not (isinstance(member, dict) and member['cid'] and member['field_type']):
                raise NotCompliant(cerror)

            self.set(Schema.translate(member))

    def set(self, field):
        if(isinstance(field, Field)):
            self.fields[field.cid] = field
        else:
            raise self.UnsupportedField("The schema object only supports valid Field objects")

    def getAnswer(self, cid, data):
        if not 'other' in cid:
            return self.fields[cid].getAnswer(data)

    @staticmethod
    def translate(schema):
        try:
            return Schema.map[schema['field_type']](schema['cid'], schema['label'], schema['required'], schema['field_options'])
        except KeyError:
            raise Schema.UnsupportedField("The schema type %s doesnt have a valid class translation" % schema.type)

    class UnsupportedField(Exception):
        pass

    class NotCompliant(Exception):
        pass
