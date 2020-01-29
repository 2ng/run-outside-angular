# @RunOutsideAngular

An **Angular** class decorator that wrap all class methods on ngZone.runOutsideAngular(). Add method names which should be excluded in config.

```
npm i run-outside-angular
```

```js
import { RunOutsideAngular } from 'run-outside-angular';

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
