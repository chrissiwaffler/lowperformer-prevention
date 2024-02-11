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
