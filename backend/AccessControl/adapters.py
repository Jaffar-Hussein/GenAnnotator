from allauth.account.adapter import DefaultAccountAdapter
from django.conf import settings


class CustomAccountAdapter(DefaultAccountAdapter):
    def get_email_confirmation_url(self, request, emailconfirmation):
        # Get the key from the EmailConfirmation object
        key = emailconfirmation.key

        front_end_url = getattr(settings,
                                'FRONT_END_URL',
                                'http://localhost:3000')
        return f"{front_end_url}/accounts/confirm-email/{key}"
