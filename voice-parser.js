const NUMBER_WORDS = new Map();
const addWords = (words, values) => words.forEach((word, i) => NUMBER_WORDS.set(word, values[i]));
addWords(["zero","one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen"], [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19]);
addWords(["twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety"], [20,30,40,50,60,70,80,90]);
const localDigits = {
  "शून्य":0,"एक":1,"दो":2,"दोन":2,"तीन":3,"चार":4,"पांच":5,"पाँच":5,"पाच":5,"छह":6,"छे":6,"सहा":6,"सात":7,"आठ":8,"नौ":9,"नऊ":9,"दस":10,"दहा":10,
  "શૂન્ય":0,"એક":1,"બે":2,"ત્રણ":3,"ચાર":4,"પાંચ":5,"છ":6,"સાત":7,"આઠ":8,"નવ":9,"દસ":10,"અગિયાર":11,"બાર":12,"તેર":13,"ચૌદ":14,"પંદર":15,"સોળ":16,"સત્તર":17,"અઢાર":18,"ઓગણીસ":19,"વીસ":20,"ત્રીસ":30,"ચાલીસ":40,"પચાસ":50,"સાઠ":60,"સિત્તેર":70,"એંસી":80,"નેવું":90,
  "ek":1,"do":2,"teen":3,"char":4,"chaar":4,"paanch":5,"panch":5,"chhe":6,"saat":7,"aath":8,"nau":9,"das":10
};
Object.entries(localDigits).forEach(([word, value]) => NUMBER_WORDS.set(word, value));
const ALIASES = [
  [/\b(?:square\s+root(?:\s+of)?|root\s+of)\b|वर्गमूल|वर्गमूळ|વર્ગમૂળ/giu, " sqrt "],
  [/\b(?:sine\s+of|sine|sin)\b/giu, " sin "],[/\b(?:cosine\s+of|cosine|cos)\b/giu, " cos "],[/\b(?:tangent\s+of|tangent|tan)\b/giu, " tan "],
  [/\b(?:logarithm|log)\b/giu, " log "],[/\b(?:natural\s+log|ln)\b/giu, " ln "],
  [/\b(?:squared|square)\b|वर्ग|વર્ગ/giu, " power2 "],[/\b(?:cubed|cube)\b|घन|ઘન/giu, " power3 "],
  [/\b(?:raised\s+to(?:\s+the)?|to\s+the\s+power(?:\s+of)?|power\s+of|power|ghaat|ghat)\b|घात|ઘાત/giu, " power "],
  [/\b(?:multiplied\s+by|multiply|times|into|guna|gunaa)\b|गुणाकार|गुणिले|गुणा|गुना|ગુણાકાર|ગુણ્યા|ગુણ|ટાઇમ્સ/giu, " multiply "],
  [/\b(?:divided\s+by|divide|divided|bhaag|bhag)\b|भागाकार|भागिले|भाग|ભાગાકાર|ભાગ્યા|ભાગ/giu, " divide "],
  [/\b(?:plus|add|added|jod|jama)\b|जोड़|जोड|बेरीज|प्लस|अधिक|ઉમેરો|વત્તા|પ્લસ/giu, " plus "],
  [/\b(?:minus|subtract|subtracted|ghata|negative)\b|घटा|वजा|माइनस|ऋण|ઓછા|બાદ|માઇનસ|માઈનસ/giu, " minus "],
  [/\b(?:decimal|point|dot)\b|दशमलव|दशांश|बिंदु|बिंदू|દશાંશ|બિંદુ/giu, " decimal "],
  [/\b(?:pi|pie)\b|पाई|પાઈ/giu, " pi "],
  [/\b(?:equals?|equal\s+to|calculate|what\s+is|please|answer|barabar)\b|बराबर|बरोबर|બરાબર|उत्तर|જવાબ/giu, " "],
  [/\b(?:open\s+bracket|left\s+bracket|open\s+parenthesis)\b/giu, " ( "],[/\b(?:close\s+bracket|right\s+bracket|close\s+parenthesis)\b/giu, " ) "],
  [/×/gu, " multiply "], [/÷/gu, " divide "], [/−/gu, " minus "], [/√/gu, " sqrt "]
];
const FUNCTIONS = new Set(["sin","cos","tan","log","ln","sqrt"]);
const STOP_WORDS = new Set(["and","then","of","the","is","है","और","आणि","છે","અને"]);
function numberFromWords(words) {
  if (!words.length) return "";
  const point = words.indexOf("decimal");
  if (point >= 0) {
    const whole = numberFromWords(words.slice(0, point)) || "0";
    const fraction = words.slice(point + 1).map(word => NUMBER_WORDS.get(word) ?? (/^\d+$/u.test(word) ? word : null));
    return fraction.length && fraction.every(value => value !== null) ? whole + "." + fraction.join("") : words.join("");
  }
  if (words.length === 1 && /^\d+(?:[.,]\d+)?$/u.test(words[0])) return words[0].replace(",", ".");
  if (!words.every(word => NUMBER_WORDS.has(word) || /^\d+$/u.test(word) || word === "hundred" || word === "thousand" || word === "and")) return words.join("");
  let total = 0, current = 0, digits = "";
  for (const word of words) {
    if (word === "and") continue;
    if (word === "hundred") { current = (current + Number(digits || 0) || 1) * 100; digits = ""; }
    else if (word === "thousand") { total += (current + Number(digits || 0) || 1) * 1000; current = 0; digits = ""; }
    else {
      const value = NUMBER_WORDS.get(word) ?? Number(word);
      if (value >= 20 && value % 10 === 0) { current += Number(digits || 0) + value; digits = ""; }
      else if (value >= 10) { current += Number(digits || 0) + value; digits = ""; }
      else digits += String(value);
    }
  }
  return String(total + current + Number(digits || 0));
}
/** Convert common spoken math phrases into editable calculator notation. */
export function parseSpokenExpression(transcript = "") {
  let text = String(transcript).toLowerCase().replace(/[०-९]/g, char => String(char.charCodeAt(0) - 0x966)).replace(/[૦-૯]/g, char => String(char.charCodeAt(0) - 0xAE6));
  for (const [pattern, replacement] of ALIASES) text = text.replace(pattern, replacement);
  const tokens = text.match(/[\p{L}]+|\d+(?:[.,]\d+)?|[()+*/^%=!-]/gu) || [];
  const output = [];
  for (let i = 0; i < tokens.length;) {
    const token = tokens[i];
    if (token === "power2") { output.push("^2"); i++; continue; }
    if (token === "power3") { output.push("^3"); i++; continue; }
    if (token === "power") { output.push("^"); i++; continue; }
    if (token === "multiply") { output.push("×"); i++; continue; }
    if (token === "divide") { output.push("÷"); i++; continue; }
    if (token === "plus") { output.push("+"); i++; continue; }
    if (token === "minus") { output.push("−"); i++; continue; }
    if (token === "decimal") { output.push("."); i++; continue; }
    if (token === "pi") { output.push("π"); i++; continue; }
    if (token === "hundred" || token === "thousand" || NUMBER_WORDS.has(token) || /^\d+(?:[.,]\d+)?$/u.test(token)) {
      const run = [];
      while (i < tokens.length && (NUMBER_WORDS.has(tokens[i]) || /^\d+(?:[.,]\d+)?$/u.test(tokens[i]) || tokens[i] === "hundred" || tokens[i] === "thousand" || tokens[i] === "decimal" || tokens[i] === "and")) run.push(tokens[i++]);
      output.push(numberFromWords(run)); continue;
    }
    if (FUNCTIONS.has(token)) {
      i++; if (tokens[i] === "of") i++;
      if (tokens[i] === "(") { output.push(token + "("); i++; continue; }
      if (i < tokens.length && (/^\d+(?:[.,]\d+)?$/u.test(tokens[i]) || NUMBER_WORDS.has(tokens[i]) || /^[a-z]$/u.test(tokens[i]) || tokens[i] === "pi")) {
        if (NUMBER_WORDS.has(tokens[i]) || /^\d+(?:[.,]\d+)?$/u.test(tokens[i])) {
          const start = i;
          while (i < tokens.length && (NUMBER_WORDS.has(tokens[i]) || /^\d+(?:[.,]\d+)?$/u.test(tokens[i]) || tokens[i] === "hundred" || tokens[i] === "thousand" || tokens[i] === "decimal" || tokens[i] === "and")) i++;
          output.push(token + "(" + numberFromWords(tokens.slice(start, i)) + ")");
        } else {
          const next = tokens[i++];
          output.push(token + "(" + (next === "pi" ? "π" : next) + ")");
        }
      } else output.push(token);
      continue;
    }
    if (STOP_WORDS.has(token)) { i++; continue; }
    output.push(token); i++;
  }
  const expression = output.join("").replace(/,(?=\d)/g, ".");
  const open = (expression.match(/\(/g) || []).length, close = (expression.match(/\)/g) || []).length;
  return expression + ")".repeat(Math.max(0, open - close));
}


