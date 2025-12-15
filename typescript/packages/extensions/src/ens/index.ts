/**
 * ENS Identity Extension exports
 */

export { ENS, type EnsInfo, type EnsParty, type EnsRecords, type EnsExtension } from "./types";
export {
  buildEnsExtension,
  validateEnsExtension,
  type ExtensionValidationResult,
  declareEnsExtension,
  type EnsExtensionDeclaration,
} from "./core";
