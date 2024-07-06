import CryptoJS from 'crypto-js';

export const crypto = (password) => CryptoJS.SHA256(password);

export const genereateId = (n) => (n + 1).toString();
