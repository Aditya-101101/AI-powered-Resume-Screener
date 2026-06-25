import React from "react";

const AtsExplanation = ({ explanation, breakdown, score,isUser }) => {
  if (!explanation) {
    return (
      <p className="text-sm text-slate-500 text-center py-2">
        Score breakdown not available for this application.
      </p>
    );
  }

  const { matchedSkills = [], experience, missingKeywords = [], suggestions = [] } =
    explanation;

  return (
    <div className="flex flex-col gap-4 text-sm">
      {score != null && (
        <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-700">ATS Score</span>
          <span className="font-bold text-emerald-600">{score} / 85</span>
        </div>
      )}

      {breakdown && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: "Skills", value: breakdown.skills, max: 40 },
            { label: "Experience", value: breakdown.experience, max: 25 },
            { label: "Education", value: breakdown.education, max: 10 },
            { label: "Keywords", value: breakdown.keywords, max: 10 },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-md bg-white border border-slate-100 px-2 py-1.5"
            >
              <p className="text-slate-400">{item.label}</p>
              <p className="font-semibold text-slate-700">
                {item.value} / {item.max}
              </p>
            </div>
          ))}
        </div>
      )}

      {matchedSkills.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Matched Skills
          </p>
          <div className="flex flex-col gap-1.5">
            {matchedSkills.map(({ skill, matched }) => (
              <div
                key={skill}
                className="flex items-center justify-between rounded-md bg-white border border-slate-100 px-3 py-1.5"
              >
                <span className="text-slate-700">{skill}</span>
                <span
                  className={`text-xs font-bold ${
                    matched ? "text-emerald-600" : "text-rose-500"
                  }`}
                >
                  {matched ? "✓" : "✗"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {experience && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Experience
          </p>
          <div className="rounded-md bg-white border border-slate-100 px-3 py-2 space-y-1">
            <p className="text-slate-600">
              Required:{" "}
              <span className="font-semibold text-slate-800">
                {experience.required} {experience.required === 1 ? "year" : "years"}
              </span>
            </p>
            <p className="text-slate-600">
              Candidate:{" "}
              <span
                className={`font-semibold ${
                  experience.candidate >= experience.required
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {experience.candidate} {experience.candidate === 1 ? "year" : "years"}
              </span>
            </p>
          </div>
        </div>
      )}

      {missingKeywords.length > 0 && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Missing Keywords
          </p>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((keyword) => (
              <span
                key={keyword}
                className="px-2 py-0.5 text-xs rounded-full bg-rose-50 text-rose-600 border border-rose-100"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {suggestions.length > 0 &&  isUser && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Suggestions
          </p>
          <ul className="space-y-1.5">
            {suggestions.map((tip) => (
              <li
                key={tip}
                className="flex gap-2 rounded-md bg-indigo-50 border border-indigo-100 px-3 py-2 text-slate-700"
              >
                <span className="text-indigo-500 shrink-0">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AtsExplanation;
