# coding=utf-8
from process.models import *
from django.shortcuts import render

from django.http import Http404

from django.shortcuts import get_object_or_404

from wkhtmltopdf.views import PDFTemplateView, PDFTemplateResponse

from django.conf import settings

class ResultsPDF(PDFTemplateView):
    template_name='results_pdf.html'
    filename='results.pdf'

    def get(self, request, hash):
        from result.models import Result

        ptask = get_object_or_404(ProcessTask, hash=hash)

        if not (
                request.user == ptask.process.executioner
                or ptask.process.workflow.workflowpermission.public
            ):
            raise Http404

        users = ptask.users().values_list('id', flat=True)


        results = Result.objects.filter(removed=False, processtaskuser__in=users).select_subclasses()

        tasktype = ptask.task.subclass()
        schema=None

        if tasktype.type() == 'form.FormTask':
            schema = tasktype.form.schema

        context = {
            'STATIC_URL': settings.STATIC_URL,
            'processtask': ptask,
            'schema' : schema,
            'results': results,
            'status': ProcessTask.statusCode(ptask.status)
        }


        response_class = self.response_class

        if request.GET.get('as', '') == 'html':
            return render(request, self.template_name, context)

        return PDFTemplateResponse(request=request,
                                   template=self.template_name,
                                   filename=self.filename,
                                   context= context,
                                   show_content_in_browser=False,
                                   cmd_options= {'javascript-delay': 1000},
                                   )