export function throwError(targetName) {
  throw new Error(`Add '_ngZone: NgZone' in constructor class ${targetName}`);
}
