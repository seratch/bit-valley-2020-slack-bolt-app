# Slack アプリ開発へようこそ！

このリポジトリは [BIT VALLEY 2020](https://2020.bit-valley.jp/session/298) のための用意されたデモアプリです。ショートカット、モーダルのようなインタラクティブな機能を [Bolt for JavaScript](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started) を使ってどのように実装すればよいかを学ぶためのサンプルとしてもご活用ください。

## このプロジェクトで実装しているアプリ

このプロジェクトは、ヘルプデスクチームが提供するアプリを想定したサンプルです。シンプルな実装ではありつつも、Slack プラットフォームの最新の機能をうまく活用しているので、これをベースに拡張することで実際に使えるアプリに進化させることができるでしょう。

以下のアニメーションで、どのようなアプリなのかをみてみましょう。

### ショートカットでモーダルを起動

エンドユーザーは、Slack の最下部の入力ボックスからショットカットを起動し、モーダルウィンドウを開くことができます。

<img src="https://user-images.githubusercontent.com/19658/92388356-1f1fa000-f152-11ea-81da-b632428400ec.gif" height=500>

### 複数画面を行き来できるモーダル

エンドユーザーは、このモーダル上でまずカテゴリを選択します。ユーザーがカテゴリを選択すると、モーダルは即座に自分自身の表示状態を切り替えて、選択されたカテゴリに対応した入力フォームを表示します。「カテゴリ選択に戻る」ボタンを押すと、一つ前の画面に戻ることもできます。

<img src="https://user-images.githubusercontent.com/19658/92388428-3a8aab00-f152-11ea-8f9d-389ed26facfd.gif" height=500>

### カスタムの入力チェック

このモーダルを送信すると、Slack の UI が標準で持っている必須入力チェックなどに加えて、サーバーサイドがカスタムの入力チェック処理を行います。ここでは件名の桁数と希望納品日が未来日かどうかのチェックをしています。

<img src="https://user-images.githubusercontent.com/19658/92388726-b97fe380-f152-11ea-9ff9-fc83213631d2.gif" height=500>

### 通知を送信

データ送信を受け付けたら、ヘルプデスクチームのチャンネルや関係者の DM にメッセージを送信することができます。

<img src="https://user-images.githubusercontent.com/19658/92389121-72462280-f153-11ea-8579-0ad7fe56b934.gif" height=500>

### ホームタブを更新

また、ホームタブというユーザーごとにカスタムの情報を表示できるエリアに、このユーザーのこれまでの申請履歴を表示しています。

<img src="https://user-images.githubusercontent.com/19658/92389194-9a358600-f153-11ea-80a5-b77fce2a85d7.gif" height=500>

## 使われている Slack プラットフォームの機能

このアプリは以下のような Slack プラットフォームの最新の機能を使って実装されています。

* **[ブロックキット](https://api.slack.com/block-kit):** ブロックキットはリッチなユーザーインターフェースを実装するための Slack の UI フレームワークです。Slack アプリの開発者の視点で見るとブロックキットは予め決められた JSON のデータ構造です。アプリ側がこれに従うことで Slack がデスクトップ・モバイルに最適な形でレンダリングします。
* **[ショートカット](https://api.slack.com/interactivity/shortcuts):** グローバルショートカットは Slack のどこからでも呼び出せる処理です。ユーザーは、最下部のメッセージ投稿 UI、または、最上部の検索メニューから呼び出すことができます。
* **[モーダル](https://api.slack.com/surfaces/modals):** モーダルはブロックキットを使って構成するポップアップウィンドウです。ユーザーから入力内容を収集したり、情報を整理された形で表示したりするために利用されます。また、複数のステップの遷移を実装したり、複数モーダルを重ねたりすることもできます。
* **[ホームタブ](https://api.slack.com/surfaces/tabs):** ユーザーごとに個別の情報を表示するためのエリアです。自分のタスクや予定を表示したり、ダッシュボードのようなものを表示するために利用されます。

## Bolt for JavaScript

[Bolt for JavaScript](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started) (ボルト) は、公式のフルスタックな Slack アプリ開発フレームワークです。全ての新しいプラットフォーム機能がサポートされており、また Slack アプリで必要となる非機能要件に予めフレームワーク側で対応しています：

* **Slack からのリクエストを検証:** Slack アプリのエンドポイントは公開された URL である必要があるため、受信したリクエストが本当に Slack からのリクエストかどうかを検証することはセキュリティのために重要です。Bolt を使うと Signing Secret の値を設定しておくだけで、この検証が自動的に有効になります。
* **リクエストを適切に分岐:** Slack からのリクエストを適切なリスナー関数に実行させます。Web アプリフレームワークのルーティング機能のようなインターフェースで簡単にこの分岐を設定することができます。
* **ペイロードの形式の差異を吸収:** 歴史的経緯から Slack API のペイロードの形式は機能によって若干異なりますが、Bolt はそれらを適切にパーズした上で、その内容をミドルウェアやリスナー関数に統一的な形式で引き渡します。
* **無限ループに陥らないように予め制御:** イベント API を使っていると、ボットユーザー自身の発言に再度反応して無限ループしてしまうという失敗がありがちですが、Bolt を使っていると予めループしないよう制御してくれます。
* **複数ワークスペース対応:** 開発用ワークスペース以外にもインストールできるアプリとして提供するために必要な OAuth フローの実装や、各リクエストごとに適切なトークンを選択するロジックを簡単に実装できる仕組みを提供しています。

このように Bolt を使うことで、アプリの本質的なロジック以外の様々なことへの対応がシンプルになります。

## このアプリを実装するための全ステップ

### プロジェクトをセットアップする

```bash
git clone git@github.com:seratch/bit-valley-2020-slack-bolt-app.git
cd bit-valley-2020-slack-bolt-app/
node --version # Node v10.13 かそれよりも新しいバージョンが必須です
npm i # 依存パッケージをインストール
code . # Visual Studio Code を使ってプロジェクトを開きます
```

### Slack アプリの設定を作る

https://api.slack.com/apps にブラウザでアクセスして、新しい Slack アプリの設定をつくります。

このブラウザで、[Slack ワークスペースにログインしているか確認し](https://slack.com/signin)、その上で先ほどの URL から Slack アプリを作ります。

### 必要な Bot Token Scopes を設定

アプリを作ったら **OAuth & Permissions** というページに遷移し、**Bot Token Scopes** というセクションまでスクロールします。そして、以下の権限を追加してください。

* [`commands`](https://api.slack.com/scopes/commands) は、新しいショートカットの追加に必要です。
* [`chat:write`](https://api.slack.com/scopes/chat:write) は [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) API というメッセージ投稿の API を使うために必要です。
* [`chat:write.public`](https://api.slack.com/scopes/chat:write.public) は、任意のパブリックチャンネルにボットユーザーを招待することなく [`chat.postMessage`](https://api.slack.com/methods/chat.postMessage) API を実行するために必要です。
* [`im:write`](https://api.slack.com/scopes/im:write) は [`conversations.open`](https://api.slack.com/methods/conversations.open) API という新しい DM を開始するための API を使うために必要です。

### ボットユーザーに適切な名前をつける

インストールする前に **App Home** ページで、ボットユーザーにわかりやすい名前をつけるとよいでしょう。 **Basic Information** の最下部でアプリのアイコンや説明をなどをカスタマイズすることもできます。

### ホームタブ機能を有効にする

デフォルトではホームタブの機能は有効になっていないので、 **App Home** ページで有効にしておいてください。

### アプリをワークスペースにインストールする

「Development Slack Workspace」で使用する限りにおいては、[OAuth フロー](https://api.slack.com/authentication/oauth-v2)を実装しなくても OAuth アクセストークンを発行して、アプリをそのワークスペースで有効化することができます。

**Install App** ページから、インストールボタンをクリックし、OAuth フローを完了させてください。戻ってきた画面で **Bot User OAuth Access Token** として表されているアクセストークンをアプリ起動時に指定します。

もし、複数ワークスペースにインストール可能なアプリを実装することに興味があれば、[Bolt for JavaScript のドキュメント](https://slack.dev/bolt-js/ja-jp/concepts#authenticating-oauth)を参考にしてみてください。

### Bolt アプリを立ち上げる

ローカルで Bolt アプリを起動するには、以下のステップに従ってください：

* プロジェクトのルートディレクトリに `.env` ファイルを作って、必要な情報を設定
* Node.js 10.13 かそれより新しいバージョンを使っているか確認 (`node --version`)
* `npm install` を実行して依存ライブラリをインストール
* `npm run local` を実行して、アプリを起動
* ngrok をインストールしていなければインストール - https://ngrok.com/
* 別のターミナルで `ngrok http 3000` を実行して公開エンドポイントを立ち上げる

#### .env を配置して Bot Token と Signing Secret を設定

```
SLACK_BOT_TOKEN=xoxb-111-111-xxx
SLACK_SIGNING_SECRET=xxx
```

#### ローカルアプリを起動

```bash
node --version # v10.13.0 以上
npm install
npm run local # 起動すると http://localhost:3000/slack/events でリクエストを受け付けます
```

#### ngrok を Slack からのリクエストをフォワードするために起動

[ngrok](https://ngrok.com/) をまだインストールしていなければ、ウェブサイトからダウンロードして設定します。以下のステップで、適切に設定できたか確認します。

```bash
# ローカルでアプリが立ち上がっていることを確認
curl -I -XPOST http://localhost:3000/slack/events # HTTP/1.1 401 Unauthorized が返ってくるはず

# 別のターミナルで実行
./ngrok http 3000

# ngrok の有償プランを使っているなら以下のように固定のサブドメインを指定できます
./ngrok http 3000 --subdomain {whatever-you-want}

# 再度、公開エンドポイントからリクエストをして、同じように 401 が返ってくるか確認
curl -I -XPOST https://{your random subdomain here}.ngrok.io/slack/events # HTTP/1.1 401 Unauthorized が返ってくれば OK
```

### Request URL を設定して、ショートカットを追加

* https://api.slack.comc/apps にアクセスしてアプリを選択
* **Interactivity & Shortcuts** ページへ移動
* Interactivy 機能が無効になっているのを有効にする
* `https://{your random subdomain here}.ngrok.io/slack/events` を Request URL として設定
* Global のショートカットを Callback ID: `new-helpdesk-request` で作成
* 最下部の **Save Changes** ボタンを押すのを忘れずに

### リスナー関数を実装する

このアプリでは以下のリスナー関数を実装しています。

* [グローバルショートカットのリスナー関数](https://slack.dev/bolt-js/ja-jp/concepts#shortcuts) を `new-helpdesk-request` という Callback ID に反応するよう設定
* [セレクトメニューでの選択に対するリスナー関数](https://slack.dev/bolt-js/ja-jp/concepts#action-listening) を `helpdesk-request-modal-category-selection` という Action ID に反応するよう設定
* [「カテゴリ選択へ戻る」ボタンクリックに対するリスナー関数](https://slack.dev/bolt-js/ja-jp/concepts#action-listening) を `helpdesk-request-modal-reset` という Action ID に反応するよう設定
* [モーダル送信に対するリスナー関数](https://slack.dev/bolt-js/ja-jp/concepts#view_submissions) を `helpdesk-request-modal` という Callback ID に反応するよう設定

#### 小技: Block Kit のプレビューツール

[ブロックキットビルダー](https://api.slack.com/block-kit-builder) というブラウザから使えるブロックキットのプレビューツールがあります。実際にアプリに `blocks` を組み込む前に、このツールを使って表示を調整すると効率的に UI を改善できるでしょう。

* [カテゴリ選択画面のモーダル](https://app.slack.com/block-kit-builder#%7B"type":"modal","callback_id":"helpdesk-request-modal","title":%7B"type":"plain_text","text":"ヘルプデスク申請"%7D,"close":%7B"type":"plain_text","text":"閉じる"%7D,"blocks":%5B%7B"type":"section","text":%7B"type":"mrkdwn","text":":wave:%20申請カテゴリを選んでください。"%7D%7D,%7B"type":"actions","elements":%5B%7B"type":"static_select","action_id":"helpdesk-request-modal-category-selection","options":%5B%7B"text":%7B"type":"plain_text","text":"PC"%7D,"value":"laptop"%7D,%7B"text":%7B"type":"plain_text","text":"モバイル端末"%7D,"value":"mobile"%7D,%7B"text":%7B"type":"plain_text","text":"その他"%7D,"value":"other"%7D%5D%7D%5D%7D%5D%7D)
* [申請内容の入力画面のモーダル](https://app.slack.com/block-kit-builder#%7B"type":"modal","callback_id":"helpdesk-request-modal","private_metadata":"%7B%5C"category%5C":%5C"mobile%5C"%7D","title":%7B"type":"plain_text","text":"ヘルプデスク申請"%7D,"submit":%7B"type":"plain_text","text":"送信"%7D,"close":%7B"type":"plain_text","text":"閉じる"%7D,"blocks":%5B%7B"type":"section","text":%7B"type":"mrkdwn","text":"モバイル端末に関する申請画面です。"%7D,"accessory":%7B"type":"button","action_id":"helpdesk-request-modal-reset","text":%7B"type":"plain_text","text":"カテゴリ選択に戻る"%7D,"value":"1"%7D%7D,%7B"type":"input","block_id":"title","label":%7B"type":"plain_text","text":"件名"%7D,"element":%7B"type":"plain_text_input","action_id":"element","initial_value":"モバイル端末の交換申請"%7D%7D,%7B"type":"input","block_id":"os","label":%7B"type":"plain_text","text":"モバイル端末の%20OS"%7D,"element":%7B"type":"static_select","action_id":"element","placeholder":%7B"type":"plain_text","text":"選択してください"%7D,"options":%5B%7B"text":%7B"type":"plain_text","text":"iOS"%7D,"value":"ios"%7D,%7B"text":%7B"type":"plain_text","text":"Android"%7D,"value":"android"%7D%5D%7D%7D,%7B"type":"input","block_id":"approver","label":%7B"type":"plain_text","text":"承認者"%7D,"element":%7B"type":"users_select","action_id":"element","placeholder":%7B"type":"plain_text","text":"承認者を選択してください（通常は直属の上司です）"%7D%7D%7D,%7B"type":"input","block_id":"due-date","element":%7B"type":"datepicker","action_id":"element"%7D,"label":%7B"type":"plain_text","text":"希望納品日（ご要望に添えない場合があります）","emoji":true%7D%7D%5D%7D)

## まとめ

* https://api.slack.com/apps から Slack アプリの設定を行います
  * そのブラウザで Slack ワークスペースにログインしている必要があります
* 必要な権限を設定する
  * "OAuth & Permissions" ページで Bot Token Scopes を設定します
  * Interactivity, Events Subscriptions, Home tab 等の機能を有効にします
* Development Slack Workspace にアプリをインストールします
  * "Bot User OAuth Access Token" を取得します
* Bolt アプリをローカルで作成します
  * `SLACK_BOT_TOKEN`, `SLACK_SIGNING_SECRET` という環境変数、または .env ファイルを設定します
  * `app.start()` で Web サーバープロセスを起動します
  * デフォルトでは `POST http://localhost:3000/slack/events` で全てのリクエストを受けます
* 公開されたエンドポイントを設定して、Slack からのリクエストを受け付けられるようにします
  * ngrok かその他類似のソリューションを使います
* 必要なリスナー関数を実装します
  * ngrok を使っているなら `http://localhost:4040` を確認すると捗るでしょう
  * 標準出力にエラーメッセージが出ていることもあります
  * Bolt for JS のドキュメントは全て[日本語化されています](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started)
* Slack アプリ開発を楽しんでください！

# ライセンス

The MIT License

自由に fork して、カスタマイズ・再利用してください！
