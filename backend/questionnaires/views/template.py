# views/template.py

from rest_framework.decorators import api_view
from rest_framework.response import Response

from questionnaires.services.resolver import resolve_template

@api_view(["GET"])
def resolve_template_view(request, template_id):
    data = resolve_template(template_id)
    return Response(data)
    