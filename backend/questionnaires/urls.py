from django.urls import path, include
from rest_framework.routers import DefaultRouter

from questionnaires.views import TemplateViewSet, CategoryViewSet, QuestionViewSet,  TemplateCategoryViewSet,  TemplateQuestionViewSet
from questionnaires.views.template_category_view import TemplateCategoryViewSet
from questionnaires.views.template_question_view import TemplateQuestionViewSet
from questionnaires.views.inspection_view import InspectionTemplateView

router = DefaultRouter()

router.register("templates", TemplateViewSet, basename="templates")
router.register("categories", CategoryViewSet, basename="categories")
router.register("questions", QuestionViewSet, basename="questions")
# router.register("template-categories", TemplateCategoryViewSet, basename="template-category")
# router.register("template-questions", TemplateQuestionViewSet, basename="template-question")
router.register("template-categories", TemplateCategoryViewSet, basename="template-categories")
router.register("template-questions", TemplateQuestionViewSet,  basename="template-questions")



urlpatterns = [
    path(
        "templates/<uuid:template_id>/inspection/",
        InspectionTemplateView.as_view(),
        name="inspection-template",
    ),
    path("", include(router.urls)),
]