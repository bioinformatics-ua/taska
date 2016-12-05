from messagesystem.mailing import MailTemplate


class MessageTemplate(MailTemplate):
    subjecttemplate="mail/generic_mail_subject.html"
    template="mail/generic_mail.html"

class ProcessCancelTemplate(MailTemplate):
    subjecttemplate="mail/process_cancel_subject.html"
    template="mail/process_cancel.html"

class ProcessDoneTemplate(MailTemplate):
    subjecttemplate="mail/process_done_subject.html"
    template="mail/process_done.html"

class ProcessTaskAddTemplate(MailTemplate):
    subjecttemplate="mail/processtask_add_subject.html"
    template="mail/processtask_add.html"

class ProcessWaitingAddTemplate(MailTemplate):
    subjecttemplate="mail/process_confirmation_subject.html"
    template="mail/process_confirmation.html"

class ProcessTaskUserRejectTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_reject_subject.html"
    template="mail/processtaskuser_reject.html"

class RequestClarificationAskTemplate(MailTemplate):
    subjecttemplate="mail/request_clarification_add_subject.html"
    template="mail/request_clarification_add.html"

class RequestReassignAskTemplate(MailTemplate):
    subjecttemplate="mail/request_reassign_add_subject.html"
    template="mail/request_reassign_add.html"

class RequestClarificationAnswerTemplate(MailTemplate):
    subjecttemplate="mail/request_clarification_edit_subject.html"
    template="mail/request_clarification_edit.html"

class RequestReassignAnswerTemplate(MailTemplate):
    subjecttemplate="mail/request_reassign_edit_subject.html"
    template="mail/request_reassign_edit.html"

class ProcessTaskUserRemainderTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_remainder_subject.html"
    template="mail/processtaskuser_remainder.html"

class ProcessTaskUserLateTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_late_subject.html"
    template="mail/processtaskuser_late.html"

class ProcessTaskUserRunTemplate(MailTemplate):
    subjecttemplate="mail/processtaskuser_run_subject.html"
    template="mail/processtaskuser_run.html"

class ResultAddTemplate(MailTemplate):
    subjecttemplate="mail/result_add_subject.html"
    template="mail/result_add.html"

class SimpleResultAddTemplate(ResultAddTemplate):
    pass

class FormResultAddTemplate(ResultAddTemplate):
    pass

class UserAddTemplate(MailTemplate):
    subjecttemplate="mail/user_add_subject.html"
    template="mail/user_add.html"

class UserApproveTemplate(MailTemplate):
    subjecttemplate="mail/user_approve_subject.html"
    template="mail/user_approve.html"

class UserRecoveryRecoverTemplate(MailTemplate):
    subjecttemplate="mail/userrecovery_recover_subject.html"
    template="mail/userrecovery_recover.html"