# -*- coding: utf-8 -*-
# Copyright (C) 2014 Universidade de Aveiro, DETI/IEETA, Bioinformatics Group - http://bioinformatics.ua.pt/
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
from django.core.management.base import BaseCommand, CommandError

from django.contrib.auth.models import User

class Command(BaseCommand):

    args = '<username> <email> <password> <is_super_user>'
    help = 'Creates a new user on the system'

    def createUser(self, is_super, username, email, password):

        try:
            User.objects.get(username=username)
            self.stdout.write("\nERROR:The user %s already exists, choose another username.\n\n" % username)
            return
        except User.DoesNotExist:
            pass

        user = None

        if is_super:
            self.stdout.write("\nCreated super user %s.\n\n" % username)

            user = User.objects.create_superuser(username, email, password)
        else:
            self.stdout.write("\nCreated normal user %s.\n\n" % username)

            user = User.objects.adduser(username, email, password)

    def handle(self, *args, **options):

        if len(args) == 3:
            self.createUser(True, args[0], args[1], args[2])
        elif len(args) == 4:
            self.createUser(args[3] in ['true', '1', 't', 'y', 'yes'], args[0], args[1], args[2])
        else:
            self.stdout.write('-- USAGE: \n    '+
                'python manage.py adduser <username> <email> <password> <is_super_user>?[default=n]'+
                '\n\n')
