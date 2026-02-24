import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { mode, calculationData } = body;

    if (!mode || !calculationData) {
      return NextResponse.json(
        { error: "mode と calculationData は必須です" },
        { status: 400 }
      );
    }

    if (mode !== "simple" && mode !== "detailed") {
      return NextResponse.json(
        { error: "mode は 'simple' または 'detailed' を指定してください" },
        { status: 400 }
      );
    }

    const {
      injuryLevel,
      hospitalizationDays,
      outpatientDays,
      workLossDays,
      faultPercentage,
      age,
      occupation,
      totalJibaisekiAfter,
      totalLawyerMinAfter,
      totalLawyerMaxAfter,
    } = calculationData;

    const contextText = `
【入力情報】
- 傷害の程度: ${injuryLevel}
- 入院日数: ${hospitalizationDays}日
- 通院日数: ${outpatientDays}日
- 休業日数: ${workLossDays}日
- 過失割合: ${faultPercentage}%
- 年齢: ${age}歳
- 職業: ${occupation}

【計算結果】
- 自賠責基準（過失割合適用後）: 約${Math.round(totalJibaisekiAfter / 10000)}万円
- 弁護士基準（過失割合適用後）: 約${Math.round(totalLawyerMinAfter / 10000)}万円〜${Math.round(totalLawyerMaxAfter / 10000)}万円
    `.trim();

    if (mode === "simple") {
      // 簡易解説: Claude Haiku
      const response = await client.messages.create({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: `以下の交通事故慰謝料計算結果について、2〜3文で簡潔に解説してください。弁護士への相談の必要性も一言触れてください。

${contextText}`,
          },
        ],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ explanation: text });
    } else {
      // 詳しい解説: Claude Sonnet
      const response = await client.messages.create({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: `以下の交通事故慰謝料計算結果について、400文字程度で詳しく解説してください。
以下の点を含めてください：
1. 計算結果の妥当性（自賠責基準と弁護士基準の差について）
2. 弁護士に相談すべきかの判断基準
3. 増額の可能性（弁護士介入による増額の可能性）
4. 注意点（示談交渉での注意事項など）

${contextText}`,
          },
        ],
      });

      const text =
        response.content[0].type === "text" ? response.content[0].text : "";
      return NextResponse.json({ explanation: text });
    }
  } catch (error) {
    console.error("API error:", error);

    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        {
          error: `Anthropic API エラー: ${error.message}`,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { error: "解説の生成中にエラーが発生しました" },
      { status: 500 }
    );
  }
}
