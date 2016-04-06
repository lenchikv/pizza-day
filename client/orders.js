//////////////////////////////////
// USER ORDER HELPERS
//////////////////////////////////
Template.userOrder.helpers({
    userOrder:function(event_id, user_id){
        return userOrder = Orders.find({event_id: event_id, user_id: user_id}, {fields: { item : 1, price: 1, quantity: 1}});
    },
    sumOrder:function(event_id, user_id){
        var sum = 0; 
        Orders.find({event_id: event_id, user_id: user_id}, 
            {fields: { item : 1, price: 1, quantity: 1}})
            .forEach(function (item) { sum += item.price*item.quantity; }); 
        return sum;
    }
});

//////////////////////////////////
// ADMIN ORDER HELPERS & EVENTS
//////////////////////////////////
Template.adminOrder.helpers({
    userOrder:function(event_id){
        //return userOrder = Orders.find({event_id: event_id}, {filter: { user_id : -1}, {sort: {started: -1}});
        return userOrder = Orders.find({event_id: event_id}, {sort: {user_id: -1}});
    },
    sumOrder:function(event_id){
    var sum = 0; 
    Orders.find({event_id: event_id})
        .forEach(function (item) { 
            sum += item.price*item.quantity;
        }); 
    
    return sum;
    },
    userSumTotal:function(event_id){
    	var data = PizzaEvents.findOne({_id: event_id}).membersSum;
    	return data.reduceRight(function(a,b){return a+b;})
    },	
    userName: function(user_id) {
        var data = Groups.findOne({"users.user_id": user_id});
     
        for (i = 0; i< data.users.length; i++) {
            if (data.users[i].user_id == user_id) return data.users[i].user;
        }
        return "";
    }   
});

Template.adminOrderTotal.helpers({
    adminOrdersTotal:function(event_id){
        var status = PizzaEvents.findOne({_id : event_id}).status;
        if (status > 0) {
             return OrdersTotal.find({event_id: event_id});
        }
    }
});    