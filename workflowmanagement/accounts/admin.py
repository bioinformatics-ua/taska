from django.contrib import admin

from models import Profile, UserRecovery

# Register your models here.
@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`accounts.models.Profile` entries.
    '''
    pass

@admin.register(UserRecovery)
class RecoveryAdmin(admin.ModelAdmin):
    ''' Django-Admin page for listing, adding and editing :class:`accounts.models.UserRecovery` entries.
    '''
    pass
