# VIVANT 組織紹介ページ

## 表示方法

`people.json` を読み込むため、プロジェクトのフォルダでローカルサーバーを起動します。

```bash
python3 -m http.server 8000
```

ブラウザで `http://localhost:8000/` を開いてください。`index.html` を直接ダブルクリックして開くと、ブラウザの制限で JSON を読み込めません。

## 人物・所属の編集

[`people.json`](people.json) の各人物の `name`（表示名）、`nameEn`（ローマ字名）、`affiliation`（所属）、`role`（役割）を編集します。所属と役割は全角スペースでつないで表示されます。人物の追加・削除は配列の項目を増減するだけで反映されます。`id` は重複させず、画像の `imageThumb` と `imageLarge` は既存ファイルへの相対パスにしてください。`sourceFile` は元写真との対応を記録するための任意項目です。

背景を除いた素材は `Images_Cutout/`、元写真は `Images_Base/`、タイトル画面のポスターは `Images_Poster/` にあります。
