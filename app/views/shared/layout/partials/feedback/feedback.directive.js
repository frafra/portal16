'use strict';

var angular = require('angular');
angular
    .module('portal')
    .directive('feedback', feedbackDirective);

/** @ngInject */
function feedbackDirective() {
    var directive = {
        restrict: 'A',
        transclude: true,
        templateUrl: '/api/feedback/template.html',
        scope: {},
        replace: true,
        controller: feedback,
        controllerAs: 'vm',
        bindToController: true
    };

    return directive;

    /** @ngInject */
    function feedback($scope, $location, NAV_EVENTS, $http) {
        var vm = this;
        vm.location = $location.path();
        vm.isActive = false;
        vm.contentFeedback = undefined;
        vm.issue = {};
        vm.issues = {};
        vm.ISSUES = 'issues';
        vm.CONFIRMATION = 'confirmation';
        vm.type = {
            //0 left out to allow falsy test a la : if (vm.type) then ...
            CONTENT: 'content',
            FUNCTIONALITY: 'bug',
            IDEA: 'idea',
            QUESTION: 'question'
        };
        vm.selected = undefined;

        $scope.$on(NAV_EVENTS.toggleFeedback, function (event, data) {
            if (data.toggle) {
                vm.isActive = !vm.isActive;
            } else {
                vm.isActive = data.state;
            }
        });

        vm.close = function () {
            vm.isActive = false;
        };

        vm.toggle = function (type) {
            if (vm.selected == type) {
                vm.selected = undefined;
            } else {
                vm.selected = type;
            }
        };

        vm.createIssue = function (formData) {
            var issue = {
                width: window.innerWidth,
                height: window.innerHeight,
                type: vm.selected,
                form: formData
            };
            $http.post('/api/feedback/bug', issue, {}).then(function (response) {
                vm.referenceId = response.data.referenceId;
                vm.selected = vm.CONFIRMATION;
                vm.state = 'SUCCESS';
            }, function () {
                vm.state = 'FAILED';
            });
        };

        vm.gotoRoot = function () {
            vm.selected = undefined;
            vm.forceShowForm = false;
        };

        vm.updateContentFeedbackType = function () {
            $http.get('/api/feedback/content?path=' + encodeURIComponent($location.path()), {})
                .then(function (response) {
                    vm.contentFeedback = response.data;
                }, function (err) {
                    console.log(err);
                });
        };
        vm.updateContentFeedbackType();

        vm.getIssues = function () {
            $http.get('/api/feedback/issues?item=' + encodeURIComponent($location.path()), {})
                .then(function (response) {
                    vm.issues = response.data;
                    if (vm.issues.total_count) {
                        vm.selected = vm.ISSUES;
                    }
                }, function (err) {
                    vm.issues = {};
                    //TODO mark as failure or simply hide
                });
        };
        vm.getIssues();

    }
}

module.exports = feedbackDirective;
