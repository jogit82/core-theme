define(["modules/jquery-mozu", 
    "underscore", 
    "hyprlive", 
    "modules/backbone-mozu", 
    'hyprlivecontext', 
    'modules/editable-view',
    'modules/amazonpay'], 
    function ($, _, Hypr, Backbone, HyprLiveContext, EditableView, AmazonPay) {

var CheckoutStepView = EditableView.extend({
        edit: function () {
            this.model.edit();
        },
        next: function () {
            // wait for blur validation to complete
            var me = this;
            me.editing.savedCard = false;
            _.defer(function () {
                me.model.next();
            });
        },
        cancel: function(){
            this.model.cancelStep();
        },
        choose: function () {
            var me = this;
            me.model.choose.apply(me.model, arguments);
        },
        constructor: function () {
            var me = this;
            EditableView.apply(this, arguments);
            me.resize();
            setTimeout(function () {
                me.$('.mz-panel-wrap').css({ 'overflow-y': 'hidden'});
            }, 250);
            me.listenTo(me.model,'stepstatuschange', me.render, me);
            me.$el.on('keypress', 'input', function (e) {
                if (e.which === 13) {
                    me.handleEnterKey(e);
                    return false;
                }
            });
        },
        amazonShippingAndBilling: function() {
            var payments = window.order.get('payments');
            var amazonpayment= _.findWhere(payments, {'paymentType' : 'PayWithAmazon'});
            
            window.location = "/checkoutV2/"+window.order.id+"?isAwsCheckout=true&access_token="+amazonpayment.data.awsData.addressAuthorizationToken+"&view="+AmazonPay.viewName;
        },
        initStepView: function() {
            this.model.initStep();
        },
        handleEnterKey: function (e) {
            this.model.next();
        },
        render: function () {
            this.$el.removeClass('is-new is-incomplete is-complete is-invalid').addClass('is-' + this.model.stepStatus());
            EditableView.prototype.render.apply(this, arguments);
            this.resize();
        },
        toggleMultiShipMode : function() {
            this.model.toggleMultiShipMode();
            this.render();
        },
        resize: _.debounce(function () {
            this.$('.mz-panel-wrap').animate({'height': this.$('.mz-inner-panel').outerHeight() });
        },200)
    });
    return CheckoutStepView; 
});