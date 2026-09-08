export interface Template {
    template_id: number;
    template_name: string;
    description?: string;
    is_enabled: boolean;
}

export interface Category {
    category_id: number;
    name: string;
    description?: string;
    is_enabled: boolean;
}

export interface Question {
    question_id: number;
    question_text: string;
    question_type: string;
    is_required: boolean;
    help_text?: string;
    placeholder?: string;
    options_config?: string;
    is_enabled: boolean;
}

export interface TemplateCategory {
    template_category_id: number;

    template: number;

    category: number;

    category_name: string;

    order: number;

    is_enabled: boolean;

    question_count?: number;
}

export interface TemplateQuestion {

    template_question_id: number;

    template: number;

    template_category: number;

    question: number;

    question_text: string;

    category_name: string;

    order: number;

    is_disabled: boolean;

    overridden_text?: string;

    overridden_type?: string;

    overridden_required?: boolean;

    overridden_help_text?: string;

    overridden_placeholder?: string;

    overridden_options_config?: string;
}