# from django.contrib import admin

# from .models import (
#     Template,
#     Category,
#     Question,
#     TemplateCategory,
#     TemplateQuestion,
# )

# @admin.register(Category)
# class CategoryAdmin(admin.ModelAdmin):
#     list_display = (
#         "name",
#         "is_active",
#     )

#     list_filter = (
#         "is_active",
#     )

#     search_fields = (
#         "name",
#     )

#     ordering = (
#         "name",
#     )

# @admin.register(Template)
# class TemplateAdmin(admin.ModelAdmin):
#     list_display = (
#         "name",
#         "property_type",
#         "version",
#         "is_default",
#         "is_active",
#     )

#     list_filter = (
#         "property_type",
#         "is_default",
#         "is_active",
#     )

#     search_fields = (
#         "name",
#     )

#     ordering = (
#         "name",
#     )

# @admin.register(Question)
# class QuestionAdmin(admin.ModelAdmin):
#     list_display = (
#         "question_text",
#         "type",      # Change if your field name is different
#         "required",
#         "is_active",
#     )

#     list_filter = (
#         "type",      # Change if required
#         "required",
#         "is_active",
#     )

#     search_fields = (
#         "question_text",
#     )    

# @admin.register(TemplateCategory)
# class TemplateCategoryAdmin(admin.ModelAdmin):
#     list_display = (
#         "template",
#         "category",
#         "order",
#         "is_enabled",
#     )

#     list_filter = (
#         "template",
#         "is_enabled",
#     )

#     search_fields = (
#         "template__name",
#         "category__name",
#     )

#     ordering = (
#         "template",
#         "order",
#     )

# @admin.register(TemplateQuestion)
# class TemplateQuestionAdmin(admin.ModelAdmin):
#     list_display = (
#         "template",
#         "template_category",
#         "question",
#         "order",
#         "is_disabled",
#     )

#     list_filter = (
#         "template",
#         "template_category",
#         "is_disabled",
#     )

#     search_fields = (
#         "question__question_text",
#         "template__name",
#     )

#     ordering = (
#         "template",
#         "template_category",
#         "order",
#     )        