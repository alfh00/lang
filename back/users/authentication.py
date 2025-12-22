from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieJwtAuthentication(JWTAuthentication):
    """
    Custom JWT authentication class that retrieves the token from a cookie.
    """
    def authenticate(self, request):
        token = request.COOKIES.get('access_token')

        if not token:
            print("No token found in cookies")
            return None
        try:
            validated_token = self.get_validated_token(token)
        except AuthenticationFailed as e:
            raise AuthenticationFailed('Invalid token' + str(e))
        

        try:
            user = self.get_user(validated_token)
            return user, validated_token
            
        except AuthenticationFailed as e:
            raise AuthenticationFailed('User not found' + str(e))
        
        
        
        

    # def get_raw_token(self, request):
    #     """
    #     Extracts the raw JWT token from the 'jwt' cookie.
    #     """
    #     cookie_token = request.COOKIES.get('jwt')
    #     return cookie_token