from datetime import timedelta
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.generics import RetrieveUpdateAPIView, CreateAPIView, ListAPIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from rest_framework_simplejwt.exceptions import InvalidToken

from .models import StudentProfile, TeacherProfile, AvailabilityBlock, Lesson, LessonEventLog
from .serializers import (
    CustomUserSerializer,
    RegisterUserSerializer,
    LoginUserSerializer,
    StudentProfileSerializer,
    TeacherProfileSerializer,
    AvailabilityBlockSerializer,
    LessonSerializer,
    LessonRequestSerializer,
    LessonProposeSerializer,
    AdminStudentProfileSerializer,
)
from .permissions import IsStudentRole, IsTeacherRole, IsAdminRole, IsTeacherOrAdmin


class AuthMeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(CustomUserSerializer(request.user).data)


class UserRegisterView(CreateAPIView):
    serializer_class = RegisterUserSerializer
    permission_classes = [AllowAny]


class UserLoginView(APIView):
    def post(self, request):
        serializer = LoginUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            response = Response({"user": CustomUserSerializer(user).data}, status=status.HTTP_200_OK)

            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
            )

            response.set_cookie(
                key="refresh_token",
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite="None",
            )
            return response
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if refresh_token:
            try:
                refresh = RefreshToken(refresh_token)
                refresh.blacklist()
            except Exception as exc:
                return Response({"error": "Invalid refresh token" + str(exc)}, status=status.HTTP_400_BAD_REQUEST)

        response = Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        response.delete_cookie("access_token")
        response.delete_cookie("refresh_token")
        return response


class CookieTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response({"error": "Refresh token not provided"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            refresh = RefreshToken(refresh_token)
            access_token = str(refresh.access_token)

            response = Response({"message": "Access token refreshed successfully"}, status=status.HTTP_200_OK)
            response.set_cookie(
                key="access_token",
                value=access_token,
                httponly=True,
                secure=True,
                samesite="None",
            )
            return response
        except InvalidToken:
            return Response({"error": "Invalid token"}, status=status.HTTP_401_UNAUTHORIZED)


class StudentMeView(RetrieveUpdateAPIView):
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated, IsStudentRole]

    def get_object(self):
        profile, _ = StudentProfile.objects.get_or_create(user=self.request.user)
        return profile


class SubmitApplicationView(APIView):
    permission_classes = [IsAuthenticated, IsStudentRole]

    def post(self, request):
        profile, _ = StudentProfile.objects.get_or_create(user=request.user)
        if not profile.is_profile_complete():
            return Response({"error": "Profile is not complete"}, status=status.HTTP_400_BAD_REQUEST)

        if profile.application_status != "draft":
            return Response({"error": "Application already submitted"}, status=status.HTTP_400_BAD_REQUEST)

        profile.application_status = "submitted"
        profile.submitted_at = timezone.now()
        profile.save()

        return Response(StudentProfileSerializer(profile).data, status=status.HTTP_200_OK)


class TeacherMeView(RetrieveUpdateAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated, IsTeacherRole]

    def get_object(self):
        profile, _ = TeacherProfile.objects.get_or_create(user=self.request.user)
        return profile


class TeachersListView(ListAPIView):
    serializer_class = TeacherProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        return TeacherProfile.objects.select_related("user").all()


class AvailabilityBlockListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherRole]

    def get(self, request):
        profile = get_object_or_404(TeacherProfile, user=request.user)
        blocks = AvailabilityBlock.objects.filter(teacher=profile)
        return Response(AvailabilityBlockSerializer(blocks, many=True).data)

    def post(self, request):
        profile = get_object_or_404(TeacherProfile, user=request.user)
        serializer = AvailabilityBlockSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(teacher=profile)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AvailabilityBlockDetailView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherRole]

    def put(self, request, pk):
        profile = get_object_or_404(TeacherProfile, user=request.user)
        block = get_object_or_404(AvailabilityBlock, pk=pk, teacher=profile)
        serializer = AvailabilityBlockSerializer(block, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        profile = get_object_or_404(TeacherProfile, user=request.user)
        block = get_object_or_404(AvailabilityBlock, pk=pk, teacher=profile)
        block.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminApplicationsListView(ListAPIView):
    serializer_class = AdminStudentProfileSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = StudentProfile.objects.select_related("user", "matched_teacher", "matched_teacher__user")
        status_param = self.request.query_params.get("status")
        if status_param:
            queryset = queryset.filter(application_status=status_param)
        return queryset


class AdminApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request, pk):
        profile = get_object_or_404(
            StudentProfile.objects.select_related("user", "matched_teacher", "matched_teacher__user"),
            pk=pk,
        )
        return Response(AdminStudentProfileSerializer(profile).data)


class AdminApplicationNotesView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        profile = get_object_or_404(StudentProfile, pk=pk)
        notes = request.data.get("notes", "")
        profile.onboarding_notes = notes
        profile.save()
        return Response(AdminStudentProfileSerializer(profile).data)


class AdminApplicationMatchView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request, pk):
        profile = get_object_or_404(StudentProfile, pk=pk)
        teacher_id = request.data.get("teacher_id")
        if not teacher_id:
            return Response({"error": "teacher_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        teacher = get_object_or_404(TeacherProfile, pk=teacher_id)
        profile.matched_teacher = teacher
        profile.application_status = "matched"
        profile.save()
        return Response(AdminStudentProfileSerializer(profile).data)


class LessonListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if request.user.role == "admin":
            lessons = Lesson.objects.select_related("student__user", "teacher__user").all()
        elif request.user.role == "teacher":
            teacher = get_object_or_404(TeacherProfile, user=request.user)
            lessons = Lesson.objects.select_related("student__user", "teacher__user").filter(teacher=teacher)
        else:
            student = get_object_or_404(StudentProfile, user=request.user)
            lessons = Lesson.objects.select_related("student__user", "teacher__user").filter(student=student)

        return Response(LessonSerializer(lessons, many=True).data)

    def post(self, request):
        if request.user.role != "student":
            return Response({"error": "Only students can request lessons"}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(StudentProfile, user=request.user)
        if not student.matched_teacher:
            return Response({"error": "Student is not matched to a teacher"}, status=status.HTTP_400_BAD_REQUEST)

        serializer = LessonRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        starts_at = serializer.validated_data["starts_at_utc"]
        duration = serializer.validated_data["duration_minutes"]
        ends_at = starts_at + timedelta(minutes=duration)

        lesson = Lesson.objects.create(
            student=student,
            teacher=student.matched_teacher,
            starts_at_utc=starts_at,
            ends_at_utc=ends_at,
            duration_minutes=duration,
            status="requested",
            requested_by_role="student",
        )

        LessonEventLog.objects.create(
            lesson=lesson,
            actor=request.user,
            event_type="requested",
            payload_json={"starts_at_utc": str(starts_at), "duration_minutes": duration},
        )

        return Response(LessonSerializer(lesson).data, status=status.HTTP_201_CREATED)


class LessonDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        lesson = get_object_or_404(Lesson.objects.select_related("student__user", "teacher__user"), pk=pk)
        if request.user.role == "student" and lesson.student.user_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        if request.user.role == "teacher" and lesson.teacher.user_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        return Response(LessonSerializer(lesson).data)


def _has_overlap(lesson, starts_at, ends_at):
    teacher_overlap = Lesson.objects.filter(
        teacher=lesson.teacher,
        status="confirmed",
    ).exclude(pk=lesson.pk).filter(starts_at_utc__lt=ends_at, ends_at_utc__gt=starts_at).exists()

    student_overlap = Lesson.objects.filter(
        student=lesson.student,
        status="confirmed",
    ).exclude(pk=lesson.pk).filter(starts_at_utc__lt=ends_at, ends_at_utc__gt=starts_at).exists()

    return teacher_overlap or student_overlap


class LessonProposeView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherRole]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if lesson.teacher.user_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)

        serializer = LessonProposeSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        starts_at = serializer.validated_data["starts_at_utc"]
        duration = serializer.validated_data["duration_minutes"]
        ends_at = starts_at + timedelta(minutes=duration)

        lesson.starts_at_utc = starts_at
        lesson.ends_at_utc = ends_at
        lesson.duration_minutes = duration
        lesson.status = "proposed"
        lesson.requested_by_role = "teacher"
        lesson.save()

        LessonEventLog.objects.create(
            lesson=lesson,
            actor=request.user,
            event_type="proposed",
            payload_json={"starts_at_utc": str(starts_at), "duration_minutes": duration},
        )

        return Response(LessonSerializer(lesson).data)


class LessonConfirmView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if request.user.role == "teacher" and lesson.teacher.user_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)

        if _has_overlap(lesson, lesson.starts_at_utc, lesson.ends_at_utc):
            return Response({"error": "Overlapping confirmed lesson"}, status=status.HTTP_400_BAD_REQUEST)

        lesson.status = "confirmed"
        lesson.save()

        LessonEventLog.objects.create(
            lesson=lesson,
            actor=request.user,
            event_type="confirmed",
            payload_json={},
        )

        return Response(LessonSerializer(lesson).data)


class LessonCancelView(APIView):
    permission_classes = [IsAuthenticated, IsTeacherOrAdmin]

    def post(self, request, pk):
        lesson = get_object_or_404(Lesson, pk=pk)
        if request.user.role == "teacher" and lesson.teacher.user_id != request.user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)

        lesson.status = "canceled"
        lesson.save()

        LessonEventLog.objects.create(
            lesson=lesson,
            actor=request.user,
            event_type="canceled",
            payload_json={},
        )

        return Response(LessonSerializer(lesson).data)
