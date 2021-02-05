import { RouterConfiguration, Router } from 'aurelia-router';
import { autoinject } from 'aurelia-dependency-injection';
import { PLATFORM } from 'aurelia-pal';
import { ValidationControllerFactory, ValidationController, ValidationRules, validateTrigger } from 'aurelia-validation';
import { DialogService } from 'aurelia-dialog';
import { Dialog } from './Components/dialog';
import { validationMessages } from 'aurelia-validation';
import { HttpClient, json } from 'aurelia-fetch-client';
import { ErrorDialog } from './errordialog';
import { RedirectToRoute } from 'aurelia-router';

validationMessages['required'] = '\${$displayName} is missing!';

class errorStyles {
  NameStyle: string
  FamilyNameStyle: string
  CountryOfOriginstyle: string;
  AddressStyle: string
  EmailAddressStyle: string
  AgeStyle: string
  constructor() {
    this.NameStyle = '';
  }
}

class Applicant {
  Name: string;
  FamilyName: string;
  CountryOfOrigin: string;
  Address: string;
  EmailAddress: string;
  Age: string;
  Hired: boolean;
  validator: ValidationController;
  errorStyles: errorStyles;
}


@autoinject
export class App {
  Name: '';
  FamilyName: '';
  CountryOfOrigin: '';
  Address: '';
  EmailAddress: '';
  Age;
  Hired: false;
  applicantData: Applicant;
  controller: ValidationController;
  dialogService: DialogService;
  httpClient: HttpClient;
  getCountryClient: HttpClient;
  getCountryData;
  applicant;
  enableSubmitButton: boolean;
  enableResetButton: boolean;
  CountryName: string;
  styleString: string;
  propertywithError: string;
  errorStyles: errorStyles;
  countryfromDB: string;

  constructor(ControllerFactory: ValidationControllerFactory, dialogService: DialogService) {
    this.dialogService = dialogService;
    this.httpClient = new HttpClient();
    this.errorStyles = new errorStyles();
    this.applicantData = new Applicant();
    this.enableSubmitButton = false;
    this.enableResetButton = false;
    this.CountryName = '';

    this.getCountryClient = new HttpClient().configure(a => {
      a.useStandardConfiguration()
        .withBaseUrl("https://restcountries.eu/rest/v2")
        .withInterceptor({
          request(request) {
            return request;
          }
        });
    });


    this.getCountryClient.fetch('', {
      method: 'get', mode: 'cors',
    })
      .then(response => response.json())
      .then(data => {
        this.getCountryData = data;
        console.log(this.getCountryData);
      })
      .catch(error => { console.log(error) });


    this.httpClient.configure(cnf => {
      cnf.useStandardConfiguration()
        .withBaseUrl('https://localhost:5001/api/')
        .withDefaults({
          headers: {
            'content-type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'Fetch'
          }
        })
        .withInterceptor({
          request(request) {
            return request;
          }
        });
    });

    this.controller = ControllerFactory.createForCurrentScope();
    this.controller.validateTrigger = validateTrigger.change;


    ValidationRules.customRule('CountryOfOriginRule', (val, obj: Applicant) => {
      this.countryfromDB = this.getCountryData.find((a: { name: any; }) => a.name == val);
      if (this.countryfromDB != undefined) {
        this.CountryName = this.countryfromDB["name"];
        console.log(this.CountryName);
      }
      if (this.CountryName === val) { return true; }
      return false;
    }, '\${$displayName} is an Invalid Country');

    ValidationRules
      .ensure('Name')
      .displayName('Name')
      .required()
      .withMessage('\${$displayName} is Required')
      .minLength(5)
      .withMessage('\${$displayName} cannot be less than 5 charecters')
      .ensure('FamilyName')
      .displayName('FamilyName')
      .required()
      .withMessage('\${$displayName} is Required')
      .minLength(5)
      .withMessage('\${$displayName} cannot be less than 5 charecters')
      .ensure('Address')
      .displayName('Address')
      .required()
      .withMessage('\${$displayName} is Required')
      .minLength(10)
      .withMessage('\${$displayName} cannot be less than 10 charecters')
      .ensure('EmailAddress')
      .displayName('EmailAddress')
      .required()
      .withMessage('\${$displayName} is Required')
      .matches(/^[a-zA-Z0-9.!#$%&'+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)$/)
      .withMessage('\${$displayName} is Invalid')
      .ensure('Age')
      .displayName('Applicant Age')
      .required()
      .withMessage('\${$displayName} is Required')
      .between(20, 60)
      .withMessage('\${$displayName} should be in between 20 & 60')
      .ensure('Hired')
      .displayName('Hired')
      .required()
      .withMessage('\${$displayName} is Required')
      .ensure('CountryOfOrigin')
      .displayName('CountryOfOrigin')
      .required().withMessage('\${$displayName} is Required')
      .satisfiesRule('CountryOfOriginRule')
      .withMessage('\${$displayName} is an Invalid Country')
      .on(Applicant);
  }
  router: Router;

  configureRouter(config: RouterConfiguration, router: Router, httpClient: HttpClient): void {
    this.router = router;
    config.options.pushState = true;
    config.title = 'Hahn Application Process';
    config.map([
      { route: ['', 'home'], name: 'homepage', moduleId: PLATFORM.moduleName('./Components/Home/home.html'), title: 'Home', nav: true },
      { route: 'AddSuccess', name: 'AddSuccess', moduleId: PLATFORM.moduleName('./Components/Applicant/AddSuccess.html'), nav: false, title: 'Add' },
    ]);
    config.mapUnknownRoutes('not-found');
  }

  SubmitApplicantData() {
    this.applicant = {
      name: this.applicantData.Name, familyName: this.applicantData.FamilyName,
      address: this.applicantData.Address, emailAddress: this.applicantData.EmailAddress,
      countryOfOrigin: this.applicantData.CountryOfOrigin, age: parseInt(this.applicantData.Age),
      hired: this.applicantData.Hired
    }
    this.httpClient.fetch('Applicant', {
      method: 'post',
      mode: 'cors',
      body: json(this.applicant)
    })
      .then(response => response.json())
      .then(savedComment => {
        this.applicantData.Name = '';
        this.applicantData.FamilyName = '';
        this.applicantData.CountryOfOrigin = '';
        this.applicantData.Address = '';
        this.applicantData.EmailAddress = '';
        this.applicantData.Age = '';
        this.applicantData.Hired = false;
        this.enableResetButton = false;
        this.enableSubmitButton = false;
        new RedirectToRoute('AddSuccess').navigate(this.router);
        console.log(`Saved comment! ID: ${savedComment.id}`);
      })
      .catch(error => {
        console.log(this.applicant);
        console.log(JSON.stringify(error));
        this.dialogService.open({
          viewModel: ErrorDialog, model: { message: error, action: this.action }
          , lock: false
        }).whenClosed(response => {
          if (!response.wasCancelled) {
            this.applicantData.Name = '';
            this.applicantData.FamilyName = '';
            this.applicantData.CountryOfOrigin = '';
            this.applicantData.Address = '';
            this.applicantData.EmailAddress = '';
            this.applicantData.Age = '';
            this.applicantData.Hired = false;
            this.enableResetButton = false;
            this.enableSubmitButton = false;
          } else {
            console.log(JSON.stringify(response));
          }
        });
      });
  }
  doSomething(){
    if (this.controller.errors.length > 0) {
      console.log(this.controller.errors);
      this.enableResetButton = true;
      this.enableSubmitButton = false;

      if (this.controller.errors.find(a => a.propertyName == 'Name')) {
        this.errorStyles.NameStyle = 'border-color: red;';
      } if (this.controller.errors.find(a => a.propertyName == 'FamilyName')) {
        this.errorStyles.FamilyNameStyle = 'border-color: red;';
      } if (this.controller.errors.find(a => a.propertyName == 'Age')) {
        this.errorStyles.AgeStyle = 'border-color: red;';
      } if (this.controller.errors.find(a => a.propertyName == 'Address')) {
        this.errorStyles.AddressStyle = 'border-color: red;';
      } if (this.controller.errors.find(a => a.propertyName == 'EmailAddress')) {
        this.errorStyles.EmailAddressStyle = 'border-color: red;';
      }
      if (this.controller.errors.find(a => a.propertyName == 'CountryOfOrigin')) {
        this.errorStyles.CountryOfOriginstyle = 'border-color: red;';
      }
    }
  }

  action(propertyName: string) {
    if (this.applicantData.Name === '' || this.applicantData.FamilyName === '' || this.applicantData.CountryOfOrigin === '' ||
      this.applicantData.EmailAddress === '' || this.applicantData.Address === '' || this.applicantData.Age === '') {
      this.enableResetButton = false;
      this.enableSubmitButton = false;
    } else {
      if (this.controller.errors.length > 0) {
        console.log(this.controller.errors);
        this.enableResetButton = true;
        this.enableSubmitButton = false;

        if (this.controller.errors.find(a => a.propertyName == 'Name')) {
          this.errorStyles.NameStyle = 'border-color: red;';
        } if (this.controller.errors.find(a => a.propertyName == 'FamilyName')) {
          this.errorStyles.FamilyNameStyle = 'border-color: red;';
        } if (this.controller.errors.find(a => a.propertyName == 'Age')) {
          this.errorStyles.AgeStyle = 'border-color: red;';
        } if (this.controller.errors.find(a => a.propertyName == 'Address')) {
          this.errorStyles.AddressStyle = 'border-color: red;';
        } if (this.controller.errors.find(a => a.propertyName == 'EmailAddress')) {
          this.errorStyles.EmailAddressStyle = 'border-color: red;';
        }
        if (this.controller.errors.find(a => a.propertyName == 'CountryOfOrigin')) {
          this.errorStyles.CountryOfOriginstyle = 'border-color: red;';
        }
      } else {
        if (this.applicantData.Name === undefined || this.applicantData.FamilyName === undefined || this.applicantData.CountryOfOrigin === undefined ||
          this.applicantData.EmailAddress === undefined || this.applicantData.Address === undefined || this.applicantData.Age === undefined) {
          this.enableResetButton = false;
          this.enableSubmitButton = false;
        } else {
          this.enableResetButton = true;
          this.enableSubmitButton = true;
        }
        if (this.errorStyles.NameStyle == 'border-color: red;') {
          this.errorStyles.NameStyle = '';
        }
        if (this.errorStyles.FamilyNameStyle == 'border-color: red;') {
          this.errorStyles.FamilyNameStyle = '';
        }
        if (this.errorStyles.AgeStyle = 'border-color: red;') {
          this.errorStyles.AgeStyle = '';
        }
        if (this.errorStyles.AddressStyle = 'border-color: red;') {
          this.errorStyles.AddressStyle = '';
        }
        if (this.errorStyles.EmailAddressStyle = 'border-color: red;') {
          this.errorStyles.EmailAddressStyle = '';
        }
        if (this.errorStyles.CountryOfOriginstyle = 'border-color: red;') {
          this.errorStyles.CountryOfOriginstyle = '';
        }

      }
    }
  }

//Reset Operation
  reset() {
    this.dialogService.open({
      viewModel: Dialog, model: { message: 'Are you sure?', action: this.action }
      , lock: false
    }).whenClosed(response => {
      if (!response.wasCancelled) {
        this.applicantData.Name = '';
        this.applicantData.FamilyName = '';
        this.applicantData.CountryOfOrigin = '';
        this.applicantData.Address = '';
        this.applicantData.EmailAddress = '';
        this.applicantData.Age = '';
        this.applicantData.Hired = false;
        this.enableResetButton = false;
        this.enableSubmitButton = false;
        this.errorStyles = new errorStyles();
      } else {
        console.log(JSON.stringify(response));
      }
    });
  }
}

