const {
  loadEnv,
  enableReqeustLogger,
  sendNotification,
  buildInitialModalView,
  buildSecondModalView,
  toPrettfiedJSONString,
  ModalViewBlocks,
} = require("./utils");

// ------------------------------------------------------
// *** Slask アプリの設定 ***

// OAuth & Permissions
//  - ブラウザで Slack ワークスペースにログインした状態 https://slack.com/signin で https://api.slack.com/apps にアクセスしてください
//  - OAuth & Permissions のページに移動します
//  - Bot token scopes で commands, chat:write, chat:write.public, im:write を追加してください
//  - ワークスペースにこの Slack アプリをインストールします

// 以下の設定を .env.sample をコピーしてつくった .env に設定します
//   - SLACK_BOT_TOKEN (Settings > Install App で確認できます)
//   - SLACK_SIGNING_SECRET (Settings > Basic Information > App Credentials > Signing Secret で確認できます)
loadEnv();

const { App } = require("@slack/bolt");

// App は Slack アプリを抽象化したクラスです。この App のインスタンスは、
// ミドルウェア（共通処理）やリスナー関数を登録したり、ローカルで Web サーバープロセスを立ち上げるために使われます。
const app = new App({
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  token: process.env.SLACK_BOT_TOKEN,
  logLevel: 'debug',
});
enableReqeustLogger(app);

// npm run local (nodemon がファイルの変更を検知してくれます)
(async () => {
  await app.start(process.env.PORT || 3000); // POST http://localhost:3000/slack/events
  console.log("⚡️ Bolt app is running!");
})();

// ------------------------------------------------------
// *** グローバルショートカットとモーダル ***

// https://api.slack.com/apps で Interactivity & Shortcuts へ移動します
//  - この機能を有効にして　Request URL に https://{あなたのドメイン}/slack/events) を設定します
//  - Callback ID に new-helpdesk-request を指定したグローバルショートカットを作成して保存します

// ------------------------------------------------------
// ここではグローバルショートカットの実行時に呼び出されるリスナー関数を定義します
app.shortcut("new-helpdesk-request", async ({ logger, client, body, ack }) => {

  // -------------------------------
  // ここで Slack からのリクエストを受け付けて 200 OK をさっさと返してしまいます
  // https://api.slack.com/interactivity/handling#acknowledgment_response
  await ack();

  // -------------------------------
  // 最初のステップであるカテゴリ選択のモーダルを開きます
  // https://api.slack.com/methods/views.open
  // https://api.slack.com/block-kit-builder
  // ./modals/step1.json
  const step1ModalView = buildInitialModalView("helpdesk-request-modal");
  logger.info(toPrettfiedJSONString(step1ModalView));

  const res = await client.views.open({
    "trigger_id": body.trigger_id,
    "view": step1ModalView,
  });
  logger.info("views.open response:\n\n" + toPrettfiedJSONString(res) + "\n");

});

// -------------------------------
// カテゴリが選択されたときに呼び出されるリスナー関数を定義します
app.action("helpdesk-request-modal-category-selection", async ({ ack, action, body, logger, client }) => {

  // -------------------------------
  // Slack からのリクエストを受け付けて 200 OK をさっさと返してしまいます
  // https://api.slack.com/interactivity/handling#acknowledgment_response
  await ack();

  // -------------------------------
  // 最初のステップを表示していたモーダルを書き換えて、カテゴリに対応する入力フォームを表示します
  // https://api.slack.com/methods/views.update
  // https://api.slack.com/block-kit-builder
  // ./modals/step2.json
  const category = action.selected_option.value;
  const privateMetadata = JSON.stringify({ "category": category }); // category value
  const blocks = [];
  if (category === "laptop") {
    for (block of [
      ModalViewBlocks.header("PC に関する申請画面です。"),
      ModalViewBlocks.title("PC の交換申請"),
      ModalViewBlocks.laptopModel(),
    ]) blocks.push(block);
  } else if (category === "mobile") {
    for (block of [
      ModalViewBlocks.header("モバイル端末に関する申請画面です。"),
      ModalViewBlocks.title("モバイル端末の交換申請"),
      ModalViewBlocks.mobileOS(),
      ModalViewBlocks.approver(),
      ModalViewBlocks.dueDate(),
    ]) blocks.push(block);
  } else if (category === "other") {
    for (block of [
      ModalViewBlocks.header("できるだけ詳細な情報を添えて送信いただくようご協力をお願いします。"),
      ModalViewBlocks.title(""),
      ModalViewBlocks.description(),
    ]) blocks.push(block);
  } else {
    throw new Exception(`Unknown category type detected (${category})`);
  }

  const step2ModalView = buildSecondModalView("helpdesk-request-modal", blocks, privateMetadata);
  logger.info(toPrettfiedJSONString(step2ModalView));

  const res = await client.views.update({
    view_id: body.view.id,
    hash: body.view.hash,
    view: step2ModalView,
  });
  logger.info("views.open response:\n\n" + toPrettfiedJSONString(res) + "\n");

});

// -------------------------------
// 「カテゴリ選択に戻る」ボタンを押したときに実行されるリスナー関数を定義します
app.action("helpdesk-request-modal-reset", async ({ ack, body, logger, client }) => {

  // -------------------------------
  // Slack からのリクエストを受け付けて 200 OK をさっさと返してしまいます
  // https://api.slack.com/interactivity/handling#acknowledgment_response
  await ack();

  // -------------------------------
  // 入力フォームを表示していたモーダルを書き換えて、カテゴリ選択画面に戻します
  // https://api.slack.com/methods/views.update
  // https://api.slack.com/block-kit-builder
  // ./modals/step1.json
  const step1ModalView = buildInitialModalView("helpdesk-request-modal");
  logger.info(toPrettfiedJSONString(step1ModalView));

  const res = await client.views.update({
    view_id: body.view.id,
    hash: body.view.hash,
    view: step1ModalView,
  });
  logger.info("views.open response:\n\n" + toPrettfiedJSONString(res) + "\n");
});

// -------------------------------
// モーダルの「送信」ボタンが押されたときに呼び出されるリスナー関数を定義します
app.view("helpdesk-request-modal", async ({ logger, client, body, ack }) => {

  // -------------------------------
  // ペイロードから input タイプのブロックでユーザーが入力した情報を抽出します
  // https://api.slack.com/reference/interaction-payloads/views#view_submission
  const values = body.view.state.values;
  logger.info(`view.state.values: ${toPrettfiedJSONString(values)}`);

  // values[blockId][actionId].value/selected_*
  const actionId = "element";
  const title = values["title"] ? values["title"][actionId].value : undefined;
  const laptopModel = values["laptop-model"] ? values["laptop-model"][actionId].selected_option.value : undefined;
  const os = values["os"] ? values["os"][actionId].selected_option.value : undefined;
  const description = values["description"] ? values["description"][actionId].value : undefined;
  const dueDate = values["due-date"] ? values["due-date"][actionId].selected_date : undefined;
  const approver = values["approver"] ? values["approver"][actionId].selected_user : undefined;

  // -------------------------------
  // 入力値のバリデーションを実行します
  // https://api.slack.com/surfaces/modals/using#displaying_errors
  const errors = {};
  if (typeof title !== "undefined" && title.length <= 5) {
    errors["title"] = "件名は 6 文字以上で入力してください";
  }
  if (typeof dueDate !== "undefined" && new Date(dueDate) < new Date()) {
    errors["due-date"] = "希望納品日は明日以降を指定してください";
  }
  if (typeof approver !== "undefined") {
    // In the case of Slack Conenct external user,
    let isValidApprover = true;
    try {
      const userInfo = await client.users.info({user: approver});
      const user = userInfo.user;
      logger.debug(`Approver user info: ${JSON.stringify(user)}`);
      if (user.is_app_user || user.is_owner || user.is_stranger) {
        isValidApprover = false;
      }
    } catch (e) {
      logger.info(e);
      isValidApprover = false;
    }
    if (!isValidApprover) {
      errors["approver"] = "このユーザーは承認者に指定できません";
    }
  }
  if (Object.entries(errors).length > 0) {
    // モーダル内に対応するエラーメッセージを表示します
    await ack({
      response_action: 'errors',
      errors: errors
    });
    return;
  }

  // -------------------------------
  // 入力内容に問題がなかったので空のボディで 200 OK を返してモーダルを閉じます
  // https://api.slack.com/interactivity/handling#acknowledgment_response
  await ack();

  // TODO: 普通はここでデータベースに保存したりするでしょう
  const approverLink = approver ? `<@${approver}>` : "-";
  const message = `*件名*: ${title}\n*PC モデル*: ${laptopModel || "-"}\n*モバイル OS*: ${os || "-"}\n*概要*: ${description || "-"}\n*納品希望日*: ${dueDate || "-"}\n*承認者*: ${approverLink}`;
  logger.info(message);

  // -------------------------------
  // ヘルプデスクチームのチャンネル、申請者との DM、承認者との DM にそれぞれメッセージを送信します
  // https://api.slack.com/methods/chat.postMessage
  // https://api.slack.com/methods/conversations.open
  const submitter = body.user.id;
  const helpdeskTeamTriageChannel = "#general"; // TODO: ヘルプデスクチームのチャンネルに変える
  // const helpdeskTeamTriageChannel = "#triage-helpdesk";
  await sendNotification(
    client,
    helpdeskTeamTriageChannel,
    `:new: *新着申請* :new:\n<@${submitter}> から新しい申請がありました:\n${message}`
  );
  await sendNotification(
    client,
    submitter,
    `*ありがとうございます！* :bow:\n以下の申請を受け付けました。内容を確認後、ご連絡します。\n${message}`
  );
  await sendNotification(
    client,
    approver,
    `:wave: ヘルプデスクチームよりご連絡です。<@${submitter}> さんからの申請を進めるのは *あなたの承認* が必要です。お手数ですが、ご確認をお願いいたします。\n${message}`
  );

  // -------------------------------
  // おまけ: 送信者の Home タブを更新します
  // これを動作させるには Home タブの機能を　App Home の設定画面で有効にしておく必要があります

  // メモリ上の擬似データベースに、ここで受け付けた新しい申請を追加します
  submissions[submitter] = submissions[submitter] || []
  submissions[submitter].push(message)

  // データベース内のユーザに紐づく情報を取り出して Home タブの表示内容を組み立てます
  const blocks = []
  for (msg of submissions[submitter]) {
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": msg
      }
    });
    blocks.push({ "type": "divider" });
  }
  await client.views.publish({
    user_id: submitter,
    view: {
      "type": "home",
      "blocks": blocks,
    }
  });
});

// これは Home タブの表示をデモするためだけの擬似データベースです ({user: [message]})
const submissions = {};
