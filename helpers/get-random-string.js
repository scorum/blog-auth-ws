function getRandomString(x) {
  const DIGITS = '0123456789';
  const UPPERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  // const LOWERS = 'abcdefghijklmnopqrstuvwxyz';
  const AMBIGUOUS = 'B8G6I1l0OQDS5Z2';

  let text = '';
  let strLength = 5; // default value
  const possible = `${UPPERS}${DIGITS}`;

  if (!Number.isNaN(Number.parseInt(x, 10))) {
    strLength = Math.abs(x);
  }

  while (text.length < strLength && strLength > 0) {
    const randomPos = Math.floor(Math.random() * possible.length);
    const char = possible.charAt(randomPos);

    if (!AMBIGUOUS.includes(char)) {
      text += possible.charAt(randomPos);
    }
  }

  return text;
}

module.exports = getRandomString;
