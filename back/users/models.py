from django.db import models
from django.contrib.auth.models import AbstractUser
from django.contrib.postgres.fields import ArrayField
from django.utils import timezone
from .managers import CustomUserManager


class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ("student", "student"),
        ("teacher", "teacher"),
        ("admin", "admin"),
    ]

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["full_name"]

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=255, blank=True)
    timezone = models.CharField(max_length=64, default="UTC")
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="student")

    objects = CustomUserManager()


class TeacherProfile(models.Model):
    CEFR_CHOICES = [
        ("A0", "A0"),
        ("A1", "A1"),
        ("A2", "A2"),
        ("B1", "B1"),
        ("B2", "B2"),
        ("C1", "C1"),
        ("C2", "C2"),
    ]

    TEACHING_TRACK_CHOICES = [
        ("art", "art"),
        ("cooking", "cooking"),
        ("business", "business"),
        ("engineering", "engineering"),
        ("general", "general"),
        ("other", "other"),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="teacher_profile")
    languages = ArrayField(models.CharField(max_length=50), default=list, blank=True)
    teaching_tracks = ArrayField(models.CharField(max_length=50, choices=TEACHING_TRACK_CHOICES), default=list, blank=True)
    levels_supported = ArrayField(models.CharField(max_length=2, choices=CEFR_CHOICES), default=list, blank=True)
    bio_short = models.TextField(blank=True)
    active = models.BooleanField(default=True)
    availability_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"TeacherProfile({self.user.email})"


class StudentProfile(models.Model):
    CEFR_CHOICES = [
        ("A0", "A0"),
        ("A1", "A1"),
        ("A2", "A2"),
        ("B1", "B1"),
        ("B2", "B2"),
        ("C1", "C1"),
        ("C2", "C2"),
    ]

    PREPARING_FOR_CHOICES = [
        ("college_admission", "college_admission"),
        ("current_college", "current_college"),
        ("job", "job"),
        ("exam", "exam"),
        ("other", "other"),
    ]

    TARGET_FIELD_CHOICES = [
        ("art", "art"),
        ("cooking", "cooking"),
        ("business", "business"),
        ("engineering", "engineering"),
        ("general", "general"),
        ("other", "other"),
    ]

    FOCUS_SKILLS_CHOICES = [
        ("spoken", "spoken"),
        ("listening", "listening"),
        ("writing", "writing"),
        ("reading", "reading"),
        ("pronunciation", "pronunciation"),
        ("grammar", "grammar"),
        ("vocabulary", "vocabulary"),
    ]

    LEARNING_STYLE_CHOICES = [
        ("structured_exercises", "structured_exercises"),
        ("conversation_heavy", "conversation_heavy"),
        ("homework_heavy", "homework_heavy"),
        ("exam_driven", "exam_driven"),
        ("project_based", "project_based"),
    ]

    HOMEWORK_PREFERENCE_CHOICES = [
        ("none", "none"),
        ("light", "light"),
        ("standard", "standard"),
        ("intensive", "intensive"),
    ]

    APPLICATION_STATUS_CHOICES = [
        ("draft", "draft"),
        ("submitted", "submitted"),
        ("onboarding_scheduled", "onboarding_scheduled"),
        ("matched", "matched"),
        ("active", "active"),
        ("paused", "paused"),
    ]

    SESSION_DURATION_CHOICES = [
        (30, "30"),
        (60, "60"),
    ]

    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name="student_profile")

    cefr_level = models.CharField(max_length=2, choices=CEFR_CHOICES, blank=True)
    preparing_for = models.CharField(max_length=50, choices=PREPARING_FOR_CHOICES, blank=True)
    target_field = models.CharField(max_length=50, choices=TARGET_FIELD_CHOICES, blank=True)
    target_field_other_text = models.CharField(max_length=255, blank=True)
    target_start_date = models.DateField(null=True, blank=True)
    target_start_date_unknown = models.BooleanField(default=False)

    focus_skills = ArrayField(models.CharField(max_length=20, choices=FOCUS_SKILLS_CHOICES), default=list, blank=True)
    learning_style = ArrayField(models.CharField(max_length=30, choices=LEARNING_STYLE_CHOICES), default=list, blank=True)
    weekly_time_budget_hours = models.PositiveSmallIntegerField(null=True, blank=True)
    preferred_session_duration = models.PositiveSmallIntegerField(choices=SESSION_DURATION_CHOICES, null=True, blank=True)

    books_resources_text = models.TextField(blank=True)
    homework_preference = models.CharField(max_length=20, choices=HOMEWORK_PREFERENCE_CHOICES, blank=True)
    availability_notes = models.TextField(blank=True)
    goals_summary = models.TextField(blank=True)

    terms_accepted_at = models.DateTimeField(null=True, blank=True)
    privacy_accepted_at = models.DateTimeField(null=True, blank=True)

    application_status = models.CharField(max_length=30, choices=APPLICATION_STATUS_CHOICES, default="draft")
    submitted_at = models.DateTimeField(null=True, blank=True)
    matched_teacher = models.ForeignKey("TeacherProfile", null=True, blank=True, on_delete=models.SET_NULL)
    onboarding_notes = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"StudentProfile({self.user.email})"

    def completion_percent(self):
        required_values = [
            self.user.full_name,
            self.user.email,
            self.user.timezone,
            self.cefr_level,
            self.preparing_for,
            self.target_field,
            self.weekly_time_budget_hours,
            self.preferred_session_duration,
            self.books_resources_text,
            self.homework_preference,
            self.availability_notes,
            self.goals_summary,
            self.terms_accepted_at,
            self.privacy_accepted_at,
        ]

        if self.target_field == "other":
            required_values.append(self.target_field_other_text)

        if not (self.target_start_date or self.target_start_date_unknown):
            required_values.append(None)

        if not self.focus_skills:
            required_values.append(None)

        if not self.learning_style:
            required_values.append(None)

        total = len(required_values)
        completed = 0
        for value in required_values:
            if value is None:
                continue
            if isinstance(value, str) and not value.strip():
                continue
            completed += 1

        if total == 0:
            return 0
        return int((completed / total) * 100)

    def is_profile_complete(self):
        return self.completion_percent() == 100


class AvailabilityBlock(models.Model):
    DAY_OF_WEEK_CHOICES = [
        (0, "0"),
        (1, "1"),
        (2, "2"),
        (3, "3"),
        (4, "4"),
        (5, "5"),
        (6, "6"),
    ]

    SLOT_DURATION_CHOICES = [
        (30, "30"),
        (60, "60"),
    ]

    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name="availability_blocks")
    day_of_week = models.PositiveSmallIntegerField(choices=DAY_OF_WEEK_CHOICES)
    start_time = models.TimeField()
    end_time = models.TimeField()
    slot_duration = models.PositiveSmallIntegerField(choices=SLOT_DURATION_CHOICES, default=30)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"AvailabilityBlock({self.teacher.user.email}, {self.day_of_week})"


class Lesson(models.Model):
    STATUS_CHOICES = [
        ("requested", "requested"),
        ("proposed", "proposed"),
        ("confirmed", "confirmed"),
        ("canceled", "canceled"),
        ("completed", "completed"),
    ]

    REQUESTED_BY_ROLE_CHOICES = [
        ("student", "student"),
        ("teacher", "teacher"),
        ("admin", "admin"),
    ]

    DURATION_CHOICES = [
        (30, "30"),
        (60, "60"),
    ]

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name="student_lessons")
    teacher = models.ForeignKey(TeacherProfile, on_delete=models.CASCADE, related_name="teacher_lessons")
    starts_at_utc = models.DateTimeField()
    ends_at_utc = models.DateTimeField()
    duration_minutes = models.PositiveSmallIntegerField(choices=DURATION_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="requested")
    requested_by_role = models.CharField(max_length=20, choices=REQUESTED_BY_ROLE_CHOICES)
    meeting_url = models.URLField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    status_changed_at = models.DateTimeField(default=timezone.now)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.pk:
            previous_status = Lesson.objects.filter(pk=self.pk).values_list("status", flat=True).first()
            if previous_status != self.status:
                self.status_changed_at = timezone.now()
        else:
            self.status_changed_at = timezone.now()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Lesson({self.student.user.email}, {self.teacher.user.email}, {self.status})"


class LessonEventLog(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE, related_name="events")
    actor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="lesson_events")
    event_type = models.CharField(max_length=30)
    payload_json = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"LessonEventLog({self.lesson_id}, {self.event_type})"
