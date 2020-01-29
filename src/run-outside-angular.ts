import { Config } from './config.interface';

const DEFAULT_EXCLUDED_METHODS = ['constructor'];

export function RunOutsideAngular(config?: Config): ClassDecorator {
  return function(constructor: any) {
    const excludedMethods = config ? [...new Set([...DEFAULT_EXCLUDED_METHODS, ...config.exclude])] : DEFAULT_EXCLUDED_METHODS;
    const methods = Object.getOwnPropertyNames(constructor.prototype);

    methods.forEach(method => {
      if (!excludedMethods.includes(method)) {
        const original = constructor.prototype[method];

        constructor.prototype[method] = function(...args: string[]) {
          try {
            return this._ngZone.runOutsideAngular(() => original.apply(this, args));
          } catch {
            throw new Error(`Add '_ngZone: NgZone' in constructor class ${constructor.name}`);
          }
        };
      }
    });
  };
}
