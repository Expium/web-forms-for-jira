;(function (angular) {
  angular.module('jiraCreate', [])
    .provider('JIRA', function () {
      var jira = {};
      this.$get = ['$http', '$filter', '$q', function ($http, $filter, $q) {
        jira.encloseInObject = function (field) {
          return { value: field };
        };
        
        jira.generateField = function (field, inquiry) {
          if (field.value) {
            return field.value;
          } else if (!inquiry[field.inquiryField]) {
            return;
          }
          var value = field.map ? field.map[inquiry[field.inquiryField]] : inquiry[field.inquiryField];
          value = field.filter ? field.filter(value) : value;
          return field.encloseInObject ? jira.encloseInObject(value) : value;
        };
        
        jira.createIssue = function (summary, issueType, project) {
          return  {
              fields: {
                summary: summary,
                issuetype: {
                  name: issueType
                },
                project:
                {
                  key: project
                }
              }
            };
        }
        
        jira.issuePath = jira.issuePath || '/rest/api/2/issue';
        jira.defaultProxy = jira.defaultProxy || '/jira-form-proxy.php?url=';
        jira.postItem = function (item, server, proxy) {
          return $http.post((proxy || jira.defaultProxy) + (server || jira.defaultServer) + jira.issuePath, item);
        }
        
        jira.submitRequest = function (inquiry, config) {
          if (config.onSubmit) {
            config.onSubmit();
          }
          var summary = angular.isString(config.summary) ? config.summary : config.summary(inquiry),
              issueType = angular.isString(config.issueType) ? config.issueType : config.issueType(inquiry),
              project = angular.isString(config.projectKey) ? config.projectKey : config.projectKey(inquiry),
              issue = jira.createIssue(summary, issueType, project);
  
          angular.forEach(config.commonFields, function (fieldMeta, fieldName) {
            issue.fields[fieldName] = jira.generateField(fieldMeta, inquiry);
          });
  
          if (angular.isDefined(config.issueTypes)) {
            angular.forEach(config.issueTypes[issue.fields.issuetype.name], function (fieldMeta, fieldName) {
              issue.fields[fieldName] = jira.generateField(fieldMeta, inquiry);
            });
          }
  
          issue.fields[config.inquiryDumpField] = $filter('json')(inquiry);
  
          return jira.postItem($filter('json')(issue), config.server, config.proxyUrl)
            .then(jira.checkSuccessValidity)
            .catch(function (e) {
              if (!config.retryOnError) {
                return $q.reject(e);
              }
              var simpleIssue = {
                fields: {
                  summary: "Error from form",
                  issuetype: {
                    name: issueType
                  },
                  project: {
                    key: project
                  }
                }
              };
              simpleIssue[config.inquiryDumpField] = issue.fields[config.inquiryDumpField] + "\n\n" + $filter('json')(err);
              return jira.postItem($filter('json')(simpleIssue), config.server, config.proxyUrl)
            });
        };
        
        jira.checkSuccessValidity = function (response){
            var data = response.data;
            if (!(angular.isObject(data) && angular.isString(data.self) && angular.isString(data.key)&& angular.isString(data.id))) {
              throw 'Got success, but response does not match expectation.';
            }
            return response;
          };
        
        return jira;
      }];
      
      this.setJIRAIssueCreationPath = function (path) {
        jira.issuePath = path;
      }
      this.setServer = function (server) {
        jira.defaultServer = server;
      }
      this.setProxy = function (proxy) {
        jira.defaultProxy = proxy;
      }
    });
})(window.angular);