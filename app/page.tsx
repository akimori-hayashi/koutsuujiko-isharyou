"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CalculatorForm from "@/components/CalculatorForm";
import ResultDisplay from "@/components/ResultDisplay";
import ShareButton from "@/components/ShareButton";
import {
  CalculatorInput,
  CalculationResult,
  calculate,
  InjuryLevel,
  Occupation,
} from "@/lib/calculator";

const defaultInput: CalculatorInput = {
  injuryLevel: "軽傷",
  hospitalizationDays: 0,
  outpatientDays: 30,
  workLossDays: 0,
  faultPercentage: 0,
  age: 30,
  occupation: "会社員",
};

function MainContent() {
  const searchParams = useSearchParams();
  const [input, setInput] = useState<CalculatorInput>(defaultInput);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [hasCalculated, setHasCalculated] = useState(false);

  // URLパラメータから入力値を復元
  useEffect(() => {
    const injuryLevel = searchParams.get("injuryLevel") as InjuryLevel | null;
    const hospitalizationDays = searchParams.get("hospitalizationDays");
    const outpatientDays = searchParams.get("outpatientDays");
    const workLossDays = searchParams.get("workLossDays");
    const faultPercentage = searchParams.get("faultPercentage");
    const age = searchParams.get("age");
    const occupation = searchParams.get("occupation") as Occupation | null;

    const validInjuryLevels: InjuryLevel[] = [
      "軽傷",
      "中程度",
      "重傷",
      "後遺障害",
    ];
    const validOccupations: Occupation[] = [
      "会社員",
      "自営業",
      "主婦(主夫)",
      "学生",
      "無職",
    ];

    if (
      injuryLevel &&
      validInjuryLevels.includes(injuryLevel) &&
      hospitalizationDays !== null &&
      outpatientDays !== null
    ) {
      const restoredInput: CalculatorInput = {
        injuryLevel,
        hospitalizationDays: Math.max(0, parseInt(hospitalizationDays) || 0),
        outpatientDays: Math.max(0, parseInt(outpatientDays) || 0),
        workLossDays: Math.max(0, parseInt(workLossDays || "0") || 0),
        faultPercentage: Math.min(
          100,
          Math.max(0, parseInt(faultPercentage || "0") || 0)
        ),
        age: Math.max(0, parseInt(age || "30") || 30),
        occupation:
          occupation && validOccupations.includes(occupation)
            ? occupation
            : "会社員",
      };

      setInput(restoredInput);
      // URLパラメータがある場合は自動計算
      const calcResult = calculate(restoredInput);
      setResult(calcResult);
      setHasCalculated(true);
    }
  }, [searchParams]);

  const handleCalculate = () => {
    const calcResult = calculate(input);
    setResult(calcResult);
    setHasCalculated(true);

    // 結果にスクロール
    setTimeout(() => {
      document
        .getElementById("result-section")
        ?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <main className="min-h-screen py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* ヘッダー */}
        <div className="text-center">
          <div className="text-4xl mb-2">🚗</div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            交通事故慰謝料計算ツール
          </h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">
            自賠責基準・弁護士基準で慰謝料の相場を計算し、
            <br className="hidden sm:block" />
            AIが結果をわかりやすく解説します
          </p>
        </div>

        {/* 注意書き */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">⚠️ ご利用前に必ずお読みください</p>
          <p>
            この計算ツールは概算値を算出するものであり、法的アドバイスを提供するものではありません。
            実際の慰謝料は個別の事情により大きく異なります。正確な判断は弁護士にご相談ください。
          </p>
        </div>

        {/* 入力フォーム */}
        <CalculatorForm
          input={input}
          onChange={setInput}
          onCalculate={handleCalculate}
        />

        {/* 結果表示 */}
        {hasCalculated && result && (
          <div id="result-section" className="space-y-6">
            <ResultDisplay result={result} input={input} />
            <ShareButton input={input} />
          </div>
        )}

        {/* フッター */}
        <footer className="text-center text-xs text-gray-400 pb-4">
          <p>
            計算結果は参考値です。実際の慰謝料は弁護士等の専門家にご相談ください。
          </p>
          <p className="mt-1">
            自賠責基準: 入通院1日4,300円、休業1日6,100円
          </p>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-gray-500">読み込み中...</div>
        </div>
      }
    >
      <MainContent />
    </Suspense>
  );
}
