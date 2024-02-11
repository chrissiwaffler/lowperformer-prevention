import { CronJob } from "cron";
import { client } from ".";
import { CHANNEL_ID, USER_ID, config } from "./config";
import { TextChannel } from "discord.js";

let lastMessageId: string | null = null;

export const cronJob = CronJob.from({
  cronTime: "0 0 * * * *",

  // for debugging -> every minute
  // cronTime: "0 * * * * *",
  onTick: async () => {
    const channel = client.channels.cache.get(CHANNEL_ID);

    if (!(channel instanceof TextChannel)) {
      console.debug("Channel is not a text channel");
      return;
    }

    // delete the last message if it exists
    if (lastMessageId) {
      try {
        const messageToDelete = await channel.messages.fetch(lastMessageId);
        await messageToDelete.delete();
      } catch (error) {
        console.error("Error deleting last message:", error);
      }
    }

    const now = new Date();

    // if after sys prog deadline, send congrats message and return
    const deadline = new Date("2024-02-12T14:00:00.000Z");
    deadline.setUTCHours(14, 0, 0, 0);
    const noMoreCongrats = new Date("2024-02-12T14:30:00.000Z");
    noMoreCongrats.setUTCHours(14, 30, 0, 0);
    if (now > deadline && now < noMoreCongrats) {
      const userId = USER_ID;
      const mention = `<@${userId}>`;
      const content = `${mention}, Glückwunsch! Du hast das SysProg Praktikum (erfolgreich) abgeschlossen!`;
      const message = await channel.send(content);
      addCongratsReactions(CHANNEL_ID, message.id);
      lastMessageId = message.id;

      console.debug(content);
      return;
    }

    if (now > noMoreCongrats) {
      return;
    }

    const nextMonday = new Date();

    // Set nextMonday to the next Monday at 17:26
    nextMonday.setUTCDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
    nextMonday.setUTCHours(14, 0, 0, 0);

    console.log("now ", now);
    console.log("nextMonday ", nextMonday);

    // If it's already past this time this week, set to next week
    if (now > nextMonday) {
      nextMonday.setDate(nextMonday.getDate() + 7);
    }

    const diff = nextMonday.getTime() - now.getTime();
    const hoursLeft = Math.floor(diff / (1000 * 60 * 60));
    const minutesLeft = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (diff > 0) {
      const userId = USER_ID;
      const mention = `<@${userId}>`;
      const content = `${mention}, dir bleiben nur noch ${hoursLeft} Stunden und ${minutesLeft} Minuten für SysProg Abgabe!!!`;
      const message = await channel.send(content);
      addReactionsToMessage(CHANNEL_ID, message.id);
      lastMessageId = message.id;

      console.debug(content);
    }
  },
});

async function addReactionsToMessage(
  channelId: string,
  messageId: string
): Promise<void> {
  try {
    const channel = client.channels.cache.get(channelId) as TextChannel;

    if (!channel) {
      console.error("Channel not found");
      return;
    }

    const message = await channel.messages.fetch(messageId);

    for (const reaction of config.reactions) {
      await message.react(reaction);
    }
  } catch (error) {
    console.error("Error adding reactions:", error);
  }
}

async function addCongratsReactions(
  channelId: string,
  messageId: string
): Promise<void> {
  try {
    const channel = client.channels.cache.get(channelId) as TextChannel;

    if (!channel) {
      console.error("Channel not found");
      return;
    }

    const message = await channel.messages.fetch(messageId);

    for (const reaction of config.congratsReactions) {
      await message.react(reaction);
    }
  } catch (error) {
    console.error("Error adding reactions:", error);
  }
}
