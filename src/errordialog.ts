import { DialogController } from 'aurelia-dialog';
import { autoinject, inject } from 'aurelia-framework';

@autoinject

export class ErrorDialog {
    message?: string;
    action?: (args?: any) => {};
    controller: DialogController

    constructor(private dialogController: DialogController) {
        this.controller = dialogController;
        this.controller.settings.centerHorizontalOnly = true;
    }

    activate(model: any) {
        this.message = model.message;
        this.action = model.action;
    }

    ok(): void {
        this.action();
        this.dialogController.ok();
    }
}