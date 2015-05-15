from process.models import ProcessTask
from models import FormTask, FormResult

from fields import Schema

import json

import csv
from django.utils.six.moves import range
from django.http import StreamingHttpResponse, HttpResponse

import string

from openpyxl import Workbook
from openpyxl.writer.excel import save_virtual_workbook

from tasks.models import Task
from result.models import Result

class ResultExporter(object):
    class Meta:
        task_model = Task
        result_model = Result

    class UnsupportedExport(Exception):
        def __init__(self, value):
            self.value = value
        def __str__(self):
            return repr(self.value)

    def __init__(self, processtask):
        self.processtask = processtask

    def getTask(self):
        # reference is generic, so we must get proper model, so lets at least memoize it

        if not hasattr(self, '__task'):
            self.__task = self.Meta.task_model.objects.get(id=self.processtask.task.id)

        return self.__task

    def getResults(self):
        # again, reference generic, must get proper model, so lets memoize it
        if not hasattr(self, '__results'):
            users = self.processtask.users().values_list('id', flat=True)
            self.__results = self.Meta.result_model.objects.filter(removed=False, processtaskuser__in=users)

        return self.__results

    def export(self, encode=False):
        results = self.getResults()

        rows = [['User / Field']]

        for result in results:
            user = result.processtaskuser.user

            if user.get_full_name():
                user = user.get_full_name()
            else:
                user = user.email

            row = [user]

            rows.append(row)

        return rows

    @staticmethod
    def getInstance(mode, processtask):

        Task.objects.get()

        if mode == "csv":
            return FormResultExporterCSV(processtask)
        if mode == 'json':
            return FormResultExporterJSON(processtask)

        if mode == 'xlsx':
            return FormResultExporterXLSX(processtask)

        else:
            raise FormResultExporter.UnsupportedExport("Type '%s' is not a supported format of export" % mode)


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


## Reference on exporting large csv files (for scalability) from:
## https://docs.djangoproject.com/en/1.8/howto/outputting-csv/
class Echo(object):
    """An object that implements just the write method of the file-like
    interface.
    """
    def write(self, value):
        """Write the value by returning it, instead of storing in a buffer."""
        return value

# Ref from: https://gist.github.com/seanh/93666
def filename(s):
    """Take a string and return a valid filename constructed from the string.
    Uses a whitelist approach: any characters not present in valid_chars are
    removed. Also spaces are replaced with underscores.

    Note: this method may produce invalid filenames such as ``, `.` or `..`
    When I use this method I prepend a date string like '2009_01_15_19_46_32_'
    and append a file extension like '.txt', so I avoid the potential of using
    an invalid filename.

    """
    valid_chars = "-_.() %s%s" % (string.ascii_letters, string.digits)
    filename = ''.join(c for c in s if c in valid_chars)
    filename = filename.replace(' ','_') # I don't like spaces in filenames.
    return 'exported_'+filename

class FormResultExporterCSV(FormResultExporter):

    def export(self, encode=False):
        task = self.getTask()
        rows = super(self.__class__, self).export(encode=True)

        pseudo_buffer = Echo()
        writer = csv.writer(pseudo_buffer)
        response = StreamingHttpResponse((writer.writerow(row) for row in rows),
                                         content_type="text/csv")
        response['Content-Disposition'] = 'attachment; filename="%s.csv"' % filename(str(task))
        return response


class FormResultExporterJSON(FormResultExporter):
    def export(self, encode=False):
        task = self.getTask()
        rows = super(self.__class__, self).export()

        response = HttpResponse(json.dumps(rows, indent=4, ensure_ascii=False), content_type="application/json")
        response['Content-Disposition'] = 'attachment; filename="%s.json"' % filename(str(task))
        return response

class FormResultExporterXLSX(FormResultExporter):

    def export(self, encode=False):
        task = self.getTask()
        rows = super(self.__class__, self).export(encode=True)

        wb = Workbook()
        ws = wb.worksheets[0]

        for row in rows:
            tmp = []
            for line in row:
                if line == None:
                    tmp.append('')
                else:
                    tmp.append(line)


            ws.append(tmp)

        response = HttpResponse(save_virtual_workbook(wb), content_type='application/vnd.ms-excel')

        response['Content-Disposition'] = 'attachment; filename="%s.xlsx"' % filename(str(task))

        return response
