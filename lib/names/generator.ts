// Name generator functions
import { adjectives, nouns, alliterativePairs, nameEmojis } from './wordlists';

/**
 * Get a random item from an array
 */
function randomPick<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Generate a random fun name
 */
export function generateName(): string {
  const adjective = randomPick(adjectives);
  const noun = randomPick(nouns);
  return `${adjective} ${noun}`;
}

/**
 * Generate an alliterative name (same starting letter)
 */
export function generateAlliterativeName(): string {
  const pair = randomPick(alliterativePairs);
  return `${pair[0]} ${pair[1]}`;
}

/**
 * Generate a name with preference for alliteration
 * 70% chance of alliterative, 30% random
 */
export function generateFunName(): string {
  if (Math.random() < 0.7) {
    return generateAlliterativeName();
  }
  return generateName();
}

/**
 * Get the emoji for a noun if available
 */
export function getNameEmoji(name: string): string | null {
  const words = name.split(' ');
  const noun = words[words.length - 1]; // Get the last word (noun)
  return nameEmojis[noun] || null;
}

/**
 * Generate a name with its emoji
 */
export function generateNameWithEmoji(): { name: string; emoji: string | null } {
  const name = generateFunName();
  const emoji = getNameEmoji(name);
  return { name, emoji };
}

/**
 * Generate multiple unique names
 */
export function generateUniqueNames(count: number): string[] {
  const names = new Set<string>();
  let attempts = 0;
  const maxAttempts = count * 3;

  while (names.size < count && attempts < maxAttempts) {
    names.add(generateFunName());
    attempts++;
  }

  // If we couldn't get enough unique names, add numbered ones
  let counter = 1;
  while (names.size < count) {
    names.add(`${generateName()} ${counter++}`);
  }

  return Array.from(names);
}

/**
 * Check if a name is already taken and generate a unique variation
 */
export function generateUniqueName(existingNames: string[]): string {
  const existingSet = new Set(existingNames.map(n => n.toLowerCase()));
  let attempts = 0;
  const maxAttempts = 50;

  while (attempts < maxAttempts) {
    const name = generateFunName();
    if (!existingSet.has(name.toLowerCase())) {
      return name;
    }
    attempts++;
  }

  // Fallback: add a number suffix
  const baseName = generateName();
  let counter = 1;
  while (existingSet.has(`${baseName} ${counter}`.toLowerCase())) {
    counter++;
  }
  return `${baseName} ${counter}`;
}
