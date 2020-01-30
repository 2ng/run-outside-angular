import { Config } from './models';
import { DEFAULT_EXCLUDED_METHODS } from './constants';
import { throwError } from './throw-error';

export function RunOutsideAngular(config?: Config): ClassDecorator {
  return function(constructor: any) {
    const excludedMethods = config ? [...DEFAULT_EXCLUDED_METHODS, ...config.exclude] : DEFAULT_EXCLUDED_METHODS;

    const methods = Object.getOwnPropertyNames(constructor.prototype);

    methods
      .filter(method => !excludedMethods.includes(method))
      .forEach(method => {
        if (Object.getOwnPropertyDescriptor(constructor.prototype, method).set) {
          const original = Object.getOwnPropertyDescriptor(constructor.prototype, method).set;

          Object.defineProperty(constructor.prototype, method, {
            set: function(...args) {
              if (!this._ngZone) throwError(constructor.name);
              this._ngZone.runOutsideAngular(() => original.apply(this, args));
            },
          });
        }

        if (typeof constructor.prototype[method] === 'function') {
          const original = constructor.prototype[method];

          constructor.prototype[method] = function(...args: string[]) {
            if (!this._ngZone) throwError(constructor.name);
            return this._ngZone.runOutsideAngular(() => original.apply(this, args));
          };
        }
      });
  };
}
