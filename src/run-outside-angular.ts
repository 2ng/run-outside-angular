import { Config } from './models';
import { DEFAULT_EXCLUDED_METHODS } from './constants';
import { throwError } from './throw-error';

/**
  An Angular class decorator that wrap all class methods excluding
  constructor and Angular lifecycle methods on ngZone.runOutsideAngular().
  Add method names which should be excluded in config.

  ```ts
  import { RunOutsideAngular } from 'run-outside-angular'

  @RunOutsideAngular({
    exclude: ['yo']
  })
  @Component({...})
   export class ExampleComponent {
    // _ngZone must be in constructor class
    constructor(private _ngZOne: NgZone)

    yo() {
        // will be runned in Angular Zone
    }

     hoho() {
        // will be runned out Angular Zone
    }
   }
  ```
  @Annotation
 */
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
