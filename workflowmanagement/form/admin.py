from django.contrib import admin

# Register your models here.
from models import Form

@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`form.models.Form` entries.
    '''
    list_display = ('title', 'creator', 'created_date', 'latest_update')
