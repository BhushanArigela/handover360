import { apiRequest } from "./api";

export const TemplateApi = {

    getTemplates() {

        return apiRequest("/templates/");

    },

    getCategories(templateId: number) {

        return apiRequest(

            `/template-categories/by_template/?template=${templateId}`

        );

    },

    getQuestions(templateCategoryId: number) {

        return apiRequest(

            `/template-questions/by_template_category/?template_category=${templateCategoryId}`

        );

    }

};