from .models import Notification


def create_notification(
    recipient,
    title,
    message,
    notification_type="general",
    reference_id=None,
):
    """
    Creates a notification for a user.
    """

    return Notification.objects.create(
        recipient=recipient,
        title=title,
        message=message,
        notification_type=notification_type,
        reference_id=reference_id,
    )