class Field(object):
    ''' Generically represents a Schema unitary field. Used to polimorphically refer to a schema field.
    '''
    field_type = "field"

    def __init__(self, cid, label, required, field_options):
        ''' Constructor, Initializes a new Field object.
        '''
        self.cid = cid
        self.label = label
        self.required = required
        self.field_options = field_options

    def getAnswer(self, data, encode=False):
        '''Abstract method used to get a answer, this should be implemented by all the specific fields, as structure
        will vary, but output must always be text.
        '''
        raise NotImplementedError("Field getAnswer() is abstract and must be implemented by children classes")

    def getLabel(self, encode=False):
        ''' Returns the label that describes this field(like a question).
        '''
        if encode:
            return self.label.encode('utf-8')

        return self.label

    def getCid(self):
        ''' Returns the id that identifies this field(and is used as identificator on the answers)
        '''
        return self.cid

class SectionBreak(Field):
    '''A section break, which while not being possible to answer, separates differentes groups of fields from each other.
    '''
    field_type = "section_break"

    def getAnswer(self, data, encode=False):
        return ""

class Text(Field):
    '''A simple text field, is the most common type of Field object, and requires not structure handling.
    '''
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
    '''A long text field, is similar to a Text field, from a backend perspective.
    '''
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
    '''A multiple checkbox field, multiple lines are processed for this questions, one for each possible answer
        so the information can be crossed analysed.
    '''
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
    '''A date field. Is separated by day, month and year, and must is put together as a simple string.
    '''
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
    '''A time field. Is separated by hours, minutes and seconds, pls am/pm, is put together as a simple string.
    '''
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
    ''' A dropdown field, from a backend perspective is similar to a simple Text field.
    '''
    field_type = "dropdown"
    pass

class NumberField(Text):
    ''' A Number field, from a backend perspective is similar to a simple Text field.
    '''
    field_type = "number"
    pass

class WebsiteField(Text):
    ''' A Website field, from a backend perspective is similar to a simple Text field.
    '''
    field_type = "website"
    pass

class EmailField(Text):
    ''' A email field, from a backend perspective is similar to a simple Text field.
    '''
    field_type = "email"
    pass

class Schema(object):
    ''' This object allows the conversion of the formbuilder schema format, to a native python class-based
        representation, which is very useful for data handling and exporting.
    '''
    # map, used to translate types of questions into the proper python classes that represent the fields
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
        ''' Constructors, picks a json formbuilder complaint schema and translates it into a python native class-based structure
        '''
        self.fields = {}
        cerror = "schema must be a list of dictionaries containing a formbuilder compliant schema."

        if not isinstance(schema, list):
            raise NotCompliant(cerror)

        for member in schema:

            if not (isinstance(member, dict) and member['cid'] and member['field_type']):
                raise NotCompliant(cerror)

            self.set(Schema.translate(member))

    def set(self, field):
        ''' Sets a :class:`form.fields.Field` children as a field.
        '''
        if(isinstance(field, Field)):
            self.fields[field.cid] = field
        else:
            raise self.UnsupportedField("The schema object only supports valid Field objects")

    def getKeys(self):
        ''' Returns a list of all the cid keys on this schema.
        '''
        return self.fields.keys()

    def getFields(self):
        ''' Returns a list of all the fields on this schema.
        '''
        return self.fields.values()


    def getLabels(self, encode=False):
        ''' Returns a list of all the labels of all the fields on this schema.
        '''
        tmp = []

        for field in self.getFields():
            label = field.getLabel(encode=encode)

            if isinstance(label, list):
                tmp.extend(label)

            else:
                tmp.append(label)

        return tmp

    def getAnswer(self, cid, data, encode=False):
        ''' Returns a specific answer, given a cid and a json structure.
        '''
        if not 'other' in cid:
            return self.fields[cid].getAnswer(data, encode=encode)

    @staticmethod
    def translate(schema):
        ''' Translates a json formatted field into a valid Field Class object, if possible.
        '''
        try:
            return Schema.map[schema['field_type']](schema['cid'], schema['label'], schema['required'], schema['field_options'])
        except KeyError:
            raise Schema.UnsupportedField("The schema type %s doesnt have a valid class translation" % schema.type)

    class UnsupportedField(Exception):
        ''' Represents a not supported field exception, thrown whenever the field is not recognized as a valid type.
        '''
        pass

    class NotCompliant(Exception):
        ''' Represents a not compliant exception, thrown when the json does not follow the formbuilder proper format.
        '''
        pass
