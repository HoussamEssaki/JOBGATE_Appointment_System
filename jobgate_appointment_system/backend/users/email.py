from djoser import email
from django.contrib.auth.tokens import default_token_generator
from djoser import utils
from djoser.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

class PasswordResetEmail(email.BaseEmailMessage):
    template_name = "email/password_reset.html"
    
    def get_context_data(self):
        context = super().get_context_data()
        
        user = context.get("user")
        context["uid"] = utils.encode_uid(user.pk)
        context["token"] = default_token_generator.make_token(user)
        context["url"] = settings.PASSWORD_RESET_CONFIRM_URL.format(**context)
        context["site_name"] = "JOBGATE Appointment System"
        context["domain"] = "your-domain.com"  # Replace with your actual domain
        
        return context

class PasswordChangedConfirmationEmail(email.BaseEmailMessage):
    template_name = "email/password_changed_confirmation.html"
    
    def get_context_data(self):
        context = super().get_context_data()
        context["site_name"] = "JOBGATE Appointment System"
        context["domain"] = "your-domain.com"  # Replace with your actual domain
        return context