import React, { useEffect, useState } from "react";

import { Modal } from "../ui/Modal";

import { apiFetch } from "../../services/api";

import { useApp } from "../../context/AppContext";

import { success, error } from "../../utils/toast";

interface Category {
  category_id: string;
  name: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  templateId: string;
  refresh: () => void;
  editingCategory?:any;
}

export const CategoryModal: React.FC<Props> = ({
  isOpen,
  onClose,
  templateId,
  refresh,
  editingCategory,
}) => {
  const { navigate } = useApp();

  const [categories, setCategories] = useState<Category[]>([]);

  const emptyForm = {
    category: "",
    order: 1,
    is_enabled: true,
};
  const [form, setForm] = useState(emptyForm);  
  const fetchCategories = async () => {
    try {
      const res = await apiFetch(
        "/questionnaires/categories/dropdown/",
        {},
        navigate
      );

      // const data = await res.json();

      setCategories(res);
    } catch (err: any) {
      error(err.message);
    }
  };

  useEffect(()=>{
    if (!isOpen) return;

    fetchCategories();
    
    if(editingCategory){

        setForm({

            category:editingCategory.category,

            order:editingCategory.order,

            is_enabled:editingCategory.is_enabled

        });

    }
    else{

        setForm(emptyForm);

    }

},[editingCategory,isOpen]);

  const validate = () => {
    if (!form.category) {
      error("Please select a category");
      return false;
    }

    if (form.order <= 0) {
      error("Order must be greater than zero");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
        const url=editingCategory
            ?
            `/questionnaires/template-categories/${editingCategory.template_category_id}/`
            :
            "/questionnaires/template-categories/";
        const method=editingCategory?"PUT":"POST";
      await apiFetch(
        url,
        {
          method: method,

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            template: templateId,
            category: form.category,
            order: form.order,
            is_enabled: form.is_enabled,
          }),
        },
        navigate
      );

      success(
        editingCategory
            ? "Category Updated"
            : "Category Assigned"
    );

      refresh();

      onClose();

      setForm(emptyForm);

    } catch (err: any) {
      error(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
    editingCategory
    ?
    "Edit Category"
    :
    "Assign Category"
    }
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        <div>

          <label className="block mb-2 font-medium">

            Category

          </label>

          <select 
            value={form.category}
            onChange={(e) =>
              setForm({
                ...form,
                category: e.target.value,
              })
            }
            className="w-full border rounded-xl p-3"
          >

            <option value="">

              Select Category

            </option>

            {categories.map((c) => (
              <option
                key={c.category_id}
                value={c.category_id}
              >
                {c.name}
              </option>
            ))}

          </select>

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

        <div className="flex items-center gap-2">

          <input
            type="checkbox"
            checked={form.is_enabled}
            onChange={(e) =>
              setForm({
                ...form,
                is_enabled: e.target.checked,
              })
            }
          />

          <span>

            Enabled

          </span>

        </div>

        <div className="flex justify-end gap-3 pt-4">

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 border rounded-xl"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-purple-600 text-white px-5 py-2 rounded-xl"
          >
            Save
          </button>

        </div>
      </form>
    </Modal>
  );
};