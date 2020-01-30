interface Config {
  exclude?: string[];
}

const DEFAULT_EXCLUDED_METHODS = [
  'constructor',
  'ngOnChanges',
  'ngOnInit',
  'ngDoCheck',
  'ngAfterContentInit',
  'ngAfterContentChecked',
  'ngAfterViewInit',
  'ngAfterViewChecked',
  'ngOnDestroy',
];

function throwError(targetName) {
  throw new Error(`Add '_ngZone: NgZone' in constructor class ${targetName}`);
}

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
