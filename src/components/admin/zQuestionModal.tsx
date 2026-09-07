import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { Modal } from "../ui/Modal";

import { apiFetch } from "../../services/api";
import { useApp } from "../../context/AppContext";

import { success, error } from "../../utils/toast";

interface Question {
  question_id: string;
  question_text: string;
  question_type: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;

  templateId: string;

  templateCategoryId: string;
  refresh: () => void;
  editingQuestion?:any;
}

const emptyForm = {
  questions: [] as string[],
  order: 1,
};

export const QuestionModal: React.FC<Props> = ({
  isOpen,
  onClose,
  templateId,
  templateCategoryId,
  refresh,
  editingQuestion,
}) => {

  const { navigate } = useApp();

  const [questions, setQuestions] = useState<Question[]>([]);

  const [search, setSearch] = useState("");

  const [form, setForm] = useState(emptyForm);

  async function fetchQuestions() {

    try {

      const res = await apiFetch(
        "/questionnaires/questions/dropdown/",
        {},
        navigate
      );

      // const data = await res.json();

      setQuestions(res);

    } catch (err: any) {

      error(err.message);

    }

  }

  useEffect(() => {
    if (!isOpen) return;

    fetchQuestions();

    if (editingQuestion) {
        setForm({
            questions: [editingQuestion.question],
            order: editingQuestion.order,
        });
    } else {
        setForm(emptyForm);
    }
}, [isOpen, editingQuestion]);

  const filteredQuestions = useMemo(() => {

    return questions.filter((q) =>
      q.question_text
        .toLowerCase()
        .includes(search.toLowerCase())
    );

  }, [questions, search]);

  const validate = () => {

    if (form.questions.length === 0) {
      error("Please select at least one question");
      return false;
    }

    if (form.order <= 0) {

      error("Invalid display order");

      return false;

    }

    return true;

  };

  async function handleSubmit(e: React.FormEvent) {

    e.preventDefault();

    if (!validate()) return;

    try {
        const url= editingQuestion ? `/questionnaires/template-questions/${editingQuestion.template_question_id}/`
            : "/questionnaires/template-questions/";
        const method = editingQuestion ? "PUT" : "POST";

        const payload = editingQuestion
        ? {
            template: templateId,
            template_category: templateCategoryId,
            question: form.questions[0], // single question
            order: form.order,
          }
        : {
            template: templateId,
            template_category: templateCategoryId,
            questions: form.questions, // multiple questions
            order: form.order,
          };
      await apiFetch(
        url,
        {
          method: method,

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify(payload),
        },
        navigate
      );

      success(
        editingQuestion
            ? "Question Updated"
            : "Question Assigned"
    );

      refresh();

      setForm(emptyForm);

      onClose();

    } catch (err: any) {

      error(err.message);

    }

  }

  return (

    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={ editingQuestion ? "Edit Question" : "Assign Question" }

    >

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        <div className="relative">

          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Question..."
            className="w-full border rounded-xl pl-10 pr-4 py-3"
          />

        </div>

        <div>

          <label className="block mb-2 font-medium">

            Question

          </label>

          <select
            multiple
            value={form.questions}
            onChange={(e) => {
                const values = Array.from(
                    e.target.selectedOptions,
                    option => option.value
                );

                setForm({
                    ...form,
                    questions: values,
                });
            }}
            className="w-full border rounded-xl p-3 h-72"
        >
            {filteredQuestions.map((q) => (
                <option
                    key={q.question_id}
                    value={q.question_id}
                >
                    {q.question_text}
                </option>
            ))}
        </select>

        <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple questions.
        </p>

        </div>

        <div>

          {/* <label className="block mb-2 font-medium">

            Display Order

          </label> */}

          <input
            type="hidden"
            value={form.order}
            onChange={(e) =>
              setForm({
                ...form,
                order: Number(e.target.value),
              })
            }
            className="w-full border rounded-xl p-3"
          />

        </div>

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={onClose}
            className="border rounded-xl px-5 py-2"
          >

            Cancel

          </button>

          <button
            type="submit"
            className="bg-purple-600 text-white rounded-xl px-5 py-2"
          >

            Save

          </button>

        </div>

      </form>

    </Modal>

  );

};