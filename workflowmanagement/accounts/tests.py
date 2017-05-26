from django.test import TestCase
from django.contrib.auth.models import User

class AccountsTest(TestCase):
    def setUp(self):
        User.objects.create_user('John', 'john@ua.pt', '12345')
        User.objects.create_user('Rafa', 'rafa@ua.pt', '12345')
        User.objects.create_user('Anocas', 'ana@ua.pt', '12345')
        User.objects.create_user('Maria', 'maria@ua.pt', '12345')
        User.objects.create_user('Sofia', 'sofia@ua.pt', '12345')

    def test_count_users(self):#dummy test
        all = User.objects.all()
        self.assertEqual(all.count(), 5)

















class SimpleTest(TestCase):
    def test_basic_addition(self):
        """
        Tests that 1 + 1 always equals 2.
        """
        self.assertEqual(1 + 1, 2)
