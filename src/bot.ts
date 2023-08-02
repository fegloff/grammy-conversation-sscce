import {
  Bot,
  Context,
  session,
  SessionFlavor,
  MemorySessionStorage,
} from "grammy";
import express from "express";
import {
  conversations,
  type Conversation,
  type ConversationFlavor,
  createConversation,
} from "@grammyjs/conversations";

import { config } from "./config";

interface Image {
  url: string;
}

interface BotSessionData {
  numImages: number;
}

type BotConversation = Conversation<BotContext>;

export type BotContext = Context &
  SessionFlavor<BotSessionData> &
  ConversationFlavor;

const token = config.telegramAPI;

export const bot = new Bot<BotContext>(token || "");

function initial(): BotSessionData {
  return {
    numImages: 1,
  };
}

const simulateApiCall = (text: any) => {
  return {
    isAvailable: true,
    isInGracePeriod: false,
    priceUSD: {
      error: null,
      price: 0.01,
    },
    priceOne: 1,
  };
};
const botConversation = async (
  conversation: BotConversation,
  ctx: BotContext
) => {
  try {
    let echoText = ctx.match || "";
    let helpCommand = false;
    const timeoutMilliseconds = 10000;
    while (true) {
      if (!helpCommand) {
        await conversation.external(async () => {
          await new Promise(resolve => setTimeout(resolve, 500));
        });
        let msg = `You write *${echoText}* `;
        ctx.reply(msg, {
          parse_mode: "Markdown",
        });
      }
      let userInput = "";
      try {
        const value = await conversation.waitFor(":text", {
          maxMilliseconds: timeoutMilliseconds,
        });
        userInput = value.msg.text;
      } catch (reason) {
        console.log("REASON", reason);
        userInput = "end"; // end will break the while loop
      }
      // const userInput = await conversation
      //   .waitFor(":text", {
      //     drop: true,
      //     maxMilliseconds: timeoutMilliseconds,
      //     // otherwise: (ctx) => {
      //     //   console.log('here me HERE')
      //     //   ctx.reply('NOOOOO')
      //     //   return 'end'
      //     // }
      //   })
      //   .then(
      //     (value) => {
      //       return value.msg.text;
      //     },
      //     (reason) => {
      //       console.log("REASON", reason);
      //       return "end";
      //     }
      //   );
      // const userInput = await conversation
      //   .waitFor(":text", {
      //     maxMilliseconds: timeoutMilliseconds,
      //   })
      //   .then(
      //     (value) => {
      //       return value.msg.text;
      //     },
      //     (reason) => {
      //       console.log("REASON", reason);
      //       return "end"; // end will break the while loop
      //     }
      //   );
      const userPrompt = userInput; //.msg.text; //. .msg ? cleanInput(userInput.msg.text!) : 'end'
      console.log(userInput);
      if (userPrompt.toLocaleLowerCase().includes("end")) {
        ctx.reply("bye");
        break;
      } else if (userPrompt.toLocaleLowerCase().includes("help")) {
        helpCommand = true;
        ctx.reply(`Show help menu`);
      } else {
        helpCommand = false;
        echoText = userPrompt;
        ctx.reply("Checking...");
      }
    }
    console.log("Exit bot");
    return;
  } catch (e) {
    ctx.reply("The bot has encountered an error. Please try again later. ");
    console.log("##conversationGountry Error:", e);
  }
};

bot.use(session({ initial, storage: new MemorySessionStorage() }));

bot.use(conversations());
bot.use(createConversation(botConversation));

bot.command("start", async (ctx) => {
  await ctx.reply("bot started");
});

bot.command("echo", async (ctx) => {
  await ctx.conversation.enter("botConversation");
});

const app = express();

app.use(express.json());

app.listen(config.port, () => {
  console.log(`Bot listening on port ${config.port}`);
  bot.start();
});
