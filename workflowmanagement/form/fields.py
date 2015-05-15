class Field(object):
    field_type = "field"

    def __init__(self, cid, label, required, field_options):
        self.cid = cid
        self.label = label
        self.required = required
        self.field_options = field_options

    def getAnswer(self, data, encode=False):
        raise NotImplementedError("Field getAnswer() is abstract and must be implemented by children classes")

    def getLabel(self, encode=False):
        if encode:
            return self.label.encode('utf-8')

        return self.label

    def getCid(self):
        return self.cid

class SectionBreak(Field):
    field_type = "section_break"

    def getAnswer(self, data, encode=False):
        return ""

class Text(Field):
    field_type = "text"

    def getAnswer(self, data, encode=False):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, basestring):
                if encode:
                    tmp = tmp.encode('utf-8')
                return tmp

        except KeyError:
            pass

        return None

class Paragraph(Text):
    field_type = "paragraph"
    pass

class Radio(Field):
    field_type = "radio"
    def getAnswer(self, data, encode=False):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, basestring):
                if tmp == 'Other':
                    try:
                        tmp += ' (%s)' % data["%s_other" % self.cid]
                    except KeyError:
                        pass

                if encode:
                    tmp = tmp.encode('utf-8')

                return tmp
        except KeyError:
            pass

        return None

class Checkboxes(Field):
    field_type = "checkboxes"

    def getLabel(self, encode=False):
        '''
            Since checkboxes can be multiple, we dont have only a label but a list of getLabels
            to make easy to chart through the exported content
        '''
        main = self.label
        tmp = []

        try:
            options = self.field_options["options"]
            has_other = self.field_options["include_other_option"]

            for option in options:
                if encode:
                    tmp.append(('%s - %s' % (main, option['label'])).encode('utf-8'))
                else:
                    tmp.append('%s - %s' % (main, option['label']))

            if has_other:
                tmp.append('Other')

            return tmp

        except KeyError:
            if encode:
                return main.encode('utf-8')

            return main

    def getAnswer(self, data, encode=False):
        try:
            answers = []
            tmp = data[self.cid]
            result = []

            options = self.field_options["options"]
            has_other = self.field_options["include_other_option"]
            other = None
            if isinstance(tmp, dict):
                for index, state in tmp.items():
                    if state == 'on' and index != 'other':
                        if index == 'other_checkbox':
                            try:
                                other ="%s" % tmp['other']
                            except KeyError:
                                other = 'Other'
                        else:
                            answers.append(options[int(index)]['label'])


                for option in options:
                    if option['label'] in answers:
                        result.append('1')
                    else:
                        result.append('0')

                if has_other:
                    if other:
                        if encode:
                            result.append(other.encode('utf-8'))
                        else:
                            result.append(other)
                    else:
                        result.append('0')

            return result
        except KeyError:
            pass

        return None

class Date(Field):
    field_type = "date"
    def getAnswer(self, data, encode=False):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, dict):
                tmp = "%s/%s/%s" % (tmp['year'], tmp['month'], tmp['day'])

                if encode:
                    tmp = tmp.encode('utf-8')

                    return tmp

        except KeyError:
            pass
        return None

class Timestamp(Field):
    field_type = "time"
    def getAnswer(self, data, encode=False):
        try:
            tmp = data[self.cid]

            if isinstance(tmp, dict):
                tmp = "%s:%s:%s %s" % (tmp['hours'], tmp['minutes'], tmp['seconds'], tmp['am_pm'])

                if encode:
                    tmp = tmp.encode('utf-8')

                return tmp

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

    def getKeys(self):
        return self.fields.keys()

    def getFields(self):
        return self.fields.values()


    def getLabels(self, encode=False):
        tmp = []

        for field in self.getFields():
            label = field.getLabel(encode=encode)

            if isinstance(label, list):
                tmp.extend(label)

            else:
                tmp.append(label)

        return tmp

    def getAnswer(self, cid, data, encode=False):
        if not 'other' in cid:
            return self.fields[cid].getAnswer(data, encode=encode)

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
