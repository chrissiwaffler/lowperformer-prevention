import Bun from "bun";

export const {
  DISCORD_TOKEN,
  DISCORD_CLIENT_ID,
  CHANNEL_ID,
  USER_ID,
}: {
  DISCORD_TOKEN: string;
  DISCORD_CLIENT_ID: string;
  CHANNEL_ID: string;
  USER_ID: string;
} = Bun.env;

export const config = {
  reactions: ["💻", "🇸🇾", "👨‍🍳", "🍻", "🐻", "🧑‍💻", "🩲", "🫵", "💤", "🛌"],
  congratsReactions: ["🩲", "🍻", "🍺", "🎉", "🎊", "👏", "👍", "🥳"],
};
