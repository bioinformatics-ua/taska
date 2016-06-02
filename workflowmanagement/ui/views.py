from django.shortcuts import render
from django.views.generic import TemplateView


class IndexView(TemplateView):
    template_name = "index.html"

    def get(self, request):
        return super(IndexView, self).get(request)
