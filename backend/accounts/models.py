from django.contrib.auth.models import AbstractUser
import uuid
from django.db import models
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):

    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('admin', 'Admin'),
        ('field_engineer', 'Field Engineer'),
        ('builder', 'Builder'),
        ('buyer', 'Buyer'),
        ('technical_auditor', 'Technical Auditor'),
    )

    user_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    username = models.CharField(max_length=15, unique=True,blank=False, null=False)
    name = models.CharField(max_length=100, blank=False, null=False)
    email = models.EmailField(unique=True,blank=False, null=False)
    phone = models.CharField(max_length=20, blank=False, null=False)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='field_engineer')
    address = models.TextField(blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(max_length=100, blank=True, null=True)
    country = models.CharField(max_length=100, blank=True, null=True)
    preferred_location = models.CharField(max_length=255, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True) # to be false inially for whatsapp
    created_at = models.DateTimeField(auto_now_add=True)

    created_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='created_users'
    )

    updated_at = models.DateTimeField(auto_now=True)

    updated_by = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='updated_users'
    )

class AgentDocument(models.Model):
    agent = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="documents"
    )

    document_name = models.CharField(max_length=200)

    file = models.FileField(
        upload_to="agent_documents/"
    )

    is_deleted = models.BooleanField(default=False)
    deleted_at = models.DateTimeField(blank=True, null=True)

    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.document_name
    

class OTPVerification(models.Model):
    phone = models.CharField(max_length=15)
    otp = models.CharField(max_length=6)
    expires_at = models.DateTimeField()
    verified = models.BooleanField(default=False)

    def is_expired(self):
        return timezone.now() > self.expires_at