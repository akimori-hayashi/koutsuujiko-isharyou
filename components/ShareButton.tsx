"use client";

import { useState } from "react";
import { CalculatorInput } from "@/lib/calculator";

interface ShareButtonProps {
  input: CalculatorInput;
}

export default function ShareButton({ input }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const generateShareUrl = () => {
    const params = new URLSearchParams({
      injuryLevel: input.injuryLevel,
      hospitalizationDays: input.hospitalizationDays.toString(),
      outpatientDays: input.outpatientDays.toString(),
      workLossDays: input.workLossDays.toString(),
      faultPercentage: input.faultPercentage.toString(),
      age: input.age.toString(),
      occupation: input.occupation,
    });

    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?${params.toString()}`;
  };

  const handleCopy = async () => {
    const url = generateShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // フォールバック: テキストエリア経由でコピー
      const textarea = document.createElement("textarea");
      textarea.value = url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-2xl">🔗</span> 結果をシェア
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        入力内容をURLに含めて共有できます。同じURLにアクセスすると、自動的に計算結果が表示されます。
      </p>
      <button
        onClick={handleCopy}
        className={`w-full sm:w-auto font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2 ${
          copied
            ? "bg-green-500 text-white"
            : "bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300"
        }`}
      >
        {copied ? (
          <>✅ コピーしました！</>
        ) : (
          <>📋 URLをコピー</>
        )}
      </button>
    </div>
  );
}
