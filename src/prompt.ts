import { autoinject } from 'aurelia-dependency-injection';
import { DialogController } from 'aurelia-dialog';

@autoinject
export class Prompt {
    controller: DialogController;

    constructor(controller: DialogController) {
        this.controller = controller;

        controller.settings.lock = false;
        controller.settings.centerHorizontalOnly = true;
    }
}


