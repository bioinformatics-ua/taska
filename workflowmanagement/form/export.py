from models import FormTask, FormResult

from fields import Schema

import json

from tasks.export import ResultExporter, XLSXMixin, CSVMixin, JSONMixin

class FormResultExporter(ResultExporter):
    class Meta:
        task_model = FormTask
        result_model = FormResult

    def getSchema(self):
        if not hasattr(self, '__schema'):
            task = self.getTask()
            self.__schema = Schema(json.loads(task.form.schema))

        return self.__schema

    def export(self, encode=False):
        results = self.getResults()
        schema  = self.getSchema()
        fields  = schema.getKeys()

        rows = [ ['User / Question'] + schema.getLabels(encode=encode)]

        for result in results:
            answers = json.loads(result.answer)
            user = result.processtaskuser.user

            if user.get_full_name():
                user = user.get_full_name()
            else:
                user = user.email

            row = [user]
            for field in fields:
                answer = schema.getAnswer(field, answers, encode=encode)

                if isinstance(answer, list):
                    row.extend(answer)
                else:
                    row.append(answer)

            rows.append(row)

        return rows

    @staticmethod
    def getInstance(mode, processtask):
        if mode == "csv":
            return FormResultExporterCSV(processtask)
        if mode == 'json':
            return FormResultExporterJSON(processtask)

        if mode == 'xlsx':
            return FormResultExporterXLSX(processtask)

        else:
            raise FormResultExporter.UnsupportedExport("Type '%s' is not a supported format of export" % mode)

class FormResultExporterCSV(CSVMixin, FormResultExporter):
    pass

class FormResultExporterJSON(JSONMixin, FormResultExporter):
    pass

class FormResultExporterXLSX(XLSXMixin, FormResultExporter):
    pass

