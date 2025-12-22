from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer, Serializer
from .models import (
    CustomUser,
    StudentProfile,
    TeacherProfile,
    AvailabilityBlock,
    Lesson,
)


class CustomUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name", "timezone", "role"]


class RegisterUserSerializer(ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["email", "password", "full_name", "timezone", "role"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate_role(self, value):
        if value not in {"student", "teacher"}:
            raise serializers.ValidationError("Role must be student or teacher")
        return value

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = CustomUser.objects.create_user(password=password, **validated_data)
        if user.role == "student":
            StudentProfile.objects.get_or_create(user=user)
        if user.role == "teacher":
            TeacherProfile.objects.get_or_create(user=user)
        return user


class LoginUserSerializer(Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Invalid credentials")


class StudentProfileSerializer(ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name")
    timezone = serializers.CharField(source="user.timezone")
    role = serializers.CharField(source="user.role", read_only=True)
    completion_percent = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "email",
            "full_name",
            "timezone",
            "role",
            "cefr_level",
            "preparing_for",
            "target_field",
            "target_field_other_text",
            "target_start_date",
            "target_start_date_unknown",
            "focus_skills",
            "learning_style",
            "weekly_time_budget_hours",
            "preferred_session_duration",
            "books_resources_text",
            "homework_preference",
            "availability_notes",
            "goals_summary",
            "terms_accepted_at",
            "privacy_accepted_at",
            "application_status",
            "submitted_at",
            "matched_teacher",
            "onboarding_notes",
            "completion_percent",
        ]
        read_only_fields = ["application_status", "submitted_at", "matched_teacher", "onboarding_notes"]

    def get_completion_percent(self, obj):
        return obj.completion_percent()

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        return super().update(instance, validated_data)


class TeacherProfileSerializer(ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    full_name = serializers.CharField(source="user.full_name")
    timezone = serializers.CharField(source="user.timezone")
    role = serializers.CharField(source="user.role", read_only=True)

    class Meta:
        model = TeacherProfile
        fields = [
            "id",
            "email",
            "full_name",
            "timezone",
            "role",
            "languages",
            "teaching_tracks",
            "levels_supported",
            "bio_short",
            "active",
            "availability_notes",
        ]

    def update(self, instance, validated_data):
        user_data = validated_data.pop("user", {})
        for attr, value in user_data.items():
            setattr(instance.user, attr, value)
        instance.user.save()
        return super().update(instance, validated_data)


class AvailabilityBlockSerializer(ModelSerializer):
    class Meta:
        model = AvailabilityBlock
        fields = ["id", "day_of_week", "start_time", "end_time", "slot_duration"]


class LessonSerializer(ModelSerializer):
    class Meta:
        model = Lesson
        fields = [
            "id",
            "student",
            "teacher",
            "starts_at_utc",
            "ends_at_utc",
            "duration_minutes",
            "status",
            "requested_by_role",
            "meeting_url",
            "notes",
        ]


class LessonRequestSerializer(Serializer):
    starts_at_utc = serializers.DateTimeField()
    duration_minutes = serializers.ChoiceField(choices=[30, 60])


class LessonProposeSerializer(Serializer):
    starts_at_utc = serializers.DateTimeField()
    duration_minutes = serializers.ChoiceField(choices=[30, 60])


class AdminStudentProfileSerializer(StudentProfileSerializer):
    class Meta(StudentProfileSerializer.Meta):
        read_only_fields = []
