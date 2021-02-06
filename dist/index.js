"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafeStorage = void 0;
var crypto_js_1 = require("crypto-js");
/**
 * SafeStorage provides a wrapper implementation of `localStorage` and `sessionStorage` for a better security solution in browser data store
 */
var SafeStorage = /** @class */ (function () {
    /**
     * Constructor
     * @param {string} secretKey - Encryptation key. Required
     * @param {string} prefix - Prefix used in storageKey. Defaults `undefined` EX: `@prefix:key`
     * @param {string} storageType - Storage type you prefer save your data. Only in `localStorage` and `sessionStorage`. Defaults `localStorage`
     */
    function SafeStorage(secretKey, prefix, storageType) {
        if (prefix === void 0) { prefix = ''; }
        if (storageType === void 0) { storageType = 'localStorage'; }
        this.secretKey = secretKey;
        this.prefix = prefix;
        this.storage = window[storageType];
    }
    /**
     * `setItem` - Is the function to be set `safeItem` in `selected storage`
     * @param {string} key - Is the key of `data` in `selected storage`.
     * @param {any} value - Value to be `encrypted`, the same being a `string` or `object`.
     * @return {void} `void`
     * @usage
     * 		setItem('any_key', {key: 'value', another_key: 2})
     * 		setItem('any_key', 'any value')
     */
    SafeStorage.prototype.setItem = function (key, value) {
        var storageKey = this.prefix ? this.prefix + ":" + key : key;
        var valueToString = typeof value === 'object' ? JSON.stringify(value) : String(value);
        var encryptedValue = crypto_js_1.AES.encrypt(valueToString, this.secretKey).toString();
        this.storage.setItem(storageKey, encryptedValue);
    };
    /**
     * `getItem` - Is the faction to be get `safeItem` in `localStorage`
     * @param {string} key - Is the key of `data` in `localStorage`.
     * @return {string | any | undefined} - Returns a formatted value when the same is an object or string when not.
     * Returns `undefined` when value not exists.
     * @usage
     * 		getItem('any_key') -> `{key: 'value', another_key: 2}`
     * 		getItem('any_key') -> `'any value'`
     */
    SafeStorage.prototype.getItem = function (key) {
        var item = this.storage.getItem(key);
        if (item) {
            var decryptedValue = crypto_js_1.AES.decrypt(item, this.secretKey).toString(crypto_js_1.enc.Utf8);
            try {
                return JSON.parse(decryptedValue);
            }
            catch (error) {
                return decryptedValue;
            }
        }
        return undefined;
    };
    /**
     * `removeItem` - Is the faction to be remove `safeItem` in `localStorage`
     * @param {string} key - Is the key of `data` in `localStorage`.
     * @return {void}
     * Returns `void`.
     * @usage
     * 		removeItem('any_key')
     */
    SafeStorage.prototype.removeItem = function (key) {
        this.storage.removeItem(key);
    };
    /**
     * `clear` - Clear all selectedStorage
     */
    SafeStorage.prototype.clear = function () {
        this.storage.clear();
    };
    /**
     * `key` - Return a `key` in selectedStorage index or `null`
     * @param {number} index - Index of `key` in `selectedStorage`
     */
    SafeStorage.prototype.key = function (index) {
        return this.storage.key(index);
    };
    return SafeStorage;
}());
exports.SafeStorage = SafeStorage;
