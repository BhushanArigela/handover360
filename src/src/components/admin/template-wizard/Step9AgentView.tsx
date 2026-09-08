import React, { useEffect, useState } from "react";
import {
  Edit3,
  Wrench,
  ImageIcon,
  Star,
  Camera,
} from "lucide-react";
import { api } from "../api";
import type {
  Template,
  FlatInspectionItem,
} from "./types";

const SEVERITIES = ["Low", "Medium", "High"] as const;

interface Step9AgentViewProps {
  template: Template | null;
}

const Step9AgentView: React.FC<Step9AgentViewProps> = ({
  template,
}) => {
  const [items, setItems] = useState<FlatInspectionItem[]>([]);
  const [idx, setIdx] = useState<number>(0);
  const [observation, setObservation] = useState("");
  const [rectification, setRectification] = useState("");
  const [severity, setSeverity] =
    useState<(typeof SEVERITIES)[number]>("Medium");

  useEffect(() => {
    if (!template) return;

    api.getFlatItems(template.id).then(setItems);
  }, [template]);

  if (!template) {
    return (
      <div className="empty-note">
        Publish a template first to preview the
        agent's mobile view.
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-note">
        This template has no inspection items yet.
      </div>
    );
  }

  const current = items[idx];

  const saveAndNext = async (
    direction: number
  ): Promise<void> => {
    await api
      .submitInspectionEntry(template.id, {
        item_id: current.item_id,
        specification: "As per plan",
        observation,
        rectification,
        severity,
      })
      .catch(() => {});

    const next = idx + direction;

    if (next >= 0 && next < items.length) {
      setIdx(next);
      setObservation("");
      setRectification("");
      setSeverity("Medium");
    }
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 40,
        alignItems: "flex-start",
      }}
    >
      <div className="phone-frame">
        <div className="phone-screen">
          <div className="phone-topbar">
            {current.room} &gt; {current.section}
          </div>

          <div className="phone-crumb">
            {current.item_name}
          </div>

          <div className="phone-progress">
            {idx + 1} of {items.length}
          </div>

          <div className="phone-field-label">
            <Edit3 size={12} />
            Specification
          </div>

          <div className="phone-field-value">
            As per plan
          </div>

          <div className="phone-field-label">
            <Edit3 size={12} />
            Observation
          </div>

          <textarea
            className="field-input"
            rows={2}
            value={observation}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement>
            ) => setObservation(e.target.value)}
            placeholder="e.g. Switches are loose"
          />

          <div className="phone-field-label">
            <Wrench size={12} />
            Rectification
          </div>

          <textarea
            className="field-input"
            rows={2}
            value={rectification}
            onChange={(
              e: React.ChangeEvent<HTMLTextAreaElement>
            ) => setRectification(e.target.value)}
            placeholder="e.g. Tighten the switches"
          />

          <div className="phone-field-label">
            <ImageIcon size={12} />
            Image
          </div>

          <div className="phone-image-box">
            <Camera size={20} />
          </div>

          <div className="phone-field-label">
            <Star size={12} />
            Severity
          </div>

          <select
            className="field-input"
            value={severity}
            onChange={(
              e: React.ChangeEvent<HTMLSelectElement>
            ) =>
              setSeverity(
                e.target.value as (typeof SEVERITIES)[number]
              )
            }
          >
            {SEVERITIES.map((level) => (
              <option
                key={level}
                value={level}
              >
                {level}
              </option>
            ))}
          </select>

          <div className="phone-footer">
            <button
              className="phone-nav-btn"
              onClick={() => saveAndNext(-1)}
              disabled={idx === 0}
            >
              ← Previous
            </button>

            <button
              className="phone-nav-btn"
              onClick={() => saveAndNext(1)}
              disabled={idx === items.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <div
        style={{
          maxWidth: 340,
          paddingTop: 20,
        }}
      >
        <div
          style={{
            color: "var(--blue-600)",
            fontWeight: 700,
            fontSize: 15,
            marginBottom: 14,
          }}
        >
          For Agents (During Inspection)
        </div>

        <div
          className="muted"
          style={{ marginBottom: 10 }}
        >
          Each item will have:
        </div>

        <ul className="help-list">
          <li>
            <Edit3
              size={15}
              color="var(--blue-600)"
            />
            Observation
          </li>

          <li>
            <Wrench
              size={15}
              color="var(--blue-600)"
            />
            Rectification
          </li>

          <li>
            <ImageIcon
              size={15}
              color="var(--blue-600)"
            />
            Image upload
          </li>

          <li>
            <Star
              size={15}
              color="var(--amber)"
            />
            Severity (Low / Medium / High)
          </li>
        </ul>

        <div
          style={{
            marginTop: 20,
            fontSize: 13.5,
          }}
        >
          <div>
            <b>Admin only</b> designs the structure.
          </div>

          <div>
            <b>Agents</b> fill the inspection data.
          </div>
        </div>
      </div>
    </div>
  );
};

export default Step9AgentView;