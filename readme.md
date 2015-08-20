Project for creating a generic JIRA issue creation form

Modify the sample index.jade file to point to your JIRA instance, and to use
your custom fields. Then, to build run:

```
npm install
gulp build
```

To view an example app:

```
gulp serve
```

Note that gulp will only serve the web application portion of this repository.
In order to have it work end to end, you will need to either set up your own
proxy to your JIRA instance, or use the php proxy provided.

If you are using this code by itself, you can mark an element with an ID,
as specified in inquiryIds, and add the inquiry-form attribute and class to it.
For an example, see index.jade.

If you are using this code as part of an AngularJS application, you should
include the AngularJS module in your project, and use the directive directly,
no IDs needed.

The configuration object:

The configuration for this should be contained in the global variable 
'jiraConfig'. It has many fields:

title - A string that is the title that will appear at the top of the form

errorContact - A string that is the contact information that you want to display
if something goes wrong.

inquiryIds - An array of strings that are the html IDs that identify where the 
form should bootstrap itself, for if you are not using angular on your page.

proxyUrl - The relative path to the proxy you set up to JIRA

server - The url of the JIRA server

inquiryDumpFieldJiraName - The human friendly name of the inquiryDumpField.
Purely for programmer convenience

inquiryDumpField - The field that the form will dump the entire json of the form
into so that no matter what, you will always have a complete record of the request

formFields - An array of objects specifying what each field in the form will
look like. Each object has a number of fields.
    
    name - The name of the field in the form. This is what the user of the form
    will see
    
    required - A boolean that, if true, will prevent submission of the form
    until this field is filled out.
    
    type - A string that specifies the type of form input to use. Options are
        text - A text field
        tel - A text field specifically for phone numbers
        email- A text field specifically for emails
        select - A drop down menu. If this options is selected, you will need
        to set the options field, see below.
        label - just the name, no input is present,
        checkbox - a checkbox
        prelabel - As label, but the text is on the right side

    inquiryField - The name by which the field will be refered to internally

    options - An array of strings that are the options for the dropdown for an
    input of type select

commonFields - An object whose fields are objects describing the JIRA fields that
are common accross all the types of issues that this form will create. The name
of the field is the internal JIRA name of the field. Inside the object,
there are a number of options

    jiraName - A programmer convenience, a place to store the human-friendly name
    of the JIRA field

    inquiryField - The name of the field in the form that populates this JIRA
    field. Should be the same as at least one of the inquiryField values in
    formFields above.

    encloseInObject - A boolean. If true, will enclose the given input in an
    object like so { value: "thing" }. Some JIRA fields require this.

    map - An object that is a map between the options for the form
    and JIRA.

issueTypes - An object whose fields are objects describing the JIRA fields that
are specific to that issue type. The names of the fields are the JIRA names
of the issue types. The options for these are the same as the ones inside common
fields

issueType - Either a string, or a function that takes the inquiry object and
returns a string, that is used to determine the type of the issue to be
created. It takes an object that has the values in the form as fields, named
according to the inquiryField names. It should return a string that matches a
issue type specified in the issueTypes object.

summary - Either a string, or a function that takes the inquiry object and
returns a string that is the name of the field to use as the overall name
of the created item.

projectKey - Either a string, or a function that takes the inquiry object and
returns a string that is the key for the project that you want the form to
create items in
