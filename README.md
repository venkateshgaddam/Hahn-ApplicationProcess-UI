# Hahn-ApplicationProcess-UI

This project is been created using basic aurelia with typescript template.

# Prerequisites

We need to have aurelia installed in our system inorder to make this project Run.

# step-1
Install  #NODEJS in your System from https://nodejs.org/en/.

# step-2
Install a  Git Client using from https://git-scm.com/.

# step-3
Install the aurelia CLI  npm install -g aurelia-cli
  
# This project is created using the command au new --here and the Template is Default TypeScript

# Install the Dependencies

If you have the aurelia prerequisites installed already, please use the below command 
use npm install to install all the dependencies

# RUNNING THE APP

use the below command to run the APP

au run --watch 

or 

npm start


# Validation 

I have used the validation trigger as change so that whenever we change the value the validation results won't get displayed.

For Enabling the Submit and the RESET Button, we are using focusout event on the inputs.

# API Integration

In order to send the data from UI to the backend and save the Data, we need not to run both the UI and the backend projects at a time. I have deployed the WEBAPI as a Serverless API and have added the URL which got generated inorder to make a seamless UI experience.

If u still want to run both the projects, change the HttpClient Configure method which contains the baseURL (This needs to be changed).

Once the data is successfully submitted and the Data is stored in the DB we will be redirected to a View which confirms that the data is been sent and stored in the backend.
 
