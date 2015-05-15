from process.models import ProcessTask
from models import FormTask, FormResult

from fields import Schema

import json

class FormResultExporter(object):
    class UnsupportedExport(Exception):
        def __init__(self, value):
            self.value = value
        def __str__(self):
            return repr(self.value)

    def __init__(self, processtask):
        self.processtask = processtask

    def export(self):
        raise NotImplementedError("Result Exporter is abstract and must be implemented by children classes")

    @staticmethod
    def getInstance(mode, processtask):
        if mode == "csv":
            return FormResultExporterCSV(processtask)

        else:
            raise FormResultExporter.UnsupportedExport("Type '%s' is not a supported format of export" % mode)



class FormResultExporterCSV(FormResultExporter):
    def __init__(self, processtask):
        super(self.__class__, self).__init__(processtask)

    def export(self):
        # reference is generic, so we must get proper model
        task = FormTask.objects.get(id=self.processtask.task.id)

        # again, reference generic, must get proper model
        users = self.processtask.users().values_list('id', flat=True)
        results = FormResult.objects.filter(removed=False, processtaskuser__in=users)

        schema = Schema(json.loads(task.form.schema))

        for result in results:
            answers = json.loads(result.answer)
            print "--"
            for cid in answers.keys():
                print schema.getAnswer(cid, answers)
            print "--"
