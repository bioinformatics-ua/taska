from django.db import models

from django.contrib.auth.models import User

class Profile(models.Model):
    POPUP       = 0
    BELOW       = 1

    DETAIL_MODES= (
            (POPUP,     'Detail views are shown in a popup.'),
            (BELOW,     'Detail views appear below in the page sequence.'),
        )
    user        = models.OneToOneField(User)
    detail_mode = models.PositiveSmallIntegerField(choices=DETAIL_MODES, default=POPUP)
