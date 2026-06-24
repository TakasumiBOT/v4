class Random {
  public static getRandomElements<T>(array: T[], count: number): T[] {
    return this.shuffle(array).slice(0, count);
  }

  public static getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  }

  public static shuffle<T>(array: T[]): T[] {
    const result = array.slice();

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    return result;
  }
}

export default Random;
