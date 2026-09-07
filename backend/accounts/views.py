from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate, get_user_model

from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.generics import ListAPIView
from django.db import transaction
from django.utils import timezone
from django.db.models import Case, IntegerField, When
from .services import send_whatsapp_otp
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.decorators import parser_classes
from .models import User, OTPVerification, AgentDocument
from .serializers import UserSerializer, LoginSerializer, AgentDocumentSerializer
from accounts.utils import send_welcome_email

from enquiries.models import EnquiryAssignment
import os
from rest_framework.exceptions import ValidationError
from notifications.services import create_notification

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

ALLOWED_EXTENSIONS = [
    ".pdf",
    ".doc",
    ".docx",
]

User = get_user_model()

@api_view(["POST"])
def login_user(request):

    serializer = LoginSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            {"message": "Invalid data", "errors": serializer.errors},
            status=400
        )

    email = serializer.validated_data["email"]
    password = serializer.validated_data["password"]

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({"message": "User not found"}, status=404)

    # 🔥 IMPORTANT FIX: use check_password instead of authenticate
    if not user.check_password(password):
        return Response({"message": "Invalid password"}, status=401)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        "token": token.key,
        "user": {
            "id": str(user.user_id),
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "role": user.role
        }
    })


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def create_user(request):
    serializer = UserSerializer(data=request.data)

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    role = request.data.get("role")

    user = serializer.save(created_by=request.user if request.user.is_authenticated else None)

    raw_password = None

    if role in ["buyer", "builder"]:
        raw_password = request.data.get("password")

        if not raw_password:
            return Response(
                {"message": "Password is required for buyer/builder"},
                status=400
            )

        user.set_password(raw_password)
        user.generated_password = raw_password

    else:
        # agent / engineer → auto-generate
        import random
        raw_password = str(random.randint(100000, 999999))

        user.set_password(raw_password)
        user.generated_password = raw_password

    user.save()
    admins = User.objects.filter(role="admin")

    for admin in admins:
        create_notification(
            recipient=admin,
            title="New User Registered",
            message=f"{user.name} has been registered as {user.role.title()}.",
            notification_type="general",
            reference_id=user.user_id,
        )

    create_notification(
        recipient=user,
        title="Welcome to HavEnsure",
        message="Your account has been created successfully.",
        notification_type="general",
    )    
    # Save agent documents (optional)
    if user.role == "field_engineer":
        document_names = request.data.getlist("new_document_names")
        files = request.FILES.getlist("new_documents")

        for name, file in zip(document_names, files):
            if not name and not file:
                continue

            if not name:
                raise ValidationError("Document name is required.")

            if not file:
                raise ValidationError(f"Document '{name}' has no file.")

            ext = os.path.splitext(file.name)[1].lower()

            if ext not in ALLOWED_EXTENSIONS:
                raise ValidationError(
                    f"{file.name} is not a supported document."
                )

            if file.size > MAX_FILE_SIZE:
                raise ValidationError(
                    f"{file.name} exceeds the 5 MB limit."
                )

            AgentDocument.objects.create(
                agent=user,
                document_name=name,
                file=file
            )
         # otp = str(random.randint(100000,999999))

            # OTPVerification.objects.create(
            #     phone=user.phone,
            #     otp=otp,
            #     expires_at=timezone.now()+timedelta(minutes=5)
            # )

            # send_whatsapp_otp(
            #     user.phone,
            #     otp
            # )
        # try:
        #     send_welcome_email(
        #         name=user.name,
        #         email=user.email,
        #         username=user.username,
        #         password=user.generated_password
        #     )
        # except Exception as e:
        #     print("Email Error:", str(e))

        # return Response({
        #     "message":"OTP sent successfully"
        # })
    return Response(
        {
            "message": "User created successfully",
            "data": {
                "user_id": user.user_id,
                "username": user.username,
                "password": user.generated_password
            }
        },
        status=status.HTTP_201_CREATED
    )

@api_view(["PUT", "PATCH"])
@permission_classes([IsAuthenticated])
@parser_classes([MultiPartParser, FormParser])
@transaction.atomic
def update_user(request, user_id):
    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return Response(
            {"message": "User not found"},
            status=status.HTTP_404_NOT_FOUND
        )

    serializer = UserSerializer(
        user,
        data=request.data,
        partial=True
    )

    if not serializer.is_valid():
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    user = serializer.save()
    create_notification(
        recipient=user,
        title="Profile Updated",
        message="Your profile details have been updated.",
        notification_type="general",
    )
    if user.role == "field_engineer":

        active_document_ids = []

        existing_ids = request.data.getlist("document_ids")
        existing_names = request.data.getlist("document_names")

        for doc_id, name in zip(existing_ids, existing_names):

            if not doc_id:
                continue

            try:
                document = AgentDocument.objects.get(
                    id=doc_id,
                    agent=user,
                    is_deleted=False
                )

                document.document_name = name
                document.save()

                active_document_ids.append(document.id)

            except AgentDocument.DoesNotExist:
                pass

        new_names = request.data.getlist("new_document_names")
        new_files = request.FILES.getlist("new_documents")

        for name, file in zip(new_names, new_files):

            if not name and not file:
                continue

            if not name:
                raise ValidationError("Document name is required.")

            if not file:
                raise ValidationError(f"Document '{name}' has no file.")

            ext = os.path.splitext(file.name)[1].lower()

            if ext not in ALLOWED_EXTENSIONS:
                raise ValidationError(
                    f"{file.name} is not a supported document."
                )

            if file.size > MAX_FILE_SIZE:
                raise ValidationError(
                    f"{file.name} exceeds the 5 MB limit."
                )

            document = AgentDocument.objects.create(
                agent=user,
                document_name=name,
                file=file
            )

            active_document_ids.append(document.id)

        AgentDocument.objects.filter(
            agent=user,
            is_deleted=False
        ).exclude(
            id__in=active_document_ids
        ).update(
            is_deleted=True,
            deleted_at=timezone.now()
        )

    return Response(
        {
            "message": "User updated successfully",
            "data": UserSerializer(user).data
        },
        status=status.HTTP_200_OK
    )

class VerifyOTP(APIView):

    authentication_classes=[]
    permission_classes=[]

    def post(self,request):

        phone=request.data["phone"]
        otp=request.data["otp"]

        try:

            verification=OTPVerification.objects.get(
                phone=phone,
                otp=otp,
                verified=False
            )

        except OTPVerification.DoesNotExist:

            return Response(
                {
                    "message":"Invalid OTP"
                },
                status=400
            )

        if verification.is_expired():

            return Response(
                {
                    "message":"OTP expired"
                },
                status=400
            )

        verification.verified=True
        verification.save()

        user=User.objects.get(phone=phone)

        user.is_active=True
        user.save()

        admins = User.objects.filter(role="admin")

        for admin in admins:
            create_notification(
                recipient=admin,
                title="New User Registered",
                message=f"{user.name} has been registered as {user.role.title()}.",
                notification_type="general",
                reference_id=user.user_id,
            )
            
        return Response({
            "message":"Verification successful"
        })

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.query_params.get("role")

        users = (
            User.objects.filter().exclude(role="admin")
            .exclude(role="super_admin")
            .annotate(
                active_priority=Case(
                    When(is_active=True, then=1),  # Active first
                    When(is_active=False, then=2),  # Inactive last
                    output_field=IntegerField(),
                )
            )
            .order_by("active_priority", "-created_at")
        )

        if role:
            users = (
                User.objects.filter(role=role,created_by=request.user)
                .annotate(
                    active_priority=Case(
                        When(is_active=True, then=1),  # Active first
                        When(is_active=False, then=2),  # Inactive last
                        output_field=IntegerField(),
                    )
                )
                .order_by("active_priority", "-created_at")
            )
            

        serializer = UserSerializer(users, many=True)
        # print(serializer.data)
        data = []
        
        for user in users:
            item = {
                "user_id": str(user.user_id),
                "name": user.name,
                "email": user.email,
                "phone": user.phone,
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at,
            }
            
            if user.role == "field_engineer":
                item["preferred_location"] = user.preferred_location

                item["documents"] = AgentDocumentSerializer(
                    user.documents.filter(is_deleted=False),
                    many=True
                ).data
                assignments = EnquiryAssignment.objects.filter(
                    assigned_to=user,
                    role="field_engineer"
                )

                completed = assignments.filter(
                    enquiry__status__in=[
                        "inspection_done",
                        "under_review",
                        "certified",
                        "certificate_issued",
                    ]
                ).count()

                total = assignments.count()

                item["stats"] = {
                    "total": total,
                    "completed": completed,
                    "pending": total - completed,
                }

            elif user.role == "technical_auditor":

                assignments = EnquiryAssignment.objects.filter(
                    assigned_to=user,
                    role="technical_auditor"
                )

                assigned = assignments.count()

                certificates = assignments.filter(
                    enquiry__status__in=[
                        "certified",
                        "certificate_issued",
                    ]
                ).count()

                item["stats"] = {
                    "assigned": assigned,
                    "certs": certificates,
                    "avgRating": None,  # replace later when rating model exists
                }

            data.append(item)

        return Response(data)

class ToggleUserStatus(APIView):
    permission_classes = [IsAuthenticated]
    def patch(self, request, pk):
        user = User.objects.get(user_id=pk)
        user.is_active = not user.is_active
        user.updated_by = request.user 
        user.save()

        create_notification(
            recipient=user,
            title="Account Status Updated",
            message=(
                "Your account has been activated."
                if user.is_active
                else "Your account has been deactivated."
            ),
            notification_type="general",
        )
        return Response({"is_active": user.is_active})

