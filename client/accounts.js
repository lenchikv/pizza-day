

// configure the special accounts user interface
// by setting up some extra fields and specifying constraints
// see:https://github.com/ianmartorell/meteor-accounts-ui-bootstrap-3/    
Accounts.ui.config({
    requestPermissions: {},
    extraSignupFields: [{
        fieldName: 'email',
        fieldLabel: 'E-mail',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {
            errorFunction("Please write E-mail");
            return false;
          } else {
            return true;
          }
        }
    }, {
        fieldName: 'firstName',
        fieldLabel: 'Last name',
        inputType: 'text',
        visible: true,
        validate: function(value, errorFunction) {
          if (!value) {                                
            errorFunction("Please write your first name");
            return false;
          } else {
            return true;
          }
    	}
    }, 
    {
        fieldName: 'lastName',
        fieldLabel: 'Last name',
        inputType: 'text',
        visible: true,
	validate: function(value, errorFunction) {
	if (!value) {                                
            errorFunction("Please write your last name");
            return false;
          } else {
            return true;
          }
	}
     }
    ]
});

