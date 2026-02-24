export type InjuryLevel = "軽傷" | "中程度" | "重傷" | "後遺障害";
export type Occupation =
  | "会社員"
  | "自営業"
  | "主婦(主夫)"
  | "学生"
  | "無職";

export interface CalculatorInput {
  injuryLevel: InjuryLevel;
  hospitalizationDays: number;
  outpatientDays: number;
  workLossDays: number;
  faultPercentage: number;
  age: number;
  occupation: Occupation;
}

export interface CompensationBreakdown {
  label: string;
  jibaiseki: number;
  lawyerMin: number;
  lawyerMax: number;
}

export interface CalculationResult {
  // 入通院慰謝料
  medicalJibaiseki: number;
  medicalLawyerMin: number;
  medicalLawyerMax: number;

  // 休業損害
  workLossJibaiseki: number;
  workLossNote: string;

  // 後遺障害慰謝料
  residualDisabilityAmount: number;
  residualDisabilityNote: string;

  // 合計（過失割合適用前）
  totalJibaisekiBefore: number;
  totalLawyerMinBefore: number;
  totalLawyerMaxBefore: number;

  // 過失割合適用後
  totalJibaisekiAfter: number;
  totalLawyerMinAfter: number;
  totalLawyerMaxAfter: number;

  // 内訳
  breakdown: CompensationBreakdown[];

  faultPercentage: number;
}

// 弁護士基準の入通院慰謝料テーブル（概算）
function calcLawyerMedical(
  injuryLevel: InjuryLevel,
  hospitalizationDays: number,
  outpatientDays: number
): { min: number; max: number } {
  const totalDays = hospitalizationDays + outpatientDays;

  switch (injuryLevel) {
    case "軽傷":
      if (totalDays <= 30) return { min: 200000, max: 530000 };
      if (totalDays <= 60) return { min: 370000, max: 690000 };
      if (totalDays <= 90) return { min: 490000, max: 830000 };
      if (totalDays <= 120) return { min: 600000, max: 970000 };
      if (totalDays <= 150) return { min: 700000, max: 1000000 };
      return { min: 800000, max: 1000000 };

    case "中程度":
      if (totalDays <= 30) return { min: 530000, max: 1000000 };
      if (totalDays <= 60) return { min: 690000, max: 1360000 };
      if (totalDays <= 90) return { min: 830000, max: 1580000 };
      if (totalDays <= 120) return { min: 970000, max: 1750000 };
      if (totalDays <= 180) return { min: 1150000, max: 2000000 };
      return { min: 1300000, max: 2000000 };

    case "重傷":
      if (totalDays <= 30) return { min: 1000000, max: 1650000 };
      if (totalDays <= 60) return { min: 1360000, max: 2190000 };
      if (totalDays <= 90) return { min: 1580000, max: 2650000 };
      if (totalDays <= 120) return { min: 1750000, max: 3060000 };
      if (totalDays <= 180) return { min: 2000000, max: 3660000 };
      if (totalDays <= 240) return { min: 2290000, max: 4000000 };
      return { min: 2500000, max: 4000000 };

    case "後遺障害":
      if (totalDays <= 60) return { min: 1360000, max: 2190000 };
      if (totalDays <= 120) return { min: 1750000, max: 3060000 };
      if (totalDays <= 180) return { min: 2000000, max: 3660000 };
      if (totalDays <= 240) return { min: 2290000, max: 4000000 };
      if (totalDays <= 300) return { min: 2520000, max: 4260000 };
      return { min: 2800000, max: 5000000 };

    default:
      return { min: 500000, max: 1000000 };
  }
}

// 後遺障害慰謝料（弁護士基準の代表的な等級）
function getResidualDisabilityAmount(injuryLevel: InjuryLevel): {
  amount: number;
  note: string;
} {
  if (injuryLevel !== "後遺障害") {
    return { amount: 0, note: "" };
  }
  // 後遺障害の場合、複数の等級があるため代表例を提示
  // ここでは14級（最軽度）〜10級の範囲を代表値として示す
  return {
    amount: 1100000, // 14級相当（最軽度）を基準とした下限値
    note: "後遺障害等級により異なります（14級:110万円、12級:290万円、10級:550万円、9級:690万円、7級:1000万円以上）",
  };
}

export function calculate(input: CalculatorInput): CalculationResult {
  const {
    injuryLevel,
    hospitalizationDays,
    outpatientDays,
    workLossDays,
    faultPercentage,
    occupation,
  } = input;

  // 1. 入通院慰謝料（自賠責基準）
  const totalMedDays = hospitalizationDays + outpatientDays;
  const medicalJibaiseki = totalMedDays * 4300;

  // 2. 入通院慰謝料（弁護士基準）
  const lawyerMedical = calcLawyerMedical(
    injuryLevel,
    hospitalizationDays,
    outpatientDays
  );

  // 3. 休業損害（自賠責基準）
  const workLossJibaiseki = workLossDays * 6100;
  let workLossNote = `自賠責基準: 1日6,100円 × ${workLossDays}日`;
  if (occupation === "会社員" || occupation === "自営業") {
    workLossNote +=
      "\n※実際の収入に基づく計算も可能です（源泉徴収票等が必要）";
  } else if (occupation === "主婦(主夫)") {
    workLossNote +=
      "\n※主婦(主夫)の場合、賃金センサスの女性全年齢平均を基準に計算可能です";
  }

  // 4. 後遺障害慰謝料
  const residualInfo = getResidualDisabilityAmount(injuryLevel);

  // 5. 合計（過失割合適用前）
  const totalJibaisekiBefore =
    medicalJibaiseki + workLossJibaiseki + residualInfo.amount;
  const totalLawyerMinBefore =
    lawyerMedical.min + workLossJibaiseki + residualInfo.amount;
  const totalLawyerMaxBefore =
    lawyerMedical.max + workLossJibaiseki + residualInfo.amount;

  // 6. 過失割合による減額
  const myFaultRatio = faultPercentage / 100;
  const reductionRatio = 1 - myFaultRatio;
  const totalJibaisekiAfter = Math.round(
    totalJibaisekiBefore * reductionRatio
  );
  const totalLawyerMinAfter = Math.round(
    totalLawyerMinBefore * reductionRatio
  );
  const totalLawyerMaxAfter = Math.round(
    totalLawyerMaxBefore * reductionRatio
  );

  // 内訳テーブル
  const breakdown: CompensationBreakdown[] = [
    {
      label: "入通院慰謝料",
      jibaiseki: medicalJibaiseki,
      lawyerMin: lawyerMedical.min,
      lawyerMax: lawyerMedical.max,
    },
    {
      label: "休業損害",
      jibaiseki: workLossJibaiseki,
      lawyerMin: workLossJibaiseki,
      lawyerMax: workLossJibaiseki,
    },
  ];

  if (injuryLevel === "後遺障害") {
    breakdown.push({
      label: "後遺障害慰謝料（下限目安）",
      jibaiseki: residualInfo.amount,
      lawyerMin: residualInfo.amount,
      lawyerMax: residualInfo.amount * 5, // 重度後遺障害の場合の上限目安
    });
  }

  return {
    medicalJibaiseki,
    medicalLawyerMin: lawyerMedical.min,
    medicalLawyerMax: lawyerMedical.max,
    workLossJibaiseki,
    workLossNote,
    residualDisabilityAmount: residualInfo.amount,
    residualDisabilityNote: residualInfo.note,
    totalJibaisekiBefore,
    totalLawyerMinBefore,
    totalLawyerMaxBefore,
    totalJibaisekiAfter,
    totalLawyerMinAfter,
    totalLawyerMaxAfter,
    breakdown,
    faultPercentage,
  };
}

export function formatYen(amount: number): string {
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    const remainder = amount % 10000;
    if (remainder === 0) {
      return `${man.toLocaleString()}万円`;
    }
    return `${man.toLocaleString()}万${remainder.toLocaleString()}円`;
  }
  return `${amount.toLocaleString()}円`;
}
