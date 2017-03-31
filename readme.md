# Web Forms for JIRA

This project contains a library and example code for creating web forms which
populate/create JIRA items. This is less convenient than the "issue collector",
but much more customizable.

The project uses AngularJS 1.4 and ngMessages.
Both are loaded from a CDN; you can copy their files for local deployment
if you prefer.

Because JIRA does not serve CORS headers, it is necessary to use a server-side
proxy. (Strictly speaking, with an in-house JIRA Server install it is possible to
configure CORS, but not with the popular Cloud deployment option.)

Therefore, the project consists of three pieces:
* Proxy script (PHP for easy deployment to nearly any web host)
* Backend library (packaged as an AngularJS "service")
* Form automation library (AngularJS "directive")

To use the proxy, serve it where your app can reach it, on a server that supports PHP.
Rename ```sample.jira-form-proxy-config.php``` to ```jira-form-proxy-config.php```,
and change the settings to match your JIRA installation and log folder.

You can use your own proxy, we are simply providing this for convenience;
the provided proxy has almost no features, other than limiting itself to a
single destination (so that it can't be readily abused).

To use the service only, you will need to depend on the 'jiracreate' module and
configure the 'JIRA' service. The available configuration methods are:

* **setJIRAIssueCreationPath(path)** - This sets the path on the JIRA server that creates the 
    item. It defaults to '/rest/api/2/issue'. You will likely not need to change this
    setting
* **setServer(serverUrl)** - This sets the default server that is passed to the proxy as a query
    parameter. It has no default value.
* **setProxy(proxyUrl)** - This sets the path to the proxy that will be used to pass the request
    on to JIRA. it defaults to '/jira-form-proxy.php?url=', the proxy that is provided
    with this library.
    
The service has several methods that you can use to help talk to JIRA:

* ```createIssue(summary, issueType, project)``` - creates an item skeleton,
    based on the parameters passed.
* ```postItem(item, server, proxy)``` - Takes an object representing
    a new JIRA item and posts it to the proxy. If you configured setServer,
    the server param is optional. The proxy param is always optional.
        
See sample-index-2.html for an example of using the service in this way.

The final piece of this library is an Angular directive. You can use it as part of
an Angular application by depending on the jiraForm module, and then pass it either
a string or an object via the config attribute. If the value passed is a string,
it will look on the global scope for an object with that name, and use that as
its configuration object.

You can also use this directive on its own, outside of an angular app. You will
still need to load angular and ng-messages on the page, but then you can simply
use the directive as normal. The lib will look through your page for uses of the
directive, and bootstrap an angular app there to support it. Note that using the
directive in this way means that you must pass a string to the directive, and
the config object must be on the global scope. See sample-index.html for an 
example of how to use the directive in this way. See below for more details on
the directive configuration object.
    

The directive configuration object:

The configuration for the directive should be contained in an object. It is passed to the
directive via the config attribute of the inquriy-form element. If a string is 
passed, the directive will look for an global variable with that name and use 
that. This is usefull if you are using this directive as a stand alone angular piece,
without creating your own Angular app. This configuration object has many fields:

* title - A string that is the title that will appear at the top of the form

* errorContact - A string that is the contact information that you want to display
if something goes wrong.

* proxyUrl - The relative path to the proxy you set up to JIRA

* server - The url of the JIRA server

* inquiryDumpFieldJiraName - The human friendly name of the inquiryDumpField.
Purely for programmer convenience

* inquiryDumpField - The field that the form will dump the request to. If you 
don't set a relationship between an input on the form and a field of the
JIRA item, you will still have a complete record of the request

* retryOnError - If the form gets an error attempting to create your issue,
the form will retry, only filling in the issue name and the inquiryDumpField,
as described above

* formFields - An array of objects specifying what each field in the form will
look like. Each object has a number of fields.
    
    * name - The name of the field in the form. This is what the user of the form
    will see
    
    * required - A boolean that, if true, will prevent submission of the form
    until this field is filled out.
    
    * type - A string that specifies the type of form input to use. Options are
        * text - A text field
        * tel - A text field specifically for phone numbers
        * email- A text field specifically for emails
        * select - A drop down menu. If this options is selected, you will need
        * to set the options field, see below.
        * label - just the name, no input is present,
        * checkbox - a checkbox
        * prelabel - As label, but the text is on the right side

    * inquiryField - The name by which the field will be refered to internally

    * options - An array of strings that are the options for the dropdown for an
    input of type select
    
    * placeholder - The string that will be the placeholder text for text inputs
    
    * maxlength - A number that becomes the maxlength for the text inputs
    
    * default - if provided, this will be used as the default value

* commonFields - An object whose fields are objects describing the JIRA fields that
are common accross all the types of issues that this form will create. The name
of the field is the internal JIRA name of the field. Inside the object,
there are a number of options

    * jiraName - A programmer convenience, a place to store the human-friendly name
    of the JIRA field

    * inquiryField - The name of the field in the form that populates this JIRA
    field. Should be the same as at least one of the inquiryField values in
    formFields above.

    * encloseInObject - A boolean. If true, will enclose the given input in an
    object like so { value: "thing" }. Some JIRA fields require this.

    * map - An object that is a map between the options for the form
    and JIRA.

* issueTypes - An object whose fields are objects describing the JIRA fields that
are specific to that issue type. The names of the fields are the JIRA names
of the issue types. The options for these are the same as the ones inside common
fields, above

* issueType - Either a string, or a function that takes the inquiry object and
returns a string, that is used to determine the type of the issue to be
created. It takes as a parameter an object that has the values in the form as fields,
named according to the inquiryField names. It should return a string that matches a
issue type specified in the issueTypes object.

* summary - Either a string, or a function that takes the inquiry object and
returns a string to use as the overall name of the created item.

* projectKey - Either a string, or a function that takes the inquiry object and
returns a string that is the key for the project that you want the form to
create items in

* onSubmit - A function that, if provided, will be called when the form is submitted.

#For Developers:

To test contributions to this repository, make modifications to the lib code in app,
then run 
```
npm install
gulp dev
```

Inside the dev folder this creates, you can create an index.html file that uses
this library and points to your JIRA instance. You can also create your
jira-form-proxy-config.php here.

To view your app:

```
gulp serve
```

Note that gulp will only serve the web application portion of this repository.
In order to have it work end to end, you will need to either set up your own
proxy to your JIRA instance, or use the php proxy provided with some other php
enabled server. If you don't have such a server handy, you can use Cloud 9: 

```
c9.io
```
