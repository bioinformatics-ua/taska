from django.contrib import admin

from models import Profile

# Register your models here.
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`accounts.models.Profile` entries.
    '''
    pass
