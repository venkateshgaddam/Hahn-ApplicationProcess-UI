import { Aurelia } from 'aurelia-framework';
import * as environment from '../config/environment.json';
import { PLATFORM } from 'aurelia-pal';
import { I18N } from 'aurelia-i18n';
import { ValidationMessageProvider } from 'aurelia-validation';


export function configure(aurelia: Aurelia): void {
  aurelia.use
    .standardConfiguration()
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-dialog'));

  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  ValidationMessageProvider.prototype.getMessage = function (key) {
    const i18n = aurelia.container.get(I18N);
    const translation = i18n.tr(`errorMessages.${key}`);
    return this.parser.parse(translation);
  };

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'))
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-validation'));
  }

  aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
