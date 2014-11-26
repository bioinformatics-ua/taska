from django.contrib import admin
from django.core.urlresolvers import reverse

def reverse_link(obj, name=None):
    '''Reverses a `obj` to obtain a hyperlink to the django-admin edit page for the object

    Is very useful to allow hyperlinking on list displays in django admin pages

    Args:
        :obj (Model): :class:`django.db.models.Model` instance to find the link to
    Kwargs:
        :name (str): Name to appear on the link, if left unfilled the obj textual representation will be used
    '''

    url = reverse('admin:%s_%s_change' % (obj._meta.app_label, obj._meta.module_name), args=(obj.id,))
    if name == None:
        name = obj
    return '<a href="%s">%s</a>' % (url, name)
