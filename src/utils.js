exports.loadEnv = function () {
  // See https://github.com/motdotla/dotenv
  const config = require("dotenv").config().parsed;
  // Overwrite env variables anyways
  for (const k in config) {
    process.env[k] = config[k];
  }
};

function toPrettfiedJSONString(json) {
  return JSON.stringify(json, null, 2);
}

exports.toPrettfiedJSONString = toPrettfiedJSONString;

exports.enableReqeustLogger = function (app) {
  app.use(async (args) => {
    const copiedArgs = JSON.parse(JSON.stringify(args));
    copiedArgs.context.botToken = 'xoxb-***';
    if (copiedArgs.context.userToken) {
      copiedArgs.context.userToken = 'xoxp-***';
    }
    copiedArgs.client = {};
    copiedArgs.logger = {};
    args.logger.info(
      "\n" +
      "---------------\n" +
      "   Context\n" +
      "---------------\n" +
      toPrettfiedJSONString(copiedArgs.context) +
      "\n"
    );
    args.logger.info(
      "\n" +
      "---------------\n" +
      "   Payload\n" +
      "---------------\n" +
      toPrettfiedJSONString(copiedArgs.body) +
      "\n"
    );
    const result = await args.next();
    return result;
  });
};

exports.sendNotification = async function (client, userIdOrChannelId, text) {
  if (typeof userIdOrChannelId !== "undefined") {
    if (userIdOrChannelId.startsWith("U") || userIdOrChannelId.startsWith("W")) {
      const userId = userIdOrChannelId;
      const botDm = await client.conversations.open({ users: userId })
      await client.chat.postMessage({
        channel: botDm.channel.id,
        text: text,
      });
    } else {
      const channelId = userIdOrChannelId;
      await client.chat.postMessage({
        channel: channelId,
        text: text,
      });
    }
  }
};


exports.buildInitialModalView = function (callbackId) {
  return {
    "type": "modal",
    "callback_id": callbackId,
    "title": {
      "type": "plain_text",
      "text": "ヘルプデスク申請"
    },
    "close": {
      "type": "plain_text",
      "text": "閉じる"
    },
    "blocks": [
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": ":wave: 申請カテゴリを選んでください。"
        }
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "static_select",
            "action_id": "helpdesk-request-modal-category-selection",
            "options": [
              {
                "text": {
                  "type": "plain_text",
                  "text": "PC"
                },
                "value": "laptop"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "モバイル端末"
                },
                "value": "mobile"
              },
              {
                "text": {
                  "type": "plain_text",
                  "text": "その他"
                },
                "value": "other"
              }
            ]
          }
        ]
      }
    ]
  };
}

exports.buildSecondModalView = function (callbackId, blocks, privateMetadata) {
  return {
    "type": "modal",
    "callback_id": callbackId,
    "private_metadata": privateMetadata,
    "title": {
      "type": "plain_text",
      "text": "ヘルプデスク申請"
    },
    "submit": {
      "type": "plain_text",
      "text": "送信"
    },
    "close": {
      "type": "plain_text",
      "text": "閉じる"
    },
    "blocks": blocks
  };
};

class ModalViewBlocks {

  static header(text) {
    return {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": text
      },
      "accessory": {
        "type": "button",
        "action_id": "helpdesk-request-modal-reset",
        "text": {
          "type": "plain_text",
          "text": "カテゴリ選択に戻る"
        },
        "value": "1"
      }
    };
  };

  static title(initialValue) {
    return {
      "type": "input",
      "block_id": "title",
      "label": {
        "type": "plain_text",
        "text": "件名"
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "element",
        "initial_value": initialValue
      }
    };
  };

  static laptopModel() {
    return {
      "type": "input",
      "block_id": "laptop-model",
      "label": {
        "type": "plain_text",
        "text": "PC モデル"
      },
      "element": {
        "type": "static_select",
        "action_id": "element",
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "MacBook Pro (16-inch, 2019)"
            },
            "value": "MacBookPro16,1"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "MacBook Pro (13-inch, 2019, Two Thunderbolt 3 ports)"
            },
            "value": "MacBookPro15,4"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Surface Book 3 for Business"
            },
            "value": "SurfaceBook3"
          }
        ]
      }
    };
  };

  static mobileOS() {
    return {
      "type": "input",
      "block_id": "os",
      "label": {
        "type": "plain_text",
        "text": "モバイル端末の OS"
      },
      "element": {
        "type": "static_select",
        "action_id": "element",
        "placeholder": {
          "type": "plain_text",
          "text": "選択してください"
        },
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "iOS"
            },
            "value": "ios"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Android"
            },
            "value": "android"
          }
        ]
      }
    };
  };

  static description() {
    return {
      "type": "input",
      "block_id": "description",
      "label": {
        "type": "plain_text",
        "text": "概要"
      },
      "element": {
        "type": "plain_text_input",
        "action_id": "element",
        "multiline": true
      }
    };
  }

  static approver() {
    return {
      "type": "input",
      "block_id": "approver",
      "label": {
        "type": "plain_text",
        "text": "承認者"
      },
      "element": {
        "type": "users_select",
        "action_id": "element",
        "placeholder": {
          "type": "plain_text",
          "text": "承認者を選択してください（通常は直属の上司です）"
        }
      }
    };
  };

  static dueDate() {
    return {
      "type": "input",
      "block_id": "due-date",
      "element": {
        "type": "datepicker",
        "action_id": "element"
      },
      "label": {
        "type": "plain_text",
        "text": "希望納品日（ご要望に添えない場合があります）",
        "emoji": true
      }
    };
  }
}

exports.ModalViewBlocks = ModalViewBlocks;
