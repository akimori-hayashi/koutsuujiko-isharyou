"use client";

import { useState } from "react";
import { CalculationResult, CalculatorInput, formatYen } from "@/lib/calculator";

interface ResultDisplayProps {
  result: CalculationResult;
  input: CalculatorInput;
}

export default function ResultDisplay({ result, input }: ResultDisplayProps) {
  const [simpleExplanation, setSimpleExplanation] = useState<string>("");
  const [detailedExplanation, setDetailedExplanation] = useState<string>("");
  const [loadingSimple, setLoadingSimple] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [errorSimple, setErrorSimple] = useState<string>("");
  const [errorDetailed, setErrorDetailed] = useState<string>("");

  const fetchExplanation = async (mode: "simple" | "detailed") => {
    const setLoading = mode === "simple" ? setLoadingSimple : setLoadingDetailed;
    const setExplanation =
      mode === "simple" ? setSimpleExplanation : setDetailedExplanation;
    const setError = mode === "simple" ? setErrorSimple : setErrorDetailed;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          calculationData: {
            ...input,
            totalJibaisekiAfter: result.totalJibaisekiAfter,
            totalLawyerMinAfter: result.totalLawyerMinAfter,
            totalLawyerMaxAfter: result.totalLawyerMaxAfter,
          },
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "APIエラーが発生しました");
      }

      const data = await response.json();
      setExplanation(data.explanation);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "エラーが発生しました"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* メイン結果 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="text-2xl">💴</span> 計算結果
        </h2>

        {/* 主要3カード */}
        <div className="grid grid-cols-1 gap-4 mb-6">
          {/* 自賠責基準 */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm text-gray-500 font-medium mb-1">
              自賠責基準の相場
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {formatYen(result.totalJibaisekiBefore)}
            </div>
            {result.faultPercentage > 0 && (
              <div className="text-sm text-gray-500 mt-1">
                過失割合{result.faultPercentage}%適用後:{" "}
                <span className="font-semibold text-gray-700">
                  {formatYen(result.totalJibaisekiAfter)}
                </span>
              </div>
            )}
          </div>

          {/* 弁護士基準 */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium mb-1">
              弁護士基準の相場
            </div>
            <div className="text-2xl font-bold text-blue-800">
              {formatYen(result.totalLawyerMinBefore)}{" "}
              <span className="text-lg">〜</span>{" "}
              {formatYen(result.totalLawyerMaxBefore)}
            </div>
            {result.faultPercentage > 0 && (
              <div className="text-sm text-blue-600 mt-1">
                過失割合{result.faultPercentage}%適用後:{" "}
                <span className="font-semibold">
                  {formatYen(result.totalLawyerMinAfter)} 〜{" "}
                  {formatYen(result.totalLawyerMaxAfter)}
                </span>
              </div>
            )}
          </div>

          {/* 受取目安 */}
          {result.faultPercentage > 0 && (
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="text-sm text-green-600 font-medium mb-1">
                実際に受け取れる目安（弁護士基準・過失{result.faultPercentage}%適用後）
              </div>
              <div className="text-2xl font-bold text-green-800">
                {formatYen(result.totalLawyerMinAfter)}{" "}
                <span className="text-lg">〜</span>{" "}
                {formatYen(result.totalLawyerMaxAfter)}
              </div>
            </div>
          )}
        </div>

        {/* 内訳テーブル */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">内訳</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-100">
                  <th className="text-left p-3 rounded-tl-lg font-semibold text-gray-700">
                    項目
                  </th>
                  <th className="text-right p-3 font-semibold text-gray-700">
                    自賠責基準
                  </th>
                  <th className="text-right p-3 rounded-tr-lg font-semibold text-blue-700">
                    弁護士基準
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.breakdown.map((row, i) => (
                  <tr
                    key={i}
                    className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="p-3 text-gray-700">{row.label}</td>
                    <td className="p-3 text-right text-gray-800 font-medium">
                      {formatYen(row.jibaiseki)}
                    </td>
                    <td className="p-3 text-right text-blue-800 font-medium">
                      {row.lawyerMin === row.lawyerMax
                        ? formatYen(row.lawyerMin)
                        : `${formatYen(row.lawyerMin)}〜${formatYen(row.lawyerMax)}`}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3 rounded-bl-lg text-gray-800">
                    合計（過失割合適用前）
                  </td>
                  <td className="p-3 text-right text-gray-800">
                    {formatYen(result.totalJibaisekiBefore)}
                  </td>
                  <td className="p-3 text-right rounded-br-lg text-blue-800">
                    {formatYen(result.totalLawyerMinBefore)}〜
                    {formatYen(result.totalLawyerMaxBefore)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* 後遺障害注記 */}
          {result.residualDisabilityNote && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
              ⚠️ {result.residualDisabilityNote}
            </p>
          )}

          {/* 休業損害注記 */}
          {result.workLossNote.includes("\n") && (
            <p className="mt-3 text-xs text-blue-700 bg-blue-50 rounded-lg p-3">
              ℹ️{" "}
              {result.workLossNote
                .split("\n")
                .filter((_, i) => i > 0)
                .join("")}
            </p>
          )}
        </div>
      </div>

      {/* AI解説 */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span> AI解説
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Claude AIがこの計算結果について解説します（参考情報であり、法的アドバイスではありません）
        </p>

        <div className="space-y-4">
          {/* 簡易解説ボタン */}
          <div>
            <button
              onClick={() => fetchExplanation("simple")}
              disabled={loadingSimple}
              className="w-full sm:w-auto bg-gray-700 hover:bg-gray-800 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
            >
              {loadingSimple ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  生成中...
                </>
              ) : (
                <>💬 簡易解説を見る</>
              )}
            </button>

            {errorSimple && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                ❌ {errorSimple}
              </p>
            )}

            {simpleExplanation && (
              <div className="mt-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
                <div className="text-xs text-gray-400 mb-2">
                  Claude Haiku による簡易解説
                </div>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {simpleExplanation}
                </p>
              </div>
            )}
          </div>

          {/* 詳しい解説ボタン */}
          <div>
            <button
              onClick={() => fetchExplanation("detailed")}
              disabled={loadingDetailed}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-3 px-6 rounded-xl transition-all flex items-center gap-2"
            >
              {loadingDetailed ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  生成中...
                </>
              ) : (
                <>📝 詳しい解説を見る</>
              )}
            </button>

            {errorDetailed && (
              <p className="mt-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
                ❌ {errorDetailed}
              </p>
            )}

            {detailedExplanation && (
              <div className="mt-3 bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div className="text-xs text-blue-400 mb-2">
                  Claude Sonnet による詳しい解説
                </div>
                <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                  {detailedExplanation}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 免責事項 */}
        <div className="mt-6 text-xs text-gray-400 bg-gray-50 rounded-lg p-3">
          ⚠️ この計算結果およびAI解説は参考情報です。実際の慰謝料は個別の事情により異なります。正確な判断は弁護士にご相談ください。
        </div>
      </div>
    </div>
  );
}
