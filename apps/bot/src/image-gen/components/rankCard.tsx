import { Builder, loadImage, Font } from "canvacord";

interface Props {
  avatar: string;
  serverIcon: string;
  username: string;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  background: string;
}

await Font.loadDefault();

export class RankCardBuilder extends Builder<Props> {
  constructor() {
    super(640, 160);
  }

  setAvatar(avatar: string): RankCardBuilder {
    this.options.set("avatar", avatar);
    return this;
  }

  setServerIcon(serverIcon: string): RankCardBuilder {
    this.options.set("serverIcon", serverIcon);
    return this;
  }

  setUsername(username: string): RankCardBuilder {
    this.options.set("username", username);
    return this;
  }

  setLevel(level: number): RankCardBuilder {
    this.options.set("level", level);
    return this;
  }

  setCurrentXp(currentXp: number): RankCardBuilder {
    this.options.set("currentXp", currentXp);
    return this;
  }

  setNextLevelXp(nextLevelXp: number): RankCardBuilder {
    this.options.set("nextLevelXp", nextLevelXp);
    return this;
  }

  setBackground(background: string): RankCardBuilder {
    this.options.set("background", background);
    return this;
  }

  async render() {
    const { avatar, serverIcon, username, level, currentXp, nextLevelXp, background } =
      this.options.getOptions();
    const bg = await loadImage(background);
    const av = await loadImage(avatar);
    const icon = await loadImage(serverIcon);

    return (
      <div style={{ display: "flex" }} className="h-full w-full flex flex-row justify-between">
        <div style={{ display: "flex" }} className="z-10">
          <img
            src={av.toDataURL()}
            alt="server icon"
            className="h-12 w-12 rounded-full"
            width={120}
            height={120}
          />
          <div style={{ display: "flex" }} className="ml-4">
            <p className="text-lg font-bold">{username}</p>
            <p className="text-sm text-gray-500">
              Level {level} - {currentXp}/{nextLevelXp} XP
            </p>
          </div>
        </div>
      </div>
    );
  }
}
