from django.db import models
from django.contrib.auth import get_user_model
User = get_user_model()

class Template(models.Model):
    PROPERTY_TYPES = (
        ("residential_apartment", "Residential Apartment"),
        ("independent_villa", "Independent Villa"),
        ("independent_house", "Independent House"),
        ("row_house", "Row House"),
        ("commercial_building", "Commercial Building"),
        ("industrial_structure", "Industrial Structure"),
        ("other", "Other"),
    )
    name = models.CharField(max_length=255)

    property_type = models.CharField(
        max_length=50,
        choices=PROPERTY_TYPES
    )

    description = models.TextField(blank=True)

    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="master_template_created")
    updated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="master_template_updated")
    is_active = models.BooleanField( default=True)    
    is_deleted = models.BooleanField( default=False)
    published = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = "master_templates"
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class Floor(models.Model):

    template = models.ForeignKey(
        Template,
        on_delete=models.CASCADE,
        related_name="floors"
    )

    name = models.CharField(max_length=100)

    code = models.CharField(max_length=20)
    
    display_order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField( default=True)    
    is_deleted = models.BooleanField( default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)
    class Meta:
        db_table = "master_floors"
        ordering = ["display_order"]

    def __str__(self):
        return self.name    

class RoomLibrary(models.Model):

    name = models.CharField(max_length=100, unique=True)

    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "master_room_library"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Room(models.Model):

    floor = models.ForeignKey(
        Floor,
        on_delete=models.CASCADE,
        related_name="rooms"
    )

    name = models.CharField(max_length=100)

    description = models.TextField(blank=True)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "master_rooms"
        ordering = ["order"]

    def __str__(self):
        return self.name    

class SectionLibrary(models.Model):

    name = models.CharField(max_length=100, unique=True)

    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "master_section_library"
        ordering = ["name"]

    def __str__(self):
        return self.name


class Section(models.Model):

    room = models.ForeignKey(
        Room,
        on_delete=models.CASCADE,
        related_name="sections"
    )

    name = models.CharField(max_length=100)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "master_sections"
        ordering = ["order"]

    def __str__(self):
        return self.name  

class Item(models.Model):

    section = models.ForeignKey(
        Section,
        on_delete=models.CASCADE,
        related_name="items"
    )

    name = models.CharField(max_length=255)

    description = models.TextField(blank=True)

    is_custom = models.BooleanField(default=False)

    order = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = "master_items"
        ordering = ["order"]

    def __str__(self):
        return self.name      

class ItemLibrary(models.Model):

    name = models.CharField(max_length=200)

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    def __str__(self):
        return self.name    