# services/resolver.py

from questionnaires.models.template import Template
from questionnaires.models.template_question import TemplateQuestion

def resolve_template(template_id):

    template = Template.objects.get(template_id=template_id)

    categories = template.template_categories.filter(is_enabled=True).order_by("order")

    final_questions = []

    for tc in categories:
        category = tc.category

        questions = category.questions.filter(is_active=True)

        for q in questions:

            override = TemplateQuestion.objects.filter(
                template=template,
                question=q
            ).first()

            if override and override.is_disabled:
                continue

            resolved = {
                "question_id": str(q.id),
                "category": category.name,

                "text": override.overridden_text if override and override.overridden_text else q.question_text,
                "type": override.overridden_type if override and override.overridden_type else q.type,

                "required": override.overridden_required if override and override.overridden_required is not None else q.required,

                "help_text": override.overridden_help_text if override and override.overridden_help_text else q.help_text,

                "placeholder": override.overridden_placeholder if override and override.overridden_placeholder else q.placeholder,

                "options_config": override.overridden_options_config if override and override.overridden_options_config else q.options_config,

                "order": override.order if override else 0
            }

            final_questions.append(resolved)

    final_questions.sort(key=lambda x: x["order"])

    return {
        "template_id": str(template.id),
        "template_name": template.name,
        "questions": final_questions
    }