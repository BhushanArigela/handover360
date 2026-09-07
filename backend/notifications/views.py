from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Notification
from .serializers import NotificationSerializer


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by("-created_at")

    @action(detail=False, methods=["get"])
    def unread_count(self, request):

        count = Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).count()

        return Response({
            "count": count
        })

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):

        notification = self.get_object()

        notification.is_read = True
        notification.save(update_fields=["is_read"])

        return Response({
            "message": "Notification marked as read."
        })

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):

        Notification.objects.filter(
            recipient=request.user,
            is_read=False,
        ).update(is_read=True)

        return Response({
            "message": "All notifications marked as read."
        })