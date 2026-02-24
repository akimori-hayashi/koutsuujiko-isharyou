"use client";

import { InjuryLevel, Occupation, CalculatorInput } from "@/lib/calculator";

interface CalculatorFormProps {
  input: CalculatorInput;
  onChange: (input: CalculatorInput) => void;
  onCalculate: () => void;
}

const injuryLevels: InjuryLevel[] = ["軽傷", "中程度", "重傷", "後遺障害"];
const occupations: Occupation[] = [
  "会社員",
  "自営業",
  "主婦(主夫)",
  "学生",
  "無職",
];

export default function CalculatorForm({
  input,
  onChange,
  onCalculate,
}: CalculatorFormProps) {
  const update = (field: keyof CalculatorInput, value: string | number) => {
    onChange({ ...input, [field]: value });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
        <span className="text-2xl">📋</span> 事故情報を入力
      </h2>

      <div className="space-y-6">
        {/* 傷害の程度 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            傷害の程度 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {injuryLevels.map((level) => (
              <button
                key={level}
                type="button"
                onClick={() => update("injuryLevel", level)}
                className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                  input.injuryLevel === level
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          {input.injuryLevel === "後遺障害" && (
            <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
              後遺障害の場合、等級認定後に別途計算が必要です。ここでは概算値を表示します。
            </p>
          )}
        </div>

        {/* 日数入力 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              入院日数
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={input.hospitalizationDays}
                onChange={(e) =>
                  update(
                    "hospitalizationDays",
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
                className="w-full border-2 border-gray-200 rounded-lg py-2 px-3 pr-8 focus:outline-none focus:border-blue-500 text-gray-800"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                日
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              通院日数
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={input.outpatientDays}
                onChange={(e) =>
                  update(
                    "outpatientDays",
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
                className="w-full border-2 border-gray-200 rounded-lg py-2 px-3 pr-8 focus:outline-none focus:border-blue-500 text-gray-800"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                日
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              休業日数
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={input.workLossDays}
                onChange={(e) =>
                  update(
                    "workLossDays",
                    Math.max(0, parseInt(e.target.value) || 0)
                  )
                }
                className="w-full border-2 border-gray-200 rounded-lg py-2 px-3 pr-8 focus:outline-none focus:border-blue-500 text-gray-800"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                日
              </span>
            </div>
          </div>
        </div>

        {/* 過失割合 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            あなたの過失割合:{" "}
            <span className="text-blue-600 font-bold">
              {input.faultPercentage}%
            </span>
          </label>
          <input
            type="range"
            min="0"
            max="100"
            step="5"
            value={input.faultPercentage}
            onChange={(e) =>
              update("faultPercentage", parseInt(e.target.value))
            }
            className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-blue-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%（相手方100%過失）</span>
            <span>100%（自分100%過失）</span>
          </div>
        </div>

        {/* 年齢・職業 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              年齢
            </label>
            <div className="relative">
              <input
                type="number"
                min="0"
                max="120"
                value={input.age}
                onChange={(e) =>
                  update("age", Math.max(0, parseInt(e.target.value) || 0))
                }
                className="w-full border-2 border-gray-200 rounded-lg py-2 px-3 pr-8 focus:outline-none focus:border-blue-500 text-gray-800"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                歳
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              職業
            </label>
            <select
              value={input.occupation}
              onChange={(e) =>
                update("occupation", e.target.value as Occupation)
              }
              className="w-full border-2 border-gray-200 rounded-lg py-2 px-3 focus:outline-none focus:border-blue-500 text-gray-800 bg-white"
            >
              {occupations.map((occ) => (
                <option key={occ} value={occ}>
                  {occ}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 計算ボタン */}
        <button
          type="button"
          onClick={onCalculate}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-md hover:shadow-lg"
        >
          慰謝料を計算する
        </button>
      </div>
    </div>
  );
}
