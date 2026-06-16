# 自動収集と下書き生成の運用メモ

## 基本方針

このMVPは、実サイトから取得した内容をそのまま全転載するのではなく、FIRE関連度が高いスレッドから短いレスを数件だけピックアップして下書き化します。公開前に人間が確認する前提です。

現在は5ch投資一般板の `subject.txt` を有効化しています。同梱サンプルは `enabled: false` です。

## 取得元の追加

`config/sources.json` の `sources` に取得元を追加します。

直接スレURLを指定する例:

```json
{
  "name": "FIRE thread",
  "type": "thread-html",
  "enabled": true,
  "url": "https://example.com/test/read.cgi/example/0000000000/"
}
```

スレ一覧ページから候補を探す例:

```json
{
  "name": "FIRE list",
  "type": "thread-list",
  "enabled": true,
  "url": "https://example.com/",
  "maxThreads": 5
}
```

## 実行

```bash
npm run collect
```

生成される主なファイル:

- `data/articles.generated.js`: サイトが読み込む下書き記事データ
- `articles/*.html`: 各スレッドの個別ページ
- `data/drafts/YYYY-MM-DD.json`: その日の下書き
- `data/raw/YYYY-MM-DD.json`: 収集結果の控え

## 毎日実行

GitHubで運用する場合は `.github/workflows/daily-fire-matome.yml` が毎日 07:15 JST に実行します。

Macで動かす場合は `automation/crontab.example` の行を `crontab -e` に登録してください。ログ出力するなら先に `logs/` を作ってください。

## 注意

- 取得前に `robots.txt` を確認し、`Disallow` されたURLは処理しません。
- 取得元の利用規約、転載可否、引用条件を確認してください。
- 引用元URL、削除依頼窓口、問い合わせ先は公開サイトに常設してください。
- 投資助言に見える断定表現は避け、体験談・掲示板反応として編集してください。
