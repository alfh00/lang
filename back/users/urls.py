from django.urls import path
from .views import UserInfoView, UserRegisterView, UserLoginView, UserLogoutView, CookieTokenRefreshView

urlpatterns = [
    path('me/', UserInfoView.as_view(), name='me'),
    path('register/', UserRegisterView.as_view(), name='register'),
    path('login/', UserLoginView.as_view(), name='login'),
    path('logout/', UserLogoutView.as_view(), name='logout'),
    path('refresh/', CookieTokenRefreshView.as_view(), name='token_refresh'),

]