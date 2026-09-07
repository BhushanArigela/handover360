from rest_framework import serializers

from .models import (
    InspectionReport,
    InspectionItemResponse,
    InspectionMedia,
    InspectionActivity,
)

from masters.models import (
    Template,
    Floor,
    Room,
    Section,
    Item,
)

class InspectionMediaSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionMedia
        fields = [
            "id",
            "media_type",
            "file",
            "uploaded_at",
        ]

# class InspectionItemResponseSerializer(serializers.ModelSerializer):

#     media = InspectionMediaSerializer(
#         many=True,
#         read_only=True,
#     )

#     item_name = serializers.CharField(
#         source="item.name",
#         read_only=True,
#     )

#     class Meta:
#         model = InspectionItemResponse

#         fields = [
#             "id",
#             "item",
#             "item_name",
#             "status",
#             "severity",
#             "observation",
#             "rectification",
#             "score",
#             "media",
#             "created_at",
#             "updated_at",
#         ]


class ItemSerializer(serializers.ModelSerializer):

    response = serializers.SerializerMethodField()

    class Meta:
        model = Item

        fields = [
            "id",
            "name",
            "description",
            "response",
        ]

    def get_response(self, obj):

        report = self.context.get("report")

        if report is None:
            return None

        response = InspectionItemResponse.objects.filter(
            inspection_report=report,
            item=obj
        ).first()

        if response is None:
            return None

        return InspectionItemResponseSerializer(response).data

class SectionSerializer(serializers.ModelSerializer):

    items = serializers.SerializerMethodField()

    class Meta:
        model = Section

        fields = [
            "id",
            "name",
            "items",
        ]

    def get_items(self, obj):

        serializer = ItemSerializer(
            obj.items.all(),
            many=True,
            context=self.context,
        )

        return serializer.data

class RoomSerializer(serializers.ModelSerializer):

    sections = serializers.SerializerMethodField()

    class Meta:
        model = Room

        fields = [
            "id",
            "name",
            "sections",
        ]

    def get_sections(self, obj):

        serializer = SectionSerializer(
            obj.sections.all(),
            many=True,
            context=self.context,
        )

        return serializer.data

class FloorSerializer(serializers.ModelSerializer):

    rooms = serializers.SerializerMethodField()

    class Meta:
        model = Floor

        fields = [
            "id",
            "name",
            "rooms",
        ]

    def get_rooms(self, obj):

        serializer = RoomSerializer(
            obj.rooms.all(),
            many=True,
            context=self.context,
        )

        return serializer.data

class InspectionTemplateSerializer(serializers.ModelSerializer):

    floors = serializers.SerializerMethodField()

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

    def get_floors(self, obj):

        serializer = FloorSerializer(
            obj.floors.all(),
            many=True,
            context=self.context,
        )

        return serializer.data

class InspectionReportSerializer(serializers.ModelSerializer):

    class Meta:
        model = InspectionReport

        fields = [
            "id",
            "status",
            "overall_notes",
            "completion_percentage",
            "obtained_score",
            "maximum_score",
            "started_at",
            "submitted_at",
        ]
        
class InspectionItemResponseSerializer(serializers.ModelSerializer):
    photos = serializers.SerializerMethodField()
    videos = serializers.SerializerMethodField()

    review_status = serializers.SerializerMethodField()
    review_rating = serializers.SerializerMethodField()
    review_remarks = serializers.SerializerMethodField()
    critical_finding = serializers.SerializerMethodField()
    rectification_required = serializers.SerializerMethodField()
    target_date = serializers.SerializerMethodField()

    class Meta:
        model = InspectionItemResponse
        fields = [
            "id",
            "item",
            "status",
            "severity",
            "observation",
            "rectification",
            "score",

            "photos",
            "videos",

            "review_status",
            "review_rating",
            "review_remarks",
            "critical_finding",
            "rectification_required",
            "target_date",

            "created_at",
            "updated_at",
        ]

    def get_photos(self, obj):
        return [
            {
                "id": media.id,
                "file": media.file.url,
            }
            for media in obj.media.filter(media_type="photo")
        ]

    def get_videos(self, obj):
        return [
            {
                "id": media.id,
                "file": media.file.url,
            }
            for media in obj.media.filter(media_type="video")
        ]

    def get_review(self, obj):
        return obj.reviews.first()

    def get_review_status(self, obj):
        review = self.get_review(obj)
        return review.status if review else None

    def get_review_rating(self, obj):
        review = self.get_review(obj)
        return review.rating if review else None

    def get_review_remarks(self, obj):
        review = self.get_review(obj)
        return review.remarks if review else ""

    def get_critical_finding(self, obj):
        review = self.get_review(obj)
        return review.critical_finding if review else False

    def get_rectification_required(self, obj):
        review = self.get_review(obj)
        return review.rectification_required if review else False

    def get_target_date(self, obj):
        review = self.get_review(obj)
        return review.target_date if review else None
    
class InspectionDetailsSerializer(serializers.Serializer):

    inspection = serializers.SerializerMethodField()

    enquiry = serializers.SerializerMethodField()

    template = serializers.SerializerMethodField()

    progress = serializers.SerializerMethodField()

    def get_inspection(self, obj):

        report = obj

        return InspectionReportSerializer(report).data

    def get_enquiry(self, obj):

        enquiry = obj.enquiry

        return {
            "id": enquiry.enquiry_id,
            "enquiry_number": enquiry.enquiry_number,
            "property_address": enquiry.propertyAddress,
            "property_type": enquiry.propertyType,
            "client_name": enquiry.created_by.name,
        }

    def get_template(self, obj):

        serializer = InspectionTemplateSerializer(
            obj.template,
            context={
                "report": obj
            }
        )

        return serializer.data

    def get_progress(self, obj):

        total = Item.objects.filter(
            section__room__floor__template=obj.template
        ).count()

        completed = InspectionItemResponse.objects.filter(
            inspection_report=obj
        ).count()

        return {
            "total_items": total,
            "completed_items": completed,
            "percentage": (
                round(
                    completed * 100 / total,
                    2
                )
                if total
                else 0
            ),
        }     

                  