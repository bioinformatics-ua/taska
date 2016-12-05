from models import FormTask, FormResult

from fields import Schema

import json

from tasks.export import ResultExporter, XLSXMixin, CSVMixin, JSONMixin

class FormResultExporter(ResultExporter):
    ''' Singleton that handles FormResult objects to exporting to a variety of formats.
    '''
    class Meta:
        task_model = FormTask
        result_model = FormResult

    def getSchema(self):
        ''' Allows getting a Form :class:`form.fields.Schema`, given a FormResult object.
        '''
        if not hasattr(self, '__schema'):
            task = self.getTask()
            self.__schema = Schema(json.loads(task.form.schema))

        return self.__schema

    def export(self, encode=False):
        ''' Generic method override that exports all relevant fields, to a tabular list of content.
            In the forms case, this means all questions and question answers, given by each user.
        '''
        results = self.getResults()
        schema  = self.getSchema()
        fields  = schema.getKeys()


        rows = super(FormResultExporter, self).export(encode=encode)

        i=6
        rows[i].extend(schema.getLabels(encode=encode))

        for result in results:
            i+=1
            answers = json.loads(result.answer)
            row = []
            for field in fields:
                answer = schema.getAnswer(field, answers, encode=encode)

                if isinstance(answer, list):
                    row.extend(answer)
                else:
                    row.append(answer)

            rows[i].extend(row)

        return rows

    @staticmethod
    def getInstance(mode, processtask):
        ''' Entry point for this singleton, used to get the specific exporter from all the exporters available.
            In this case we implement csv, json and xlsx exporters.
        '''
        if mode == "csv":
            return FormResultExporterCSV(processtask)
        if mode == 'json':
            return FormResultExporterJSON(processtask)

        if mode == 'xlsx':
            return FormResultExporterXLSX(processtask)

        else:
            raise FormResultExporter.UnsupportedExport("Type '%s' is not a supported format of export" % mode)

class FormResultExporterCSV(CSVMixin, FormResultExporter):
    ''' FormResult CSV Exporter
    '''
    pass

class FormResultExporterJSON(JSONMixin, FormResultExporter):
    ''' FormResult JSON Exporter
    '''
    pass

class FormResultExporterXLSX(XLSXMixin, FormResultExporter):
    ''' FormResult XLSX Exporter
    '''
    pass

