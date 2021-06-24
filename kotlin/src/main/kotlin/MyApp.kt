import com.slack.api.bolt.App
import com.slack.api.bolt.jetty.SlackAppServer
import com.slack.api.model.kotlin_extension.view.blocks
import com.slack.api.model.view.Views.*
import com.slack.api.model.view.View
import java.time.LocalDate
import java.time.format.DateTimeFormatter

fun main() {
  System.setProperty("org.slf4j.simpleLogger.log.com.slack.api", "debug")
  val app = App()

  app.globalShortcut("new-helpdesk-request") { req, ctx ->
    ctx.asyncClient().viewsOpen { it.triggerId(req.payload.triggerId).view(step1Modal) }
    ctx.ack()
  }
  app.blockAction("helpdesk-request-modal-category-selection") { req, ctx ->
    val view: View = when (req.payload.actions[0].selectedOption.value) {
      "laptop" -> step2LaptopModal
      "mobile" -> step2MobileModal
      else -> step2OtherModal
    }
    ctx.asyncClient().viewsUpdate {
      it.viewId(req.payload.view.id).hash(req.payload.view.hash).view(view)
    }
    ctx.ack()
  }
  app.blockAction("helpdesk-request-modal-reset") { req, ctx ->
    ctx.asyncClient().viewsUpdate {
      it.viewId(req.payload.view.id).hash(req.payload.view.hash).view(step1Modal)
    }
    ctx.ack()
  }
  app.viewSubmission("helpdesk-request-modal") { req, ctx ->
    val values = req.payload.view.state.values
    val actionId = "element"
    val title = values["title"]?.get(actionId)?.value
    val laptopModel = values["laptop-model"]?.get(actionId)?.selectedOption?.value
    val os = values["os"]?.get(actionId)?.selectedOption?.value
    val description = values["description"]?.get(actionId)?.value
    val dueDate = values["due-date"]?.get(actionId)?.selectedDate
    val approver = values["approver"]?.get(actionId)?.selectedUser
    val errors = mutableMapOf<String, String>()
    if (title != null && title.length <= 5) {
      errors["title"] = "件名は 6 文字以上で入力してください"
    }
    val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd")
    if (dueDate != null && LocalDate.parse(dueDate, formatter) <= LocalDate.now()) {
      errors["due-date"] = "希望納品日は明日以降を指定してください"
    }
    if (approver != null) {
      val user = ctx.client().usersInfo { it.user(approver) }.user
      if (user != null && (user.isAppUser || user.isBot || user.isStranger)) {
        errors["approver"] = "このユーザーは承認者に指定できません"
      }
    }
    if (errors.isNotEmpty()) {
      ctx.ack { it.responseAction("errors").errors(errors) }
    } else {
      ctx.logger.info("${title},${laptopModel},${os},${description},${dueDate},${approver}")
      ctx.ack()
    }
  }

  val server = SlackAppServer(app)
  server.start() // http://localhost:3000/slack/events
}

val step1Modal: View = view { it
  .type("modal")
  .callbackId("helpdesk-request-modal")
  .title(viewTitle { t -> t.text("ヘルプデスク申請").type("plain_text") })
  .close(viewClose { c -> c.text("閉じる").type("plain_text") })
  .blocks {
    section {
      markdownText(":wave: 申請カテゴリを選んでください。")
    }
    actions {
      elements {
        staticSelect {
          actionId("helpdesk-request-modal-category-selection")
          options {
            option {
              plainText("PC")
              value("laptop")
            }
            option {
              plainText("モバイル端末")
              value("mobile")
            }
            option {
              plainText("その他")
              value("other")
            }
          }
        }
      }
    }
  }
}

val step2LaptopModal: View = view { it
  .type("modal")
  .callbackId("helpdesk-request-modal")
  .title(viewTitle { t -> t.text("ヘルプデスク申請").type("plain_text") })
  .submit(viewSubmit { s -> s.text("送信").type("plain_text") })
  .close(viewClose { c -> c.text("閉じる").type("plain_text") })
  .blocks {
    section {
      markdownText("PC に関する申請画面です。")
      accessory {
        button {
          actionId("helpdesk-request-modal-reset")
          text("カテゴリ選択に戻る")
          value("1")
        }
      }
    }
    input {
      blockId("title")
      label("件名")
      element {
        plainTextInput {
          actionId("element")
          initialValue("PC の交換申請")
        }
      }
    }
    input {
      blockId("laptop-model")
      label("PC モデル")
      element {
        staticSelect {
          actionId("element")
          options {
            option {
              plainText("MacBook Pro (16-inch, 2019)")
              value("MacBookPro16,1")
            }
            option {
              plainText("MacBook Pro (13-inch, 2019, Two Thunderbolt 3 ports)")
              value("MacBookPro15,4")
            }
            option {
              plainText("Surface Book 3 for Business")
              value("SurfaceBook3")
            }
          }
        }
      }
    }

  }
}

val step2MobileModal: View = view { it
  .type("modal")
  .callbackId("helpdesk-request-modal")
  .title(viewTitle { t -> t.text("ヘルプデスク申請").type("plain_text") })
  .submit(viewSubmit { s -> s.text("送信").type("plain_text") })
  .close(viewClose { c -> c.text("閉じる").type("plain_text") })
  .blocks {
    section {
      markdownText("モバイル端末に関する申請画面です。")
      accessory {
        button {
          actionId("helpdesk-request-modal-reset")
          text("カテゴリ選択に戻る")
          value("1")
        }
      }
    }
    input {
      blockId("title")
      label("件名")
      element {
        plainTextInput {
          actionId("element")
          initialValue("モバイル端末の交換申請")
        }
      }
    }
    input {
      blockId("os")
      label("モバイル端末の OS")
      element {
        staticSelect {
          actionId("element")
          placeholder("選択してください")
          options {
            option {
              plainText("iOS")
              value("ios")
            }
            option {
              plainText("Android")
              value("android")
            }
          }
        }
      }
    }
    input {
      blockId("approver")
      label("承認者")
      element {
        usersSelect {
          actionId("element")
          placeholder("承認者を選択してください（通常は直属の上司です）")
        }
      }
    }
    input {
      blockId("due-date")
      element {
        datePicker {
          actionId("element")
        }
      }
      label("希望納品日（ご要望に添えない場合があります）")
    }
  }
}

val step2OtherModal: View = view { it
  .type("modal")
  .callbackId("helpdesk-request-modal")
  .title(viewTitle { t -> t.text("ヘルプデスク申請").type("plain_text") })
  .submit(viewSubmit { s -> s.text("送信").type("plain_text") })
  .close(viewClose { c -> c.text("閉じる").type("plain_text") })
  .blocks {
    section {
      markdownText("できるだけ詳細な情報を添えて送信いただくようご協力をお願いします。")
      accessory {
        button {
          actionId("helpdesk-request-modal-reset")
          text("カテゴリ選択に戻る")
          value("1")
        }
      }
    }
    input {
      blockId("title")
      label("件名")
      element {
        plainTextInput {
          actionId("element")
          initialValue("")
        }
      }
    }
    input {
      blockId("description")
      label("概要")
      element {
        plainTextInput {
          actionId("element")
          initialValue("")
          multiline(true)
        }
      }
    }
  }
}