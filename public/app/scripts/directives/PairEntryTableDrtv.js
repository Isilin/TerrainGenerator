export default class PairEntryTableDrtv
{
    /*@ngInject*/
    constructor ($scope, $attrs, Analytics) {
        console.log($scope);
        this.templateUrl = '/app/views/pairEntryTable.html';
        this.restrict = 'A';
        this.replace = false;
        this.scope = {
            name: "@name",
            value: "@value"
        };

        this.$scope = $scope;
        this.$attrs = $attrs;
        this.Analytics = Analytics;
    }

    controller () {
        $scope.name = $attrs.name;
        $scope.value = $attrs.value;
        $scope.analytics = Analytics;
    }
};