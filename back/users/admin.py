from django.contrib import admin
from .models import (
    CustomUser,
    StudentProfile,
    TeacherProfile,
    AvailabilityBlock,
    Lesson,
    LessonEventLog,
)


@admin.register(CustomUser)
class CustomUserAdmin(admin.ModelAdmin):
    pass


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    pass


@admin.register(TeacherProfile)
class TeacherProfileAdmin(admin.ModelAdmin):
    pass


@admin.register(AvailabilityBlock)
class AvailabilityBlockAdmin(admin.ModelAdmin):
    pass


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    pass


@admin.register(LessonEventLog)
class LessonEventLogAdmin(admin.ModelAdmin):
    pass
