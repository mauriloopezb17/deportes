const mojibakeMarkers = /[\u00c2\u00c3\u00e2]/;

const directReplacements: Array<[RegExp, string]> = [
  [new RegExp("F\\u00c3\\u0192\\u00c2\\u00batbol", "g"), "Fútbol"],
  [new RegExp("B\\u00c3\\u0192\\u00c2\\u00a1squetbol", "g"), "Básquetbol"],
  [new RegExp("V\\u00c3\\u0192\\u00c2\\u00b3ley", "g"), "Vóley"],
];

const repairUtf8ReadAsLatin1 = (value: string) => {
  let text = value;

  for (let attempt = 0; attempt < 2 && mojibakeMarkers.test(text); attempt += 1) {
    try {
      const bytes = Uint8Array.from(text, (char) => char.charCodeAt(0));
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);

      if (decoded === text) {
        break;
      }

      text = decoded;
    } catch {
      break;
    }
  }

  return text;
};

export const normalizeText = (value = "") => {
  const cleaned = directReplacements.reduce(
    (text, [pattern, replacement]) => text.replace(pattern, replacement),
    value,
  );

  return repairUtf8ReadAsLatin1(cleaned);
};
