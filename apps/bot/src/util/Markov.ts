import kuromoji, { Tokenizer, IpadicFeatures } from "kuromoji";
import Log from "@/util/Log";

class Markov {
  private readonly tree: Tree = {};
  private tokenizer: Promise<Tokenizer<IpadicFeatures>> | null = null;
  private readonly maxChar: number;

  constructor(maxChar: number = 100) {
    if (maxChar <= 0) throw new Error("最大生成数は正の整数である必要があります");

    this.maxChar = maxChar;
  }

  private getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
    if (!this.tokenizer) {
      this.tokenizer = new Promise((resolve, reject) => {
        kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) => {
          if (err) {
            this.tokenizer = null;

            return reject(new Error("Kuromojiのトークナイザーのビルドに失敗しました"));
          }

          resolve(tokenizer);
        });
      });
    }

    return this.tokenizer;
  }

  async analyze(text: string): Promise<IpadicFeatures[]> {
    if (text.trim() === "") return [];

    try {
      const tokenizer = await this.getTokenizer();
      return tokenizer.tokenize(text);
    } catch (error) {
      throw error;
    }
  }

  pick(
    collection: IpadicFeatures[] | Tree | string[] | { [key: string]: any },
  ): IpadicFeatures | string | null {
    if (!collection) return null;

    if (Array.isArray(collection)) {
      if (collection.length === 0) return null;

      return collection[Math.floor(Math.random() * collection.length)];
    } else if (typeof collection === "object") {
      const keys = Object.keys(collection);
      if (keys.length === 0) return null;

      return this.pick(keys) as string;
    }

    return null;
  }

  private pickPart(tokens: IpadicFeatures[], pos: string): string | null {
    if (tokens.length === 0) return null;

    const filteredTokens = tokens.filter((token) => token.pos === pos);
    const pickedToken = this.pick(filteredTokens) as IpadicFeatures | null;
    return pickedToken ? pickedToken.surface_form : null;
  }

  async train(values: string[]): Promise<void> {
    if (values.length === 0) return;

    for (const text of values) {
      if (text.trim() === "") continue;

      try {
        const tokens = await this.analyze(text);
        const words = tokens.map((token) => token.surface_form);

        for (let i = 0; i < words.length; i++) {
          const currentWord = words[i] || null;
          const nextWord = words[i + 1] || null;
          const followWord = words[i + 2] || null;

          if (currentWord === null) continue;

          if (!this.tree[currentWord]) {
            this.tree[currentWord] = {};
          }

          if (!this.tree[currentWord][nextWord as string]) {
            this.tree[currentWord][nextWord as string] = [];
          }

          this.tree[currentWord][nextWord as string].push(followWord);
        }
      } catch {
        Log.error(`"${text.substring(0, 50)}..."のトレーニングに失敗しました`);
      }
    }
  }

  async make(): Promise<Tree | string | null> {
    if (Object.keys(this.tree).length === 0) return "";

    let generatedText: string = "";
    let currentWord: string | null = null;
    let nextWord: string | null = null;

    const allWords = Object.keys(this.tree);
    if (allWords.length === 0) return "";

    while (!currentWord) {
      const randomStartText = this.pick(allWords);
      if (!randomStartText) return "";

      try {
        const tokens = await this.analyze(randomStartText as string);
        currentWord = this.pickPart(tokens, "名詞");

        if (currentWord && !this.tree[currentWord]) {
          currentWord = null;
        }
      } catch {
        Log.error("マルコフ連鎖のランダムスタートができませんでした");

        currentWord = null;
      }
    }

    nextWord = this.pick(this.tree[currentWord]) as string | null;
    if (nextWord === null) return this.make();

    generatedText += currentWord;

    while (true) {
      const previousWord: string | null = currentWord;
      currentWord = nextWord;

      if (currentWord === null) break;

      generatedText += currentWord;

      if (generatedText.length >= this.maxChar && /[。．！？]$/.test(generatedText)) break;

      const possibleFollowWords = this.tree[previousWord]?.[currentWord];
      if (!possibleFollowWords || possibleFollowWords.length === 0) break;

      nextWord = this.pick(possibleFollowWords) as string | null;

      if (nextWord === null) break;
    }

    return generatedText.replace(/null$/, "");
  }
}

interface Tree {
  [key: string]: {
    [key: string]: (string | null)[];
  };
}

export default Markov;
