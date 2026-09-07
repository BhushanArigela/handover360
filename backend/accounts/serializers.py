from django.utils.crypto import get_random_string
from rest_framework import serializers
from .models import User, AgentDocument
import re


# ✅ LOGIN SERIALIZER (must be separate)
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class AgentDocumentSerializer(serializers.ModelSerializer):
    file = serializers.SerializerMethodField()

    class Meta:
        model = AgentDocument
        fields = [
            "id",
            "document_name",
            "file",
        ]

    def get_file(self, obj):
        request = self.context.get("request")

        if obj.file:
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url

        return None 

class UserSerializer(serializers.ModelSerializer):


    username = serializers.CharField(read_only=True)
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True
    )
    documents = AgentDocumentSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = User
        fields = [
            'user_id',
            'username',
            'name',
            'email',
            'phone',
            'preferred_location',
            'role',
            'password',
            'documents', 
            'is_active',
            'created_by',
            'updated_by',
            'created_at'
        ]

    def get_documents(self, obj):
        docs = obj.documents.filter(is_deleted=False)
        return AgentDocumentSerializer(docs, many=True, context=self.context).data
    
    def generate_username(self, name):
        base_username = re.sub(r'[^a-zA-Z0-9]', '', name.lower())

        if len(base_username) < 5:
            base_username = base_username.ljust(5, '0')

        base_username = base_username[:15]

        username = base_username
        counter = 1

        while User.objects.filter(username=username).exists():
            suffix = str(counter)
            username = f"{base_username[:15-len(suffix)]}{suffix}"
            counter += 1

        return username

    def create(self, validated_data):
        from django.utils.crypto import get_random_string

        role = validated_data.get("role")

        username = self.generate_username(validated_data["name"])
        password = validated_data.pop("password", None)

        generated_password = None

        # =========================
        # ROLE BASED PASSWORD LOGIC
        # =========================

        if role in ["buyer", "builder"]:
            if not password:
                raise serializers.ValidationError({
                    "password": "Password is required for buyer/builder"
                })
        else:
            password = get_random_string(12)
            generated_password = password

        user = User(
            username=username,
            **validated_data
        )

        user.set_password(password)
        user.save()

        if generated_password:
            user.generated_password = generated_password
            user.save()

        return user

    def update(self, instance, validated_data):
        password = validated_data.pop("password", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if password:
            instance.set_password(password)

        instance.save()
        return instance
    
  