import logging
from datetime import datetime

from slack_bolt import App, Ack
from slack_sdk import WebClient

logging.basicConfig(level=logging.DEBUG)

app = App()

step1_modal = {
    "type": "modal",
    "callback_id": "helpdesk-request-modal",
    "title": {"type": "plain_text", "text": "ヘルプデスク申請"},
    "close": {"type": "plain_text", "text": "閉じる"},
    "blocks": [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": ":wave: 申請カテゴリを選んでください。"},
        },
        {
            "type": "actions",
            "elements": [
                {
                    "type": "static_select",
                    "action_id": "helpdesk-request-modal-category-selection",
                    "options": [
                        {
                            "text": {"type": "plain_text", "text": "PC"},
                            "value": "laptop",
                        },
                        {
                            "text": {"type": "plain_text", "text": "モバイル端末"},
                            "value": "mobile",
                        },
                        {
                            "text": {"type": "plain_text", "text": "その他"},
                            "value": "other",
                        },
                    ],
                }
            ],
        },
    ],
}

step2_laptop_modal = {
    "type": "modal",
    "callback_id": "helpdesk-request-modal",
    "title": {"type": "plain_text", "text": "ヘルプデスク申請"},
    "submit": {"type": "plain_text", "text": "送信"},
    "close": {"type": "plain_text", "text": "閉じる"},
    "blocks": [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "PC に関する申請画面です。"},
            "accessory": {
                "type": "button",
                "action_id": "helpdesk-request-modal-reset",
                "text": {"type": "plain_text", "text": "カテゴリ選択に戻る"},
                "value": "1",
            },
        },
        {
            "type": "input",
            "block_id": "title",
            "label": {"type": "plain_text", "text": "件名"},
            "element": {
                "type": "plain_text_input",
                "action_id": "element",
                "initial_value": "PC の交換申請",
            },
        },
        {
            "type": "input",
            "block_id": "laptop-model",
            "label": {"type": "plain_text", "text": "PC モデル"},
            "element": {
                "type": "static_select",
                "action_id": "element",
                "options": [
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "MacBook Pro (16-inch, 2019)",
                        },
                        "value": "MacBookPro16,1",
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "MacBook Pro (13-inch, 2019, Two Thunderbolt 3 ports)",
                        },
                        "value": "MacBookPro15,4",
                    },
                    {
                        "text": {
                            "type": "plain_text",
                            "text": "Surface Book 3 for Business",
                        },
                        "value": "SurfaceBook3",
                    },
                ],
            },
        },
    ],
}

step2_mobile_modal = {
    "type": "modal",
    "callback_id": "helpdesk-request-modal",
    "title": {"type": "plain_text", "text": "ヘルプデスク申請"},
    "submit": {"type": "plain_text", "text": "送信"},
    "close": {"type": "plain_text", "text": "閉じる"},
    "blocks": [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "モバイル端末に関する申請画面です。"},
            "accessory": {
                "type": "button",
                "action_id": "helpdesk-request-modal-reset",
                "text": {"type": "plain_text", "text": "カテゴリ選択に戻る"},
                "value": "1",
            },
        },
        {
            "type": "input",
            "block_id": "title",
            "label": {"type": "plain_text", "text": "件名"},
            "element": {
                "type": "plain_text_input",
                "action_id": "element",
                "initial_value": "モバイル端末の交換申請",
            },
        },
        {
            "type": "input",
            "block_id": "os",
            "label": {"type": "plain_text", "text": "モバイル端末の OS"},
            "element": {
                "type": "static_select",
                "action_id": "element",
                "placeholder": {"type": "plain_text", "text": "選択してください"},
                "options": [
                    {"text": {"type": "plain_text", "text": "iOS"}, "value": "ios"},
                    {
                        "text": {"type": "plain_text", "text": "Android"},
                        "value": "android",
                    },
                ],
            },
        },
        {
            "type": "input",
            "block_id": "approver",
            "label": {"type": "plain_text", "text": "承認者"},
            "element": {
                "type": "users_select",
                "action_id": "element",
                "placeholder": {
                    "type": "plain_text",
                    "text": "承認者を選択してください（通常は直属の上司です）",
                },
            },
        },
        {
            "type": "input",
            "block_id": "due-date",
            "element": {"type": "datepicker", "action_id": "element"},
            "label": {
                "type": "plain_text",
                "text": "希望納品日（ご要望に添えない場合があります）",
            },
        },
    ],
}

step2_other_modal = {
    "type": "modal",
    "callback_id": "helpdesk-request-modal",
    "title": {"type": "plain_text", "text": "ヘルプデスク申請"},
    "submit": {"type": "plain_text", "text": "送信"},
    "close": {"type": "plain_text", "text": "閉じる"},
    "blocks": [
        {
            "type": "section",
            "text": {"type": "mrkdwn", "text": "できるだけ詳細な情報を添えて送信いただくようご協力をお願いします。"},
            "accessory": {
                "type": "button",
                "action_id": "helpdesk-request-modal-reset",
                "text": {"type": "plain_text", "text": "カテゴリ選択に戻る"},
                "value": "1",
            },
        },
        {
            "type": "input",
            "block_id": "title",
            "label": {"type": "plain_text", "text": "件名"},
            "element": {
                "type": "plain_text_input",
                "action_id": "element",
                "initial_value": "",
            },
        },
        {
            "type": "input",
            "block_id": "description",
            "label": {"type": "plain_text", "text": "概要"},
            "element": {
                "type": "plain_text_input",
                "action_id": "element",
                "multiline": True,
            },
        },
    ],
}


@app.shortcut("new-helpdesk-request")
def open_modal_step1(ack: Ack, body: dict, client: WebClient):
    ack()
    res = client.views_open(trigger_id=body["trigger_id"], view=step1_modal)


@app.action("helpdesk-request-modal-category-selection")
def show_modal_step2(ack: Ack, body: dict, action: dict, client: WebClient):
    ack()
    category = action["selected_option"]["value"]
    view = {}
    if category == "laptop":
        view = step2_laptop_modal
    elif category == "mobile":
        view = step2_mobile_modal
    else:
        view = step2_other_modal
    res = client.views_update(
        view_id=body["view"]["id"], hash=body["view"]["hash"], view=view
    )


@app.action("helpdesk-request-modal-reset")
def show_modal_step1_again(ack: Ack, body: dict, client: WebClient):
    ack()
    res = client.views_update(
        view_id=body["view"]["id"], hash=body["view"]["hash"], view=step1_modal
    )


@app.view("helpdesk-request-modal")
def accept_view_submission(
    ack: Ack, body: dict, logger: logging.Logger, client: WebClient
):
    values = body["view"]["state"]["values"]
    actionId = "element"
    title = values["title"][actionId]["value"] if "title" in values else None
    laptop_model = (
        values["laptop-model"][actionId]["selected_option"]["value"]
        if "laptop-model" in values
        else None
    )
    os = values["os"][actionId]["selected_option"]["value"] if "os" in values else None
    description = (
        values["description"][actionId]["value"] if "description" in values else None
    )
    due_date = (
        values["due-date"][actionId]["selected_date"] if "due-date" in values else None
    )
    approver = (
        values["approver"][actionId]["selected_user"] if "approver" in values else None
    )

    errors = {}
    if title is not None and len(title) <= 5:
        errors["title"] = "件名は 6 文字以上で入力してください"
    if approver is not None:
        is_valid_approver = True
        try:
            user_info = client.users_info(user=approver)
            user = user_info["user"]
            is_valid_approver = not (
                user.get("is_app_user", False)
                or user.get("is_bot", False)
                or user.get("is_stranger", False)
            )
        except:
            is_valid_approver = False
        if not is_valid_approver:
            errors["approver"] = "このユーザーは承認者に指定できません"
    if (
        due_date is not None
        and datetime.strptime(due_date, "%Y-%m-%d") <= datetime.today()
    ):
        errors["due-date"] = "希望納品日は明日以降を指定してください"

    if len(errors) > 0:
        ack(response_action="errors", errors=errors)
        return

    ack()

    logger.info(
        f"title: {title}, "
        f"laptop_model: {laptop_model}, "
        f"os: {os}, "
        f"description: {description}, "
        f"due_date: {due_date}, "
        f"approver: {approver}"
    )


if __name__ == "__main__":
    app.start(port=3000)
