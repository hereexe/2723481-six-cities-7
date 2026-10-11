export function getRandomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomFloat(min: number, max: number, digits = 1): number {
  return Number((Math.random() * (max - min) + min).toFixed(digits));
}

export function getRandomBoolean(): boolean {
  return Math.random() < 0.5;
}

export function getRandomItem<T>(items: T[]): T {
  return items[getRandomInteger(0, items.length - 1)];
}

export function getRandomItems<T>(items: T[], count = getRandomInteger(1, items.length)): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = getRandomInteger(0, index);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}
