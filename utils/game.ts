import englishWords from "./english.json";

export const splitPhrase = (phrase: string) => {
  const words = phrase.split(" ")
  return words.map((word) => word.split(""))
}

export type Char = {
  value: string;
  correct?: boolean;
  exists: boolean;
  additionalIncorrect?: boolean;
}

export type Word = Char[]

export type BuiltPhrase = Word[]

export type Player = {
  percentage: number;
  username: string;
  hue: string;
}

export type PlayerResults = {
  player: Player;
  time?: number;
  place?: number;
}

export const buildRenderedPhrase = (phrase: string, value: string): BuiltPhrase => {
  const phraseWords = splitPhrase(phrase);
  const valueWords = splitPhrase(value);

  return phraseWords.map((word, i) => {
    const phraseTokens = word.map<Char>((char, j) => {
      const charExists = !!valueWords[i]?.[j] || !!valueWords[i + 1]
      const isCorrect = valueWords[i]?.[j] === char
      return {
        value: char,
        exists: charExists,
        correct: charExists ? isCorrect : undefined,
      }
    })

    const additionalTokens = valueWords[i]?.slice(word.length)?.map<Char>((char) => {
      return {
        value: char,
        exists: true,
        additionalIncorrect: true
      }
    })

    return phraseTokens.concat(additionalTokens ?? [])
  })
}

export const currentCursorPosition = (builtPhrase: BuiltPhrase): [number, number] => {
  for (let i = 0; i < builtPhrase.length; i++) {
    const lastChar = builtPhrase[i].findIndex((char) => !char.exists);

    const previousWord = builtPhrase[i - 1];
    if (lastChar === 0 && previousWord?.[(previousWord.length ?? 0 ) -1].additionalIncorrect) return [i - 1, previousWord.length - 1];  
    if (lastChar >= 0) return [i, lastChar];
  }

  return [0, 0]
}

export const isCurrentPositionCursor = (position: [number, number], cursor: [number, number]): boolean => {
  if (position[0] !== cursor[0]) return false;
  
  return position[1] === cursor[1]
}

export const calculatePercentageCompleted = (builtPhrase: BuiltPhrase): number => {
  const totalCharacters = builtPhrase.reduce((acc, word) => acc + word.reduce((charAcc, char) => {
    if (!char.additionalIncorrect) return charAcc + 1;

    return charAcc
  }, 0), 0)

  const correctChars = builtPhrase.reduce((acc, word) => acc + word.reduce((charAcc, char) => {
    if (char.correct) return charAcc + 1;

    return charAcc
  }, 0), 0)

  return Math.round((correctChars / totalCharacters) * 100)
}

export const calculateWPM = (finishTime: number, phrase: string) => {
  // Count the number of words in the typed text
  const wordCount = phrase.trim().split(/\s+/).length;

  // Calculate the WPM
  const wpm = Math.round(wordCount / (finishTime / 60));

  return wpm;
}

export const generateNewPhraseText = (length = 10): string => {
  let word = 0;
  let result = "";

  while (word < length) {
    const randomIndex = Math.floor(Math.random() * englishWords.length);
    const randomWord = englishWords[randomIndex];
    result += randomWord;

    if (word !== length - 1) {
      result += " ";
    }

    word += 1;
  }

  return result;
}