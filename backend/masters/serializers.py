from rest_framework import serializers
from .models import Template, Floor, RoomLibrary, Room, SectionLibrary, Section, Item, ItemLibrary


class TemplateSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Template
        fields = "__all__"
        read_only_fields = (
            "id",
            "published",
            "created_at",
            "updated_at",
        )

  

class RoomLibrarySerializer(serializers.ModelSerializer):

    class Meta:
        model = RoomLibrary
        fields = "__all__"




class SectionLibrarySerializer(serializers.ModelSerializer):

    class Meta:
        model = SectionLibrary
        fields = "__all__"

class ItemSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Item
        fields = "__all__"   
        read_only_fields = ["section"]    

class SectionSerializer(serializers.ModelSerializer):
    items = ItemSerializer(
        many=True,
        read_only=True,
    )
    class Meta:
        model = Section
        fields = [
            "id",
            "room",
            "name",
            "order",
            "items"
        ]
        read_only_fields = ["room"]

class RoomSerializer(serializers.ModelSerializer):
    sections = SectionSerializer(
        many=True,
        read_only=True,
    )
    class Meta:
        model = Room
        exclude = ()
        read_only_fields = ("floor",) 

class FloorSerializer(serializers.ModelSerializer):
    rooms = RoomSerializer(
        many=True,
        read_only=True,
    )
    class Meta:
        model = Floor
        fields = "__all__" 

class TemplateListSerializer(serializers.ModelSerializer):

    floor_count = serializers.IntegerField(read_only=True)
    room_count = serializers.IntegerField(read_only=True)
    section_count = serializers.IntegerField(read_only=True)
    item_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Template
        fields = [
            "id",
            "name",
            "property_type",
            "description",
            "published",
            "created_by",
            "created_at",
            "updated_at",
            "floor_count",
            "room_count",
            "section_count",
            "item_count",
        ]        

class ItemLibrarySerializer(serializers.ModelSerializer):

    class Meta:
        model = ItemLibrary
        fields = "__all__"    

class TemplateStructureSerializer(serializers.ModelSerializer):

    floors = FloorSerializer(
        many=True,
        read_only=True,
    )

    class Meta:
        model = Template
        fields = [
            "id",
            "name",
            "description",
            "property_type",
            "published",
            "floors",
        ]            