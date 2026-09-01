import { PermissionFlagsBits } from "discord.js";

class Permission {
  public static readonly reverse: { [key: string]: string } = Object.fromEntries(
    Object.entries(PermissionFlagsBits).map((value) => value.reverse()),
  );

  public static readonly name: { [key: string]: string } = {
    CreateInstantInvite: "招待を作成",
    KickMembers: "メンバーをキック",
    BanMembers: "メンバーをBAN",
    Administrator: "管理者",
    ManageChannels: "チャンネルの管理",
    ManageGuild: "サーバーの管理",
    AddReactions: "リアクションの追加",
    ViewAuditLog: "監査ログを表示",
    PrioritySpeaker: "優先スピーカー",
    Stream: "WEBカメラ",
    ViewChannel: "チャンネルを見る",
    SendMessages: "メッセージを送信",
    SendTTSMessages: "TTSメッセージを送信",
    ManageMessages: "メッセージの管理",
    EmbedLinks: "埋め込みリンク",
    AttachFiles: "ファイルを添付",
    ReadMessageHistory: "メッセージ履歴を見る",
    MentionEveryone: "@everyone、@here、全てのロールにメンション",
    UseExternalEmojis: "外部の絵文字を使用",
    ViewGuildInsights: "サーバーインサイトを見る",
    Connect: "接続",
    Speak: "発言",
    MuteMembers: "メンバーをミュート",
    DeafenMembers: "メンバーのスピーカーをミュート",
    MoveMembers: "メンバーを移動",
    UseVAD: "音声検出を使用",
    ChangeNickname: "ニックネームを変更",
    ManageNicknames: "ニックネームの管理",
    ManageRoles: "ロールの管理",
    ManageWebhooks: "ウェブフックの管理",
    ManageEmojisAndStickers: "絵文字とステッカーの管理",
    ManageGuildExpressions: "サウンドボードの管理",
    UseApplicationCommands: "アプリケーションコマンドの使用",
    RequestToSpeak: "スピーカー参加をリクエスト",
    ManageEvents: "イベントの管理",
    ManageThreads: "スレッドの管理",
    CreatePublicThreads: "公開スレッドの作成",
    CreatePrivateThreads: "プライベートスレッドの作成",
    UseExternalStickers: "外部のスタンプを使用",
    SendMessagesInThreads: "スレッドでメッセージを送信",
    UseEmbeddedActivities: "アクティビティを使用",
    ModerateMembers: "メンバーをタイムアウト",
    ViewCreatorMonetizationAnalytics: "ロールサブスクリプションの分析情報を見る",
    UseSoundboard: "サウンドボードの使用",
    CreateGuildExpressions: "サウンドボードの作成",
    CreateEvents: "イベントの作成",
    UseExternalSounds: "外部のサウンドを使用",
    SendVoiceMessages: "ボイスメッセージを送信",
    SendPolls: "投票の作成",
    UseExternalApps: "外部アプリを使用",
  };

  public static IntToString(num: bigint): string {
    return this.reverse[String(num)];
  }

  public static StrToName(str: string): string {
    return this.name[str];
  }

  public static IntToName(num: bigint): string {
    return this.StrToName(this.IntToString(num));
  }
}

export default Permission;
