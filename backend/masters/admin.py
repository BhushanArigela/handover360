from django.contrib import admin

from .models import (
    Template, Floor, RoomLibrary, Room, SectionLibrary, Section, Item

)

@admin.action(description="Restore selected templates")
def restore_templates(modeladmin, request, queryset):
    queryset.update(is_active=True)

@admin.register(Template)
class TemplateAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "property_type",
        "published",
        "is_active",
        "created_by",
        "created_at",
    )

    list_filter = (
        "property_type",
        "published",
        "is_active",
    )

    search_fields = (
        "name",
        "description",
    )

    actions = [restore_templates]
    
    ordering = ("-created_at",)


@admin.register(Floor)
class FloorAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "template",
        "name",
        "code",
        "display_order",
    )

    list_filter = (
        "template",
    )

    search_fields = (
        "name",
        "code",
    )

    ordering = (
        "template",
        "display_order",
    )


@admin.register(RoomLibrary)
class RoomLibraryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "created_at",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


@admin.register(Room)
class RoomAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "floor",
        "order",
    )

    list_filter = (
        "floor",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "floor",
        "order",
    )

@admin.register(SectionLibrary)
class SectionLibraryAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "created_at",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "name",
    )


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "room",
        "order",
    )

    list_filter = (
        "room",
    )

    search_fields = (
        "name",
    )

    ordering = (
        "room",
        "order",
    )

@admin.register(Item)
class ItemAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "section",
        "is_custom",
        "order",
    )

    list_filter = (
        "section",
        "is_custom",
    )

    search_fields = (
        "name",
        "description",
    )

    ordering = (
        "section",
        "order",
    )    