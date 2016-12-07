# coding=utf-8
from django.shortcuts import get_object_or_404
from django.http import Http404
from process.models import *
from django.http import HttpResponse, StreamingHttpResponse
from tasks.export import ResultExporter
from rest_framework.response import Response
from rest_framework.views import APIView


class ProcessTaskResultExport(APIView):
    def get(self, request, hash, mode):
        if not mode:
            mode = 'csv'

        ptask = get_object_or_404(ProcessTask, hash=hash)

        if not (
                request.user == ptask.process.executioner
                or ptask.process.workflow.workflowpermission.public
            ):
            raise Http404

        try:
            # Type is generic, so we must get it (as we have no idea of type from processtask)
            task = Task.objects.get_subclass(id=ptask.task.id)

            exporter = task.get_exporter(mode, ptask)

            export = exporter.export()

            if isinstance(export, HttpResponse) or isinstance(export, StreamingHttpResponse):
                return export

        except ResultExporter.UnsupportedExport:
            raise

        return Response({'export': export}, 500)