from django.db import models

from process.models import ProcessTaskUser

class Result(models.Model):
    ''' Generic representation of a result for a given ProcessTask, given by a given User.

    This generic object is generated when a user completes a given ProcessTask.

    Attributes:
        :processtaskuser (ProcessTaskUser)::class:`process.models.ProcessTaskUser` related with this result
        :date (datetime): Timestamp of this result generation
        :comment (str): Other relevant comments from the executioner about this task.
    '''
    processtaskuser = models.ForeignKey(ProcessTaskUser)
    date            = models.DateTimeField(auto_now_add=True)
    comment         = models.TextField()

class SimpleResult(Result):
    '''Basic concretization of a result for a ProcessTask.

    This is a basic implementation of the generic result model, and has no extra behaviour beyond the one provided by the generic model.
    Is meant to be used for simple check tasks, that are executed outside of the system and can not be ascertained through it.
    '''
    pass
