from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0002_alter_customuser_managers"),
    ]

    operations = [
        migrations.AddField(
            model_name="customuser",
            name="full_name",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="customuser",
            name="role",
            field=models.CharField(choices=[("student", "student"), ("teacher", "teacher"), ("admin", "admin")], default="student", max_length=20),
        ),
        migrations.AddField(
            model_name="customuser",
            name="timezone",
            field=models.CharField(default="UTC", max_length=64),
        ),
        migrations.CreateModel(
            name="TeacherProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("languages", django.contrib.postgres.fields.ArrayField(base_field=models.CharField(max_length=50), blank=True, default=list, size=None)),
                ("teaching_tracks", django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[("art", "art"), ("cooking", "cooking"), ("business", "business"), ("engineering", "engineering"), ("general", "general"), ("other", "other")], max_length=50), blank=True, default=list, size=None)),
                ("levels_supported", django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[("A0", "A0"), ("A1", "A1"), ("A2", "A2"), ("B1", "B1"), ("B2", "B2"), ("C1", "C1"), ("C2", "C2")], max_length=2), blank=True, default=list, size=None)),
                ("bio_short", models.TextField(blank=True)),
                ("active", models.BooleanField(default=True)),
                ("availability_notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="teacher_profile", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="StudentProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("cefr_level", models.CharField(blank=True, choices=[("A0", "A0"), ("A1", "A1"), ("A2", "A2"), ("B1", "B1"), ("B2", "B2"), ("C1", "C1"), ("C2", "C2")], max_length=2)),
                ("preparing_for", models.CharField(blank=True, choices=[("college_admission", "college_admission"), ("current_college", "current_college"), ("job", "job"), ("exam", "exam"), ("other", "other")], max_length=50)),
                ("target_field", models.CharField(blank=True, choices=[("art", "art"), ("cooking", "cooking"), ("business", "business"), ("engineering", "engineering"), ("general", "general"), ("other", "other")], max_length=50)),
                ("target_field_other_text", models.CharField(blank=True, max_length=255)),
                ("target_start_date", models.DateField(blank=True, null=True)),
                ("target_start_date_unknown", models.BooleanField(default=False)),
                ("focus_skills", django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[("spoken", "spoken"), ("listening", "listening"), ("writing", "writing"), ("reading", "reading"), ("pronunciation", "pronunciation"), ("grammar", "grammar"), ("vocabulary", "vocabulary")], max_length=20), blank=True, default=list, size=None)),
                ("learning_style", django.contrib.postgres.fields.ArrayField(base_field=models.CharField(choices=[("structured_exercises", "structured_exercises"), ("conversation_heavy", "conversation_heavy"), ("homework_heavy", "homework_heavy"), ("exam_driven", "exam_driven"), ("project_based", "project_based")], max_length=30), blank=True, default=list, size=None)),
                ("weekly_time_budget_hours", models.PositiveSmallIntegerField(blank=True, null=True)),
                ("preferred_session_duration", models.PositiveSmallIntegerField(blank=True, choices=[(30, "30"), (60, "60")], null=True)),
                ("books_resources_text", models.TextField(blank=True)),
                ("homework_preference", models.CharField(blank=True, choices=[("none", "none"), ("light", "light"), ("standard", "standard"), ("intensive", "intensive")], max_length=20)),
                ("availability_notes", models.TextField(blank=True)),
                ("goals_summary", models.TextField(blank=True)),
                ("terms_accepted_at", models.DateTimeField(blank=True, null=True)),
                ("privacy_accepted_at", models.DateTimeField(blank=True, null=True)),
                ("application_status", models.CharField(choices=[("draft", "draft"), ("submitted", "submitted"), ("onboarding_scheduled", "onboarding_scheduled"), ("matched", "matched"), ("active", "active"), ("paused", "paused")], default="draft", max_length=30)),
                ("submitted_at", models.DateTimeField(blank=True, null=True)),
                ("onboarding_notes", models.TextField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("matched_teacher", models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to="users.teacherprofile")),
                ("user", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name="student_profile", to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name="AvailabilityBlock",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("day_of_week", models.PositiveSmallIntegerField(choices=[(0, "0"), (1, "1"), (2, "2"), (3, "3"), (4, "4"), (5, "5"), (6, "6")])),
                ("start_time", models.TimeField()),
                ("end_time", models.TimeField()),
                ("slot_duration", models.PositiveSmallIntegerField(choices=[(30, "30"), (60, "60")], default=30)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("teacher", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="availability_blocks", to="users.teacherprofile")),
            ],
        ),
        migrations.CreateModel(
            name="Lesson",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("starts_at_utc", models.DateTimeField()),
                ("ends_at_utc", models.DateTimeField()),
                ("duration_minutes", models.PositiveSmallIntegerField(choices=[(30, "30"), (60, "60")])),
                ("status", models.CharField(choices=[("requested", "requested"), ("proposed", "proposed"), ("confirmed", "confirmed"), ("canceled", "canceled"), ("completed", "completed")], default="requested", max_length=20)),
                ("requested_by_role", models.CharField(choices=[("student", "student"), ("teacher", "teacher"), ("admin", "admin")], max_length=20)),
                ("meeting_url", models.URLField(blank=True, null=True)),
                ("notes", models.TextField(blank=True, null=True)),
                ("status_changed_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("student", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="student_lessons", to="users.studentprofile")),
                ("teacher", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="teacher_lessons", to="users.teacherprofile")),
            ],
        ),
        migrations.CreateModel(
            name="LessonEventLog",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event_type", models.CharField(max_length=30)),
                ("payload_json", models.JSONField(blank=True, default=dict)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("actor", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="lesson_events", to=settings.AUTH_USER_MODEL)),
                ("lesson", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="events", to="users.lesson")),
            ],
        ),
    ]
