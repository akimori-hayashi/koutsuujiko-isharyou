# 交通事故慰謝料計算ツール

交通事故の慰謝料相場を自賠責基準・弁護士基準で計算し、Claude AIが結果を解説するWebアプリケーションです。

## 機能

- **慰謝料計算**: 入通院日数・休業日数・過失割合などをもとに自賠責基準・弁護士基準で計算
- **AI解説**: Claude Haiku（簡易解説）/ Claude Sonnet（詳細解説）による計算結果の解説
- **URLシェア**: 入力内容をURLパラメータに含めて共有可能

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **スタイリング**: Tailwind CSS
- **AI**: Anthropic API (Claude Haiku / Claude Sonnet)
- **デプロイ**: Vercel

## セットアップ手順

### 1. リポジトリのクローン

```bash
git clone <repository-url>
cd koutsuujiko-isharyou
```

### 2. 依存パッケージのインストール

```bash
npm install
```

### 3. 環境変数の設定

`.env.local` ファイルを作成し、Anthropic APIキーを設定します：

```bash
cp .env.local.example .env.local
```

`.env.local` を編集：

```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

**APIキーの取得方法:**
1. [Anthropic Console](https://console.anthropic.com/) にアクセス
2. アカウントを作成/ログイン
3. API Keys ページで新しいキーを作成

### 4. ローカル開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開くと動作を確認できます。

## Vercelデプロイ手順

### 方法1: Vercel CLIを使用

```bash
npm install -g vercel
vercel login
vercel
```

### 方法2: GitHubとVercelを連携

1. GitHubにリポジトリをプッシュ
2. [Vercel Dashboard](https://vercel.com/dashboard) にアクセス
3. "New Project" をクリック
4. GitHubリポジトリを選択
5. **Framework Preset: Next.js** を選択（自動検出されます）
6. **Environment Variables** に以下を追加：
   - Name: `ANTHROPIC_API_KEY`
   - Value: あなたのAnthropicAPIキー
7. "Deploy" をクリック

### 環境変数の設定（Vercel Dashboard）

1. Vercelプロジェクトの設定ページを開く
2. "Settings" → "Environment Variables" に移動
3. 以下の変数を追加：
   | Name | Value |
   |------|-------|
   | `ANTHROPIC_API_KEY` | `sk-ant-...`（あなたのAPIキー） |
4. "Production"、"Preview"、"Development" 環境すべてにチェック
5. "Save" をクリック
6. 再デプロイ

## 使い方

1. **傷害の程度**を選択（軽傷・中程度・重傷・後遺障害）
2. **入院日数**・**通院日数**・**休業日数**を入力
3. **過失割合**をスライダーで設定（0〜100%）
4. **年齢**・**職業**を入力
5. **「慰謝料を計算する」**ボタンをクリック
6. 計算結果が表示されたら：
   - **「簡易解説を見る」**: Claude Haikuが2〜3文で簡潔に解説
   - **「詳しい解説を見る」**: Claude Sonnetが400文字程度で詳細解説
   - **「URLをコピー」**: 入力内容を含むURLをクリップボードにコピー

## 計算方法

### 入通院慰謝料

| 基準 | 計算方法 |
|------|----------|
| 自賠責基準 | (入院日数 + 通院日数) × 4,300円 |
| 弁護士基準 | 傷害の程度・日数に応じた相場表（慰謝料算定表）を参照 |

### 休業損害

| 基準 | 計算方法 |
|------|----------|
| 自賠責基準 | 休業日数 × 6,100円 |

### 後遺障害慰謝料（後遺障害選択時）

| 等級 | 弁護士基準 |
|------|-----------|
| 14級 | 110万円 |
| 12級 | 290万円 |
| 10級 | 550万円 |
| 9級  | 690万円 |

### 過失割合による減額

最終的な慰謝料額 = 計算額 × (1 - 過失割合%)

## 注意事項

- この計算ツールは参考値を提供するものです
- 実際の慰謝料は個別の事情により大きく異なります
- 法的アドバイスが必要な場合は弁護士にご相談ください
- APIキーは環境変数で管理し、フロントエンドには露出させていません

## ファイル構成

```
├── app/
│   ├── api/
│   │   └── explain/
│   │       └── route.ts    # Claude APIへのサーバーサイドルート
│   ├── page.tsx            # メインページ
│   ├── layout.tsx          # レイアウト
│   └── globals.css         # グローバルスタイル
├── components/
│   ├── CalculatorForm.tsx  # 入力フォーム
│   ├── ResultDisplay.tsx   # 計算結果表示
│   └── ShareButton.tsx     # URLシェアボタン
├── lib/
│   └── calculator.ts       # 計算ロジック
├── .env.local              # 環境変数（gitignore済み）
├── vercel.json             # Vercel設定
└── README.md               # このファイル
```
