from django.urls import re_path, path, include
from auth_api import urls as auth_urls
from users import urls as custom_claims
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
   openapi.Info(
      title="API Documentation for Kairos",
      default_version='v1',
      description="API Authentication Service for Ascendas Loyalty",
      terms_of_service="https://www.google.com/policies/terms/",
      contact=openapi.Contact(email="jrpang.2020@smu.edu.sg"),
      license=openapi.License(name="BSD License"),
   ),
   public=True,
   permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
    path('auth/', include(auth_urls)),
    path('auth/', include(custom_claims)),
    re_path(r'^playground/$', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    re_path(r'^docs/$', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

