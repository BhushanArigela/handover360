from rest_framework import viewsets
from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.decorators import action
from django.db.models import Count
from django.shortcuts import get_object_or_404
from django.db import transaction


from .models import Template, Floor, Room, RoomLibrary, SectionLibrary, Section, Item, ItemLibrary
from .serializers import TemplateSerializer, FloorSerializer, RoomSerializer, RoomLibrarySerializer, SectionLibrarySerializer, SectionSerializer, ItemSerializer, TemplateListSerializer, ItemLibrarySerializer, TemplateStructureSerializer


class TemplateViewSet(viewsets.ModelViewSet):

    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = (
            Template.objects.filter(is_active=True)
            .annotate(
                floor_count=Count("floors", distinct=True),
                room_count=Count("floors__rooms", distinct=True),
                section_count=Count("floors__rooms__sections", distinct=True),
                item_count=Count("floors__rooms__sections__items", distinct=True),
            )
        )

        property_type = self.request.query_params.get("property_type")
        if property_type:
            queryset = queryset.filter(property_type=property_type)

        published = self.request.query_params.get("published")
        if published is not None:
            queryset = queryset.filter(
                published=published.lower() == "true"
            )

        return queryset.order_by("-created_at")
    
    def destroy(self, request, *args, **kwargs):
        template = self.get_object()

        template.is_active = False
        template.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def get_serializer_class(self):
        if self.action == "list":
            return TemplateListSerializer

        return TemplateSerializer

    @action(detail=True, methods=["post"])
    def publish(self, request, pk=None):
        template = self.get_object()

        # Validation
        if not template.floors.exists():
            return Response(
                {
                    "detail": "Template must have at least one floor before publishing."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        template.published = True
        template.save(update_fields=["published"])

        template = (
            Template.objects
            .annotate(
                floor_count=Count("floors", distinct=True),
                room_count=Count("floors__rooms", distinct=True),
                section_count=Count("floors__rooms__sections", distinct=True),
                item_count=Count("floors__rooms__sections__items", distinct=True),
            )
            .get(pk=template.pk)
        )

        serializer = TemplateListSerializer(template)
        return Response(serializer.data)

    @action(detail=True, methods=["post"])
    def unpublish(self, request, pk=None):
        template = self.get_object()

        template.published = False
        template.save(update_fields=["published"])

        serializer = self.get_serializer(template)

        return Response(serializer.data, status=status.HTTP_200_OK)

class GenerateFloorView(APIView):

    def post(self, request, template_id):

        count = int(request.data.get("count", 0))

        if count <= 0:
            return Response(
                {"error": "Invalid floor count"},
                status=status.HTTP_400_BAD_REQUEST
            )

        template = Template.objects.get(id=template_id)

        # Remove old floors
        Floor.objects.filter(template=template).delete()

        created = []

        names = [
            ("Ground Floor", "GF"),
            ("First Floor", "F1"),
            ("Second Floor", "F2"),
            ("Third Floor", "F3"),
        ]

        for i in range(count):

            if i < len(names):
                floor_name, code = names[i]
            else:
                floor_name = f"Floor {i}"
                code = f"F{i}"

            floor = Floor.objects.create(
                template=template,
                name=floor_name,
                code=code,
                display_order=i + 1
            )

            created.append(floor)

        serializer = FloorSerializer(created, many=True)

        return Response(serializer.data)


class RoomLibraryViewSet(viewsets.ModelViewSet):

    queryset = RoomLibrary.objects.all()

    serializer_class = RoomLibrarySerializer   

class AddRoomToFloorView(APIView):

     def post(self, request, floor_id):

        floor = get_object_or_404(Floor, pk=floor_id)

        serializer = RoomSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        room_name = serializer.validated_data["name"].strip()

        if Room.objects.filter(
            floor=floor,
            name__iexact=room_name,
        ).exists():
            return Response(
                {"detail": "Room already exists on this floor."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        room = Room.objects.create(
            floor=floor,
            name=room_name,
            description=serializer.validated_data.get(
                "description",
                "",
            ),
            order=serializer.validated_data.get(
                "order",
                0,
            ),
        )

        return Response(
            RoomSerializer(room).data,
            status=status.HTTP_201_CREATED,
        )

class RoomViewSet(viewsets.ModelViewSet):

    queryset = Room.objects.all()

    serializer_class = RoomSerializer    

class SectionLibraryViewSet(viewsets.ModelViewSet):

    serializer_class = SectionLibrarySerializer

    permission_classes = [AllowAny]

    queryset = SectionLibrary.objects.filter(
        is_active=True
    ).order_by("name")

    def destroy(self, request, *args, **kwargs):

        section = self.get_object()

        section.is_active = False

        section.save(update_fields=["is_active"])

        return Response(status=status.HTTP_204_NO_CONTENT)   

class AddSectionToRoomView(APIView):

    def get(self, request, room_id):

        sections = Section.objects.filter(
            room_id=room_id
        ).order_by("order")

        serializer = SectionSerializer(
            sections,
            many=True
        )

        return Response(serializer.data)

    def post(self, request, room_id):

        room = get_object_or_404(Room, pk=room_id)

        serializer = SectionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        section_name = serializer.validated_data["name"].strip()

        if Section.objects.filter(
            room=room,
            name__iexact=section_name,
        ).exists():
            return Response(
                {"detail": "Section already exists in this room."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        section = Section.objects.create(
            room=room,
            name=section_name,
            order=serializer.validated_data.get(
                "order",
                0,
            ),
        )

        return Response(
            SectionSerializer(section).data,
            status=status.HTTP_201_CREATED,
        )   

class SectionViewSet(viewsets.ModelViewSet):

    queryset = Section.objects.all()

    serializer_class = SectionSerializer    

class ItemViewSet(viewsets.ModelViewSet):

    queryset = Item.objects.all()

    serializer_class = ItemSerializer    

class SectionItemsView(APIView):

    def get(self, request, section_id):

        items = Item.objects.filter(section_id=section_id)

        serializer = ItemSerializer(items, many=True)

        return Response(serializer.data)

class AddItemToSectionView(APIView):

    def post(self, request, section_id):

        section = Section.objects.get(pk=section_id)

        serializer = ItemSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        item = Item.objects.create(
            section=section,
            name=serializer.validated_data["name"],
            description=serializer.validated_data.get(
                "description",
                ""
            ),
            is_custom=serializer.validated_data.get(
                "is_custom",
                False,
            ),
            order=serializer.validated_data.get(
                "order",
                0,
            ),
        )

        return Response(
            ItemSerializer(item).data,
            status=status.HTTP_201_CREATED,
        ) 

class SeedDefaultItemsView(APIView):

    DEFAULT_ITEMS = {
        "Electrical": [
            "Switches",
            "Sockets",
            "Lights",
            "Distribution Board",
        ],
        "Plumbing": [
            "Pipes",
            "Wash Basin",
            "WC",
            "Tap",
        ],
        "Flooring": [
            "Tiles",
            "Level",
            "Grouting",
        ],
        "Walls": [
            "Cracks",
            "Plaster",
            "Dampness",
        ],
    }

    def post(self, request, section_id):

        section = Section.objects.get(pk=section_id)

        if Item.objects.filter(section=section).exists():
            serializer = ItemSerializer(
                Item.objects.filter(section=section),
                many=True
            )
            return Response(serializer.data)

        names = self.DEFAULT_ITEMS.get(
            section.name,
            ["General Inspection"]
        )

        created = []

        for index, name in enumerate(names):

            created.append(
                Item.objects.create(
                    section=section,
                    name=name,
                    order=index,
                    is_custom=False,
                )
            )

        serializer = ItemSerializer(created, many=True)

        return Response(serializer.data)    

class ItemLibraryViewSet(viewsets.ModelViewSet):

    queryset = ItemLibrary.objects.filter(
        is_active=True
    )

    serializer_class = ItemLibrarySerializer       

class RoomSectionsView(APIView):

    def get(self, request, room_id):
        sections = Section.objects.filter(
            room_id=room_id
        ).order_by("order")

        serializer = SectionSerializer(
            sections,
            many=True
        )

        return Response(serializer.data)   

class TemplateStructureView(APIView):

    def get(self, request, template_id):

        template = get_object_or_404(
            Template,
            pk=template_id,
        )

        serializer = TemplateStructureSerializer(
            template
        )

        return Response(serializer.data)   

class DuplicateTemplateView(APIView):

    @transaction.atomic
    def post(self, request, pk):

        source = get_object_or_404(
            Template,
            pk=pk,
            is_active=True,
        )

        base_name = f"{source.name} - Copy"
        new_name = base_name
        counter = 2

        while Template.objects.filter(
            name=new_name,
            is_active=True,
        ).exists():
            new_name = f"{base_name} ({counter})"
            counter += 1

        copy_template = Template.objects.create(
            name=new_name,
            property_type=source.property_type,
            description=source.description,
            published=False,
        )

        for floor in source.floors.all().order_by("display_order"):

            new_floor = Floor.objects.create(
                template=copy_template,
                name=floor.name,
                code=floor.code,
                display_order=floor.display_order,
            )

            for room in floor.rooms.all().order_by("order"):

                new_room = Room.objects.create(
                    floor=new_floor,
                    name=room.name,
                    description=room.description,
                    order=room.order,
                )

                for section in room.sections.all().order_by("order"):

                    new_section = Section.objects.create(
                        room=new_room,
                        name=section.name,
                        order=section.order,
                    )

                    for item in section.items.all().order_by("order"):

                        Item.objects.create(
                            section=new_section,
                            name=item.name,
                            description=item.description,
                            is_custom=item.is_custom,
                            order=item.order,
                        )

        serializer = TemplateSerializer(copy_template)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )          