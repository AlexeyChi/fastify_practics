import CryptoJS from 'crypto-js';

const key = 'secret phrase';

export const encrypt = (password) => CryptoJS.AES.encrypt(password, key).toString();

export const decrypt = (hash) => CryptoJS.AES.decrypt(hash, key).toString(CryptoJS.enc.Utf8);
