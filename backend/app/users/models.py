import uuid
import pymongo
from djongo import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager


class UserAccountManager(BaseUserManager):
    def create_user(self, email, first_name, last_name, birthdate, password=None, id=None):
        if not email:
            raise ValueError("Please enter an email address.")

        # NOT IN PRODUCTION PLZZZ
        myclient = pymongo.MongoClient(
            "")
        mydb = myclient["cluster0"]
        mycol = mydb["registration_list"]

        whitelisted_user = mycol.find_one({"email": email})

        if whitelisted_user is None:
            raise ValueError(
                "You are currently not shortlisted for the loyalty program.")
        elif whitelisted_user["first_name"] != first_name or whitelisted_user["last_name"] != last_name or whitelisted_user["birthdate"] != str(birthdate):
            raise ValueError(
                "You have entered one or more credentials incorrectly, please try again.")
        elif whitelisted_user["status"] == "registered":
            raise ValueError(
                "You have already registered on our platform, please login instead!")

        id = whitelisted_user["id"]
        email = self.normalize_email(email)
        user = self.model(id=id, email=email, first_name=first_name,
                          last_name=last_name, birthdate=birthdate)

        newvalues = {"$set": {"status": "registered"}}
        mycol.update_one(whitelisted_user, newvalues)

        user.set_password(password)
        user.save()

        return user


class UserAccount(AbstractBaseUser, PermissionsMixin):
    id = models.CharField(primary_key=True, max_length=255)
    email = models.EmailField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)
    birthdate = models.DateField(auto_now=False, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UserAccountManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name', 'birthdate']

    def get_full_name(self):
        return self.first_name + " " + self.last_name

    def get_short_name(self):
        return self.first_name

    def __str__(self):
        return self.email
