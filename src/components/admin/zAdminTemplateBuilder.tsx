import React, { useEffect, useMemo, useState } from "react";
import {
  FolderOpen,
  ClipboardList,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
  Pencil,
  Trash2,
} from "lucide-react";

import { DashboardLayout } from "../layout/DashboardLayout";
import { Modal } from "../ui/Modal";
import { QuestionModal } from "./QuestionModal";
import { apiFetch } from "../../services/api";
import { useApp } from "../../context/AppContext";
import { CategoryModal } from "./CategoryModal";
import { success, error } from "../../utils/toast";

interface Template {
  template_id: string;
  name: string;
}

interface TemplateCategory {
  template_category_id: string;
  category: string;
  category_name: string;
  order: number;
  is_enabled: boolean;
  question_count: number;
}

interface TemplateQuestion {
  template_question_id: string;
  question: string;
  question_text: string;
  order: number;
  is_disabled: boolean;
}

export const AdminTemplateBuilder: React.FC = () => {
  const { navigate } = useApp();

  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("");

  const [questions, setQuestions] = useState<TemplateQuestion[]>([]);

  const [loading, setLoading] = useState(true);

  const [categorySearch, setCategorySearch] = useState("");
  const [questionSearch, setQuestionSearch] = useState("");

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [editingCategory,setEditingCategory]=useState<any>(null);
  const [editingQuestion,setEditingQuestion]=useState<any>(null);

  async function fetchTemplates() {
    const res = await apiFetch(
      "/questionnaires/templates/dropdown/",
      {},
      navigate
    );

    // const data = await res.json();

    setTemplates(res);

    if (res.length > 0) {
      setSelectedTemplate(res[0].template_id);
    }
  }

  async function fetchCategories(templateId: string) {
    const res = await apiFetch(
      `/questionnaires/template-categories/by_template/?template=${templateId}`,
      {},
      navigate
    );

    // const data = await res.json();

    setCategories(res);

    if (res.length > 0) {
      setSelectedCategory(res[0].template_category_id);
    } else {
      setSelectedCategory("");
      setQuestions([]);
    }
  }

  const handleDelete = async (id: string) => {
    try {
        const res = await apiFetch(
            `/questionnaires/template-categories/${id}/`,
            {
                method: "DELETE",
            },
            navigate
        );

        success(res.message || "Category deleted successfully");

        fetchCategories(selectedTemplate);

    } catch (err: any) {
        error(err.message || "Unable to delete category");
    }
};

const deleteQuestion = async (id:string) => {
  try {
    const res = await apiFetch(

        `/questionnaires/template-questions/${id}/`,
        {
            method:"DELETE"
        },

        navigate

    );
    success(res.message || "Question deleted successfully");

    fetchQuestions(selectedCategory);
     } catch (err: any) {
        error(err.message || "Unable to delete question");
    }
}

  async function fetchQuestions(categoryId: string) {
    const res = await apiFetch(
      `/questionnaires/template-questions/by_template_category/?template_category=${categoryId}`,
      {},
      navigate
    );

    // const data = await res.json();

    setQuestions(res);
  }

  useEffect(() => {
    (async () => {
      try {
        await fetchTemplates();
      } catch (err: any) {
        error(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedTemplate) {
      fetchCategories(selectedTemplate);
    }
  }, [selectedTemplate]);

  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory);
    }
  }, [selectedCategory]);

  const filteredCategories = useMemo(() => {
    return categories.filter((c) =>
      (c.category_name ?? "")
        .toLowerCase()
        .includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const filteredQuestions = useMemo(() => {
    return questions.filter((q) =>
      (q.question_text ?? "")
        .toLowerCase()
        .includes(questionSearch.toLowerCase())
    );
  }, [questions, questionSearch]);

  const toggleCategory = async (id: string) => {
    await apiFetch(
      `/questionnaires/template-categories/${id}/toggle/`,
      { method: "PATCH" },
      navigate
    );

    success("Category updated");

    fetchCategories(selectedTemplate);
  };

  const toggleQuestion = async (id: string) => {
    await apiFetch(
      `/questionnaires/template-questions/${id}/toggle/`,
      { method: "PATCH" },
      navigate
    );

    success("Question updated");

    fetchQuestions(selectedCategory);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center">
          Loading...
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>

      <div className="flex justify-between mb-6">

        <div>

          <h2 className="text-2xl font-bold">

            Template Builder

          </h2>

          <p className="text-gray-500 text-sm">

            Assign Categories & Questions

          </p>

        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-sm  p-5 mb-6">

        <label className="font-medium">

          Template

        </label>

        <select
          value={selectedTemplate}
          onChange={(e) =>
            setSelectedTemplate(e.target.value)
          }
          className="mt-2 w-full border border-gray-200 rounded-xl p-3"
        >
          {templates.map((t) => (
            <option
              key={t.template_id}
              value={t.template_id}
            >
              {t.name}
            </option>
          ))}
        </select>

      </div>

      <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden ">
            <div className="flex justify-between items-center p-5 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <FolderOpen className="text-blue-600"/>
                <h3 className="font-bold">
                  Categories

                </h3>

              </div>

              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
              >

                <Plus size={16}/>

                Add

              </button>

            </div>

      <div className="p-4">

        <div className="relative mb-4">

          <Search className="absolute left-3 top-3 text-gray-400" size={18}/>

          <input
            value={categorySearch}
            onChange={(e)=>setCategorySearch(e.target.value)}
            placeholder="Search Category..."
            className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3"
          />

        </div>

        <div className="space-y-3 max-h-[600px] overflow-auto">

          {filteredCategories.map((cat)=>(
            <div
              key={cat.template_category_id}
              onClick={()=>setSelectedCategory(cat.template_category_id)}
              className={`bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer p-4
              ${
                selectedCategory===cat.template_category_id
                ? "border-blue-500 bg-blue-50"
                : "hover:border-blue-300"
              }`}
            >

              <div className="flex justify-between">

                <div>

                  <div className="font-semibold">

                    {cat.category_name}

                  </div>

                  <div className="text-xs text-gray-500 mt-1">

                    {cat.question_count} Questions

                  </div>

                </div>
                <div className="flex gap-3 items-center">
                  {/* <button
                  className="text-blue-600 flex items-center gap-2 text-sm"
                >

                  <Pencil size={15}/>

                  Edit

                </button> */}

                <button
                  className="text-red-500 flex items-center gap-2 text-sm" onClick={()=>handleDelete(cat.template_category_id)}
                >

                  <Trash2 size={15}/>

                  Delete

                </button>
                {/* <button
                  onClick={(e)=>{
                    e.stopPropagation();
                    toggleCategory(cat.template_category_id);
                  }}
                >

                  {cat.is_enabled
                    ? <ToggleRight className="text-green-600"/>
                    : <ToggleLeft className="text-gray-400"/>
                  }

                </button> */}
                </div>  
              </div>


            </div>
          ))}

          {filteredCategories.length===0 &&(

            <div className="text-center py-16 text-gray-500">

              No Categories Found

            </div>

          )}

        </div>

      </div>

    </div>

<div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition overflow-hidden ">

  <div className="flex justify-between items-center p-5 border-b border-gray-100">

    <div className="flex items-center gap-2">

      <ClipboardList className="text-blue-600"/>

      <h3 className="font-bold">

        Questions

      </h3>

    </div>

    <button
      onClick={()=>setShowQuestionModal(true)}
      className="bg-blue-600 text-white px-4 py-2 rounded-xl flex items-center gap-2"
    >

      <Plus size={16}/>

      Add

    </button>

  </div>

  <div className="p-4">

    <div className="relative mb-4">

      <Search className="absolute left-3 top-3 text-gray-400" size={18}/>

      <input
        value={questionSearch}
        onChange={(e)=>setQuestionSearch(e.target.value)}
        placeholder="Search Question..."
        className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3"
      />

    </div>

    <div className="space-y-3 max-h-[600px] overflow-auto">

      {filteredQuestions.map((q)=>(
        <div
          key={q.template_question_id}
          className="bg-white rounded-2xl border border-gray-300 shadow-sm hover:shadow-lg transition overflow-hidden cursor-pointer p-4"
        >

          <div className="flex justify-between">

            <div>

              <div className="font-semibold">

                {q.question_text}

              </div>

              {/* <div className="text-xs text-gray-500 mt-2">

                Order : {q.order}

              </div> */}

            </div>
            <div className="flex gap-3 items-center">  
              <button
                onClick={()=>
                  toggleQuestion(q.template_question_id)
                }
              >

                {q.is_disabled
                  ? <ToggleLeft className="text-gray-400"/>
                  : <ToggleRight className="text-green-600"/>
                }

              </button>
                {/* <button
                className="flex items-center gap-2 text-blue-600 text-sm"
              >

                <Pencil size={15}/>

                Edit

              </button> */}

              <button title="Delete Question"
                className="flex items-center gap-2 text-red-500 text-sm" onClick={()=>deleteQuestion(q.template_question_id)}
              >

                <Trash2 size={15}/>

              </button>
             </div>   
          </div>


        </div>
      ))}

      {filteredQuestions.length===0 &&(

        <div className="text-center py-16 text-gray-500">

          No Questions Found

        </div>

      )}

    </div>

  </div>

</div>

      </div>

      <Modal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        title="Assign Category"
      >
        <CategoryModal

            isOpen={showCategoryModal}

            onClose={()=>{

            setShowCategoryModal(false);

            setEditingCategory(null);

            }}

            templateId={selectedTemplate}

            editingCategory={editingCategory}

            refresh={()=>fetchCategories(selectedTemplate)}

            />
      </Modal>

      <Modal
        isOpen={showQuestionModal}
        onClose={() => setShowQuestionModal(false)}
        title="Assign Question"
      >
        <QuestionModal

            isOpen={showQuestionModal}

            onClose={()=>{

            setShowQuestionModal(false);

            setEditingQuestion(null);

            }}

            editingQuestion={editingQuestion}

            templateId={selectedTemplate}

            templateCategoryId={selectedCategory}

            refresh={()=>fetchQuestions(selectedCategory)}

            />
      </Modal>

    </DashboardLayout>
  );
};