import React, { useState } from "react";
import { GripVertical } from "lucide-react";
import { generateFloors } from "../../../api/api";
import type { Floor, Template } from "./types";
import { confirm  } from "../../../utils/toast";

interface Step2AddFloorsProps {
  template: Template;
  floors: Floor[];
  setFloors: React.Dispatch<React.SetStateAction<Floor[]>>;
  onBack: () => void;
  onNext: () => void;
}

const Step2AddFloors: React.FC<Step2AddFloorsProps> = ({
  template,
  floors,
  setFloors,
  onBack,
  onNext,
}) => {
  const [count, setCount] = useState<number>(floors.length || 3);
  const [generating, setGenerating] = useState<boolean>(false);

  const generate = async (): Promise<void> => {

    if (floors.length > 0) {

        const ok = await confirm(
            "Regenerate Floors?",
            "This will remove all existing floors, rooms, sections and items."
        );

        if (!ok) return;
    }

    setGenerating(true);

    try {

        const created = await generateFloors(template.id, count);
        setFloors(created);
        setCount(created.length);
    } finally {

        setGenerating(false);

    }

};

  return (

    <div className="space-y-6">

    {/* Header */}
    <div>
      <h2 className="text-2xl font-bold text-gray-900">
        Step 2 - Configure Floors
      </h2>
      <p className="text-gray-500 mt-1">
        Generate and review floors for this inspection template.
      </p>
    </div>
    {/* Stepper */}

        <div className="flex items-center gap-3">

            <div className="w-9 h-9 rounded-full bg-emerald-200 text-gray-500  flex items-center justify-center ">
                1
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-semibold">
                2
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                3
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                4
            </div>

            <div className="h-1 flex-1 bg-gray-200 rounded" />

            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                5
            </div>
            <div className="h-1 flex-1 bg-gray-200 rounded" />
            <div className="w-9 h-9 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center">
                6
            </div>

        </div>

    {/* Card */}
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

      <div className="grid grid-cols-12 gap-8 p-6">

        {/* Left */}
        <div className="col-span-4">

          <label className="block text-sm font-medium mb-2">
            Number of Floors
          </label>

          <input
            type="number"
            min={1}
            max={20}
            value={count}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCount(Number(e.target.value))
            }
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />

          <button
            onClick={generate}
            disabled={generating}
            className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg py-2.5 font-medium disabled:bg-gray-300"
          >
            {generating ? "Generating..." : "Generate Floors"}
          </button>

        </div>

        {/* Right */}

        <div className="col-span-8">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-lg font-semibold">
              Floor Preview
            </h3>

            <span className="text-sm border border-gray-300 p-3 rounded-xl">
              {floors.length} Floor(s)
            </span>

          </div>

          {floors.length === 0 ? (

            <div className="border-2 border-dashed border-gray-300 rounded-xl h-56 flex items-center justify-center text-gray-500">
              No floors generated
            </div>

          ) : (

            <div className="space-y-3">

              {floors.map((floor, index) => (

                <div
                  key={floor.id}
                  className="flex items-center justify-between border border-gray-300 p-3 rounded-xl rounded-lg px-4 py-3 hover:bg-gray-50"
                >

                  <div className="flex items-center gap-3">

                    <GripVertical
                      size={18}
                      className="text-gray-400"
                    />

                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>

                    <div>

                      <div className="font-medium">
                        {floor.name}
                      </div>

                      <div className="text-xs text-gray-500">
                        {floor.code}
                      </div>

                    </div>

                  </div>

                  <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                    {floor.code}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-gray-100 px-6 py-4 flex justify-between">

        <button
          onClick={onBack}
          className="px-5 py-2 border border-gray-100 bg-red-500 text-white rounded-lg hover:bg-red-300"
        >
          ← Previous
        </button>

        <button
          onClick={onNext}
          disabled={floors.length === 0}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:bg-gray-300"
        >
          Continue →
        </button>

      </div>

    </div>

  </div>
  );
};

export default Step2AddFloors;