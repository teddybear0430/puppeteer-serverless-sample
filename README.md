# Serverless Framework + Lambda + TypeScript + Puppeteerのサンプル

## 自分用メモ
コンテナ立ち上げて、node_modulesインストールしたら、、、   
アクセスキーとシークレットキーを設定する。
```
serverless config credentials --provider aws --key access_key --secret secret_key
```
これやらないとデプロイできない。

## できること
* Google検索を行い、検索したページのタイトルを取得
