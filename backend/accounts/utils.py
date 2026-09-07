from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string


def send_welcome_email(
    name,
    email,
    username,
    password
):

    html_content = render_to_string(
        "emails/welcome_email.html",
        {
            "name": name,
            "email": email,
            "username": username,
            "password": password
        }
    )

    msg = EmailMultiAlternatives(
        subject="Welcome to HavEnsure",
        body="Your account has been created.",
        to=[email]
    )

    msg.attach_alternative(
        html_content,
        "text/html"
    )

    msg.send()