from django.core.management.base import BaseCommand
from AccessControl.models import CustomUser
from django.db import transaction

class Command(BaseCommand):
    help = 'Simulate user data'

    def handle(self, *args, **kwargs):
        
        self.stdout.write("Running simulate.py script...", ending="\n")

        try:
            with transaction.atomic():
                # SuperUser
                CustomUser.objects.create_superuser(username="leooojr", 
                                                    email="leo.jourdain@etu-upsaclay.fr",
                                                    password="leoleo",
                                                    first_name="Léo",
                                                    last_name="Jourdain",
                                                    role=CustomUser.validator)
                
                # Users

                # Reader
                CustomUser.objects.create_user(username="marie",
                                               email="marie@marie.fr",
                                               password="mariemarie",
                                               first_name="Marie",
                                               last_name="Chemin",
                                               role=CustomUser.reader)
                
                # Annotator
                CustomUser.objects.create_user(username="paul",
                                               email="paul@paul.fr",
                                               password="paulpaul",
                                               first_name="Paul",
                                               last_name="Rouge",
                                               role=CustomUser.annotator)

                # Validator
                CustomUser.objects.create_user(username="jean",
                                               email="jean@jean.fr",
                                               password="jeanjean",
                                               first_name="Jean",
                                               last_name="Dupont",
                                               role=CustomUser.validator)

                self.stdout.write("Users created successfully...")

        except Exception as e:
            self.stdout.write("Error: %s" % e, ending="\n")