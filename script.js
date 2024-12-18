// RSA Implementation
class RSA {
  static randomPrime(bits) {
    const min = bigInt.one.shiftLeft(bits - 1);
    const max = bigInt.one.shiftLeft(bits).prev();

    while (true) {
      let p = bigInt.randBetween(min, max);
      if (p.isProbablePrime(256)) {
        return p;
      }
    }
  }

  static generate(keysize) {
    const e = bigInt(65537);
    let p;
    let q;
    let totient;

    do {
      p = this.randomPrime(keysize / 2);
      q = this.randomPrime(keysize / 2);
      totient = bigInt.lcm(p.prev(), q.prev());
    } while (
      bigInt.gcd(e, totient).notEquals(1) ||
      p.minus(q).abs().shiftRight(keysize / 2 - 100).isZero()
    );

    return {
      e,
      n: p.multiply(q),
      d: e.modInv(totient),
    };
  }

  static encrypt(encodedMsg, n, e) {
    return bigInt(encodedMsg).modPow(e, n);
  }

  static decrypt(encryptedMsg, d, n) {
    return bigInt(encryptedMsg).modPow(d, n);
  }

  static encode(str) {
    const codes = str
      .split("")
      .map((i) => i.charCodeAt())
      .join("");

    return bigInt(codes);
  }

  static decode(code) {
    const stringified = code.toString();
    let string = "";

    for (let i = 0; i < stringified.length; i += 2) {
      let num = Number(stringified.substr(i, 2));

      if (num <= 30) {
        string += String.fromCharCode(Number(stringified.substr(i, 3)));
        i++;
      } else {
        string += String.fromCharCode(num);
      }
    }

    return string;
  }
}

// Function to display the modal
function showModal(title, message) {
  document.getElementById("modalTitle").innerText = title;
  document.getElementById("modalMessage").innerText = message;
  document.getElementById("infoModal").showModal();
}

// RSA-related variables
let publicKey = {};
let privateKey = {};

// Event listener for generating keys
document.getElementById("generateKeys").addEventListener("click", () => {
  const keysize = parseInt(document.getElementById("keySize").value);

  if (!keysize || keysize < 256) {
    showModal("Error", "Please enter a valid key size (minimum 256).");
    return;
  }
  

  const keys = RSA.generate(keysize);
  publicKey = { n: keys.n, e: keys.e };
  privateKey = { n: keys.n, d: keys.d };

  document.getElementById("publicKey").value = JSON.stringify(publicKey, null, 2);
  document.getElementById("privateKey").value = JSON.stringify(privateKey, null, 2);

  showModal("Success", "Keys have been generated successfully!");
});

// Event listener for encrypting messages
document.getElementById("encryptMessage").addEventListener("click", () => {
  const message = document.getElementById("message").value;

  if (!message || !publicKey.n || !publicKey.e) {
    showModal("Error", "Generate keys first and provide a valid message.");
    return;
  }

  const encodedMsg = RSA.encode(message);
  const encryptedMsg = RSA.encrypt(encodedMsg, publicKey.n, publicKey.e);
  document.getElementById("encryptedMessage").value = encryptedMsg.toString();

  showModal("Success", "Message encrypted successfully!");
});

// Event listener for decrypting messages
document.getElementById("decryptMessageBtn").addEventListener("click", () => {
  const encryptedInput = document.getElementById("decryptMessage").value;

  if (!encryptedInput || !privateKey.n || !privateKey.d) {
    showModal("Error", "Generate keys first and provide an encrypted message.");
    return;
  }

  const decryptedCode = RSA.decrypt(bigInt(encryptedInput), privateKey.d, privateKey.n);
  const decodedMsg = RSA.decode(decryptedCode);
  document.getElementById("decryptedMessage").value = decodedMsg;

  showModal("Success", "Message decrypted successfully!");
});

// Adding Caesar Cipher Functions
function caesarEncrypt(message, shift) {
return message
  .split("")
  .map(char => {
    if (char.match(/[a-z]/i)) {
      const code = char.charCodeAt(0);
      const base = code >= 65 && code <= 90 ? 65 : 97; // Uppercase or lowercase
      return String.fromCharCode(((code - base + shift) % 26) + base);
    }
    return char; // Non-alphabetic characters remain unchanged
  })
  .join("");
}

function caesarDecrypt(encryptedMessage, shift) {
return caesarEncrypt(encryptedMessage, 26 - (shift % 26));
}

// Event listener for Caesar Cipher Encryption
document.getElementById("caesarEncryptBtn").addEventListener("click", () => {
const message = document.getElementById("caesarMessage").value;
const shift = parseInt(document.getElementById("caesarShift").value);

if (!message || isNaN(shift)) {
  showModal("Error", "Please provide a valid message and shift value.");
  return;
}

const encryptedMessage = caesarEncrypt(message, shift);
document.getElementById("caesarEncryptedMessage").value = encryptedMessage;
showModal("Success", "Message encrypted using Caesar Cipher!");
});

// Event listener for Caesar Cipher Decryption
document.getElementById("caesarDecryptBtn").addEventListener("click", () => {
const encryptedMessage = document.getElementById("caesarEncryptedMessageInput").value;
const shift = parseInt(document.getElementById("caesarShift").value);

if (!encryptedMessage || isNaN(shift)) {
  showModal("Error", "Please provide a valid encrypted message and shift value.");
  return;
}

const decryptedMessage = caesarDecrypt(encryptedMessage, shift);
document.getElementById("caesarDecryptedMessage").value = decryptedMessage;
showModal("Success", "Message decrypted using Caesar Cipher!");
});
