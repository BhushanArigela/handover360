from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, AgentDocument


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User

    list_display = (
        'user_id',
        'name',
        'username',
        'email',
        'role',
        'phone',
        'is_staff',
        'is_active'
    )

    fieldsets = UserAdmin.fieldsets + (
        ('Extra Fields', {
            'fields': (
                'role',
                'phone',
                'address',
                'city',
                'state',
                'country',
                'is_verified',
                'created_by',
                'updated_by',
            )
        }),
    )

    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Extra Fields', {
            'fields': (
                'role',
                'phone',
                'email',
            )
        }),
    )

@admin.register(AgentDocument)
class AgentDocumentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "agent",
        "document_name",
        "is_deleted",
        "uploaded_at",
    )

    list_filter = (
        "is_deleted",
        "uploaded_at",
    )

    search_fields = (
        "agent__name",
        "agent__email",
        "document_name",
    )

    autocomplete_fields = ("agent",)