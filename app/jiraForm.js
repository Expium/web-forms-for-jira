; (function (angular, jiraConfig, document) {
  'use strict';

  angular.module('jiraForm', ['ngMessages', 'templates', 'jiraCreate'])
    .controller('InquiryController', function (JIRA, $scope, validateConfig) {
      var wffj = this;
      wffj.config = angular.isString($scope.config) ? window[$scope.config] : $scope.config;
      var defaultInquiry = {};
      wffj.inquiry = angular.copy(defaultInquiry);
      angular.forEach(wffj.config.formFields, function (field) {
        wffj.inquiry[field.inquiryField] = field.default;
      });
      wffj.message = {};
      wffj.failureContact = wffj.config.errorContact
      if (!validateConfig(wffj.config)) {
        wffj.showFailureMessage = true;
        return;
      }
      angular.forEach(wffj.config.formFields, function (f) {
        if (f.default) {
          wffj.inquiry[f.inquiryField] = f.default;
        }
      });

      function handleError(error) {
        if (error.status != undefined) {
          wffj.message.error = error.status == 0 ? "The server couldn't be reached" : 'Failed to access server with return status: ' + error.statusText;
        } else {
          wffj.message.error = error;
        }
      }

      wffj.submit = function () {
        wffj.message.success = undefined;
        wffj.message.error = undefined;
        wffj.submitting = true;

        JIRA.submitRequest(wffj.inquiry, wffj.config)
          .then(function () {
            wffj.message.success = 'Request has been submitted successfully';
            wffj.inquiry = angular.copy(defaultInquiry);
            $scope.ssForm.$setPristine();
            $scope.ssForm.$setUntouched();
          })
          .catch(handleError)
          .finally(function () {
            wffj.submitting = false;
          });
      };
    })
    .directive('inquiryForm', function () {
      return {
        restrict: 'E',
        templateUrl: 'form.html',
        controller: 'InquiryController as wffj',
        scope: {
          config: "=",
          template: "@"
        }
      };
    })
    .factory('validateConfig', function () {
      function warn(err) {
        console.warn(err);
      }
      
      return function validateConfig(config) {
        if (!angular.isDefined(config)) {
          warn('configuration is undefined');
          return false;
        }
        if (!angular.isString(config.proxyUrl)) {
          warn('proxyUrl is undefined')
          return false;
        }
        if (!angular.isString(config.server)) {
          warn('No server provided');
          return false;
        }
        if (!angular.isString(config.inquiryDumpField)) {
          warn('No field provided to dump input to');
          return false;
        }
        if (!angular.isArray(config.formFields) || config.formFields.length == 0) {
          warn('No form fields provided')
          return false;
        }
        var ok = true;
        angular.forEach(config.formFields, function (field, i) {
          if (!field.name || !field.type || (field.type == "select" && !angular.isArray(field.options))) {
            warn('Invalid field ' + i)
            ok = false;
          }
        });
        if (!ok) {
          return false;
        }
        if (!config.issueTypes && !angular.isString(config.issueType)) {
          warn('No issue types defined');
          return false;
        }
        if (!angular.isString(config.issueType) && !angular.isFunction(config.issueType)) {
          warn('No issue type function or string defined');
          return false;
        }
        if (!angular.isString(config.projectKey)) {
          warn('No project key defined');
          return false;
        }
        
        if (!angular.isString(config.summary) && !angular.isFunction(config.summary)) {
          warn('No summary field string or function defined');
          return false;
        }
        return true;
      }
    });

  var appElems = document.querySelectorAll('[ng-app]');

  if (appElems.length == 0) {
    // Manually bootstrap onto element since there are no auto bootstrapped apps to do it for us
    angular.element(document).ready(function () {
      angular.forEach(document.getElementsByTagName('inquiry-form'), function (el) {
        angular.bootstrap(el, ['jiraForm']);
      });
    });
  }
})(window.angular, window.jiraConfig, window.document);