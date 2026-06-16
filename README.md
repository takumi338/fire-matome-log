# FIREまとめログ prototype

FIREに関する2chまとめ風サイトの静的プロトタイプです。

- `index.html` をブラウザで開くだけで動きます。
- 初期掲載内容は転載ではなく、デザイン確認用の架空サンプルです。
- 検索、カテゴリ絞り込み、並び替え、人気記事、タグ、記事本文表示を実装しています。
- ヒーロー画像は built-in `image_gen` で生成し、`assets/hero-fire.png` に保存しています。

## 自動収集MVP

`npm run collect` で、設定済みソースからFIRE関連スレッドを収集し、面白そうなレスをスコアリングして下書き記事を生成します。

現在は `config/sources.json` で5ch投資一般板の `subject.txt` を有効化しています。`samples/fire-thread-sample.html` は `enabled: false` です。

```bash
npm run collect
```

生成先:

- `data/articles.generated.js`: サイトが読み込む下書き記事
- `articles/*.html`: 各スレッドの個別ページ
- `data/drafts/YYYY-MM-DD.json`: その日の下書き
- `data/raw/YYYY-MM-DD.json`: 収集元データの控え

取得元は `config/sources.json` で管理します。対象板やスレッドを変える場合は、規約と `robots.txt` を確認済みの実URLに差し替えてください。

## 毎日実行

- GitHub Actions: `.github/workflows/daily-fire-matome.yml`
- Mac cron例: `automation/crontab.example`

## 実運用時に確認するもの

- 引用元URLと削除依頼ページ
- 取得元の利用規約、転載可否、robots.txt
- 広告枠、関連記事、自動ランキング
- SEO用の個別記事ページ生成
