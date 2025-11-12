// Settings and Credit JSDoc types for editor intellisense
/**
 * @typedef {'sync'|'local'} StorageBackend
 *
 * @typedef {'date'|'age'} TargetMode
 *
 * @typedef {Object} Settings
 * @property {string} dobISO
 * @property {string} startDateISO
 * @property {number} dailyRate
 * @property {TargetMode} targetMode
 * @property {string=} targetDateISO
 * @property {number=} targetAgeYears
 * @property {StorageBackend} storageBackend
 * @property {string} currency
 *
 * @typedef {Object} Credit
 * @property {string} id
 * @property {number} timestamp
 * @property {number} amount
 * @property {string=} note
 */


