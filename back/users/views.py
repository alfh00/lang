from django.shortcuts import render
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import CustomUserSerializer, RegisterUserSerializer, LoginUserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken



class UserInfoView(RetrieveUpdateAPIView):
    """
    API view to retrieve and update user information.
    """
    permission_classes = [IsAuthenticated]
    serializer_class = CustomUserSerializer

    def get_object(self):
        return self.request.user


class UserRegisterView(CreateAPIView):
    """
    API view to register a new user.
    """
    serializer_class = RegisterUserSerializer

class UserLoginView(APIView):
    """
    API view to log in a user.
    """
    
    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)
        
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            
            response = Response({
                "user": CustomUserSerializer(user).data},
                                status=status.HTTP_200_OK)
            
            response.set_cookie(key="access_token", 
                                value=access_token,
                                httponly=True,
                                secure=True,
                                samesite="None")
            
            response.set_cookie(key="refresh_token",
                                value=str(refresh),
                                httponly=True,
                                secure=True,
                                samesite="None")
            return response
        return Response( serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class UserLogoutView(APIView):
    """
    API view to log out a user.
    """
    def post(self, request, *args, **kwargs):
        refresh_Token = request.COOKIES.get('refresh_token')
        
        if refresh_Token:
            try:
                refresh = RefreshToken(refresh_Token)
                refresh.blacklist()
            except Exception as e:
                return Response({'error': 'Invalid refresh token' + str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        response = Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)

        response.delete_cookie('access_token')
        response.delete_cookie('refresh_token')

        return response
    
class CookieTokenRefreshView(TokenRefreshView):
    """
    API view to refresh JWT tokens using cookies.
    """
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get('refresh_token')

        if not refresh_token:
            print("No refresh token found in cookies")
            return Response({'error': 'Refresh token not provided'}, status=status.HTTP_401_UNAUTHORIZED)


        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)
            
            response = Response({"message": "Access token token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(key="access_token", 
                                value=access_token,
                                httponly=True,
                                secure=True,
                                samesite="None")
            return response
        except InvalidToken:
            return Response({"error":"Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)

