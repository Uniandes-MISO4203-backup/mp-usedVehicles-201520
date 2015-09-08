(function(ng){
    var mod = ng.module('messageModule');
    
    mod.service('messageService', ['CrudCreator','messageContext', function(CrudCreator, context){
            CrudCreator.extendService(this, context);
    }]);

    mod.service('messageService', ['CrudCreator','messageContext', function(CrudCreator, context){
            CrudCreator.extendService(this, context);
            this.askQuestion = function(question){
                this.saveRecord(question);
            };
     }]);
})(window.angular);