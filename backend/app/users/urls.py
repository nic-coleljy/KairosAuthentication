from django.urls import re_path
from users.views import user_crud
from users.serializers import CustomTokenObtainPairView

urlpatterns = [
    re_path('jwt/custom/', CustomTokenObtainPairView.as_view(), name='custom_token_obtain_pair'),
    re_path('admin/user-crud/', user_crud, name='user_crud'),
    re_path('admin/user-crud/<str:user_id>', user_crud, name='user_crud'),
]