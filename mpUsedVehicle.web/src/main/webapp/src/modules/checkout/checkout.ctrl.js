(function (ng) {
    var mod = ng.module('checkoutModule');

    mod.controller('checkoutCtrl', ['CrudCreator', '$scope', 'checkoutService', 'cartItemModel', '$location', 'authService', '$timeout', function (CrudCreator, $scope, svc, model, $location, authSvc, $timeout) {
            CrudCreator.extendController(this, svc, $scope, model, 'cartItem', 'My Shopping Cart');
            var self = this;

            var oldFetch = this.fetchRecords;
            this.fetchRecords = function () {
                return oldFetch.call(this).then(function (data) {
                    self.calcTotal();
                    return data;
                });
            };
            this.fetchRecords();
            this.readOnly = true;
            $scope.lastQuantity = 0;
            $scope.total = 0;
            $scope.taxes = 0;
            $scope.subtotal = 0;
            $scope.credit = true;
            $scope.confirm = false;

            this.recordActions = {
                delete: {
                    displayName: ' ',
                    icon: 'trash',
                    class: 'primary',
                    fn: function (record) {
                        svc.deleteRecord(record).then(function () {
                            self.fetchRecords();
                        });
                    },
                    show: function () {
                        return true;
                    }
                }};
            
            this.calcTotal = function () {
                $scope.total = 0;
                $scope.taxes = 0;
                $scope.subtotal = 0;
                var order = $scope.records[0];
                for (var i = 0; i < order.cartItems.length; i++) {
                    $scope.subtotal += order.cartItems[i].product.price;
                    $scope.taxes += (order.cartItems[i].product.price * 0.16);
                }
                $scope.total = $scope.subtotal + $scope.taxes;
            };

            $scope.verify = function (quantity) {
                $scope.lastQuantity = quantity;
            };//guarda la cantidad anterior

            $scope.postVerify = function (record) {
                var patron = /^\d*$/; //^[0-9]{3}$
                if (patron.test(record.quantity) && record.quantity > 0) {
                    self.calcTotal();
                } else {
                    self.showError("You must enter a valid quantity");
                    record.quantity = $scope.lastQuantity;
                    $scope.currentRecord = record;
                }
            };//Realiza la validacion de la nueva cantidad asignada.
            
            
            
            $scope.toggleConfirmation = function(){
                $scope.confirm = !$scope.confirm;
                $('#confirmationModal').modal('show');
            };
            
            $scope.pay = function () {
                $scope.records[0].amount = $scope.subtotal;
                $scope.records[0].taxAmount = $scope.taxes;
                $scope.records[0].amountWithTaxes = $scope.total;
                $scope.records[0].orderStatus = 'AUTHORIZED';
                $scope.records[0].paymentMethod = ($scope.credit)?'CREDIT_CARD':'DEBIT_CARD';
                $scope.confirm = !$scope.confirm;
                $('#confirmationModal').modal('hide');
                svc.saveOrder($scope.records[0]);
                $timeout(function(){
                     $location.path('/');
                }, 1000);
               
                
            };
            
            
            
            
            
            $scope.paymentMethods = [{
                "type": "CREDIT_CARD",
                "agreements": [{
                    "name": "VISA",
                    "description": "Visa",
                    "logo": "url visa"
                },
                {
                    "name": "MASTER_CARD",
                    "description": "Master Card",
                    "logo": "url visa"
                }]
            },
            {
                "type": "PSE",
                "agreements": [{
                    "name": "PSE",
                    "description": "PSE",
                    "logo": "url PSE"
                }]
            },
            {
                "type": "DEBIT_CARD",
                "agreements": [{
                    "name": "DEBIT",
                    "description": "Debit",
                    "logo": "url Debit"
                }]
            }];
            
            //cambia el metodo de pago
            $scope.togglePaymentMethodSelection = function(){
                $scope.credit = !$scope.credit;
            };
        }]);

})(window.angular);
