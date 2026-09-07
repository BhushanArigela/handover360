import requests
from django.conf import settings


def send_whatsapp_otp(phone, otp):

    url = f"https://graph.facebook.com/v23.0/{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"

    headers = {
        "Authorization": f"Bearer {settings.WHATSAPP_TOKEN}",
        "Content-Type": "application/json",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "template",
        "template": {
            "name": "otp_verification",
            "language": {
                "code": "en"
            },
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {
                            "type": "text",
                            "text": otp
                        }
                    ]
                }
            ]
        }
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers
    )

    return response.json()