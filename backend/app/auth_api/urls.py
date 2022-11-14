from django.urls import re_path
from auth_api.views import sso_login, sso_userdata

urlpatterns = [
    re_path('sso-login', sso_login),
    re_path('sso-userdata', sso_userdata),
    # re_path('get-userinfo', get_userinfo),
]