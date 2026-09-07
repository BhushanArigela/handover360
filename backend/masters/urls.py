from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import TemplateViewSet, GenerateFloorView, RoomLibraryViewSet, RoomViewSet, AddRoomToFloorView, SectionLibraryViewSet, SectionViewSet, AddSectionToRoomView, ItemViewSet, SectionItemsView, AddItemToSectionView, SeedDefaultItemsView, ItemLibraryViewSet, RoomSectionsView, TemplateStructureView, DuplicateTemplateView        

from django.urls import path

router = DefaultRouter()

# Template
router.register(
    "templates",
    TemplateViewSet,
    basename="templates",
)

# Room Library
router.register(
    "room-library",
    RoomLibraryViewSet,
    basename="room-library",
)

# Rooms
router.register(
    "rooms",
    RoomViewSet,
    basename="rooms",
)

# Section Library
router.register(
    "section-library",
    SectionLibraryViewSet,
    basename="section-library",
)

# Sections
router.register(
    "sections",
    SectionViewSet,
    basename="sections",
)

# Items
router.register(
    "items",
    ItemViewSet,
    basename="items",
)

router.register(
    "item-library",
    ItemLibraryViewSet,
    basename="item-library",
)
urlpatterns = router.urls + [

    # Step 2 - Floors
    path(
        "templates/<int:template_id>/generate-floors/",
        GenerateFloorView.as_view(),
        name="generate-floors",
    ),

    # Step 3 - Rooms
    path(
        "floors/<int:floor_id>/rooms/",
        AddRoomToFloorView.as_view(),
        name="add-room",
    ),

    # Step 5 - Sections
    path(
        "rooms/<int:room_id>/sections/",
        AddSectionToRoomView.as_view(),
        name="add-section",
    ),

    # Step 6 - Items
    path(
        "sections/<int:section_id>/items/",
        SectionItemsView.as_view(),
        name="section-items",
    ),

    path(
        "sections/<int:section_id>/items/add/",
        AddItemToSectionView.as_view(),
        name="add-item",
    ),

    path(
        "sections/<int:section_id>/seed-items/",
        SeedDefaultItemsView.as_view(),
        name="seed-items",
    ),

    path(
        "rooms/<int:room_id>/sections/",
        RoomSectionsView.as_view(),
        name="room-sections",
    ),
    path(
        "templates/<int:template_id>/structure/",
        TemplateStructureView.as_view(),
        name="template-structure",
    ),

    path(
        "templates/<int:pk>/duplicate/",
        DuplicateTemplateView.as_view(),
    ),
]