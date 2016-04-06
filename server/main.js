
  Meteor.startup(function () {
 	/*Send Email Through Gmail SMTP*/
	process.env.MAIL_URL="smtp://labby.director%40gmail.com:jssolutionslab@smtp.gmail.com:587";
	//AccountsEmailsField.updateAllUsersEmails();
	if (!Groups.findOne()) { //no groups
		Groups.insert({
			title: "Sales department",
			shortTitle: "sale",
			img: "/img/sales.png",
			users:[
				//{//user_id: "tHQFzsoKxt8Fpcoff",
				//email: "rvygovskiy@gmail.com",
		 		//user: "Roman Vygovskiy",
		 		//isAdmin: false},
				{//user_id: "wNfdb2449oFtXJtdL",
				email: "labby.director@gmail.com",
		 		user: "Lab Director",
		 		isAdmin: true}
				],
			menuItems:[
				{title:"Pizza with cheese",
				 price:5.5},
				{title:"Pizza with mushrooms",
				 price:4.5},
				{title:"Pizza with tomatoes",
				 price:6.5},
				{title:"Cola",
				 price:4},
				{title:"Apple juice",
				 price:2.5}
				]
		});
		Groups.insert({
			title: "IT department",
			shortTitle: "it",
			img: "/img/directors.png",
			users:[
				{//user_id: "KL4xWJAjzNi7mexvY",
				email: "elena.vygovska@gmail.com",
	 			user: "Elena Vygovskaya",
	 			isAdmin: true}
				],
                menuItems:[
				{title:"Sea-food pizza",
				 price:5.5},
				{title:"Pizza with salmon",
				 price:4.5},
				{title:"Pizza with meat",
				 price:6.5},
				{title:"Sprite",
				 price:2},
				{title:"Orange juice",
				 price:2.5}
				]
		});

    };

 Meteor.users.deny({update: function () { return true; }});


//to do search by mails for group admins
 Meteor.publish("emailUser", function () {
 	if (this.userId) {
     	return Meteor.users.find({},
        {fields: {'profile': 1, 'services.google.email': 1, 'services.google.name': 1}});
    } else this.ready();
  });

 
 Meteor.publish("groups", function(){
 	if (this.userId) {
    	return Groups.find();
	} else {
		return Groups.find({}, {fields: {title: 1, shortTitle: 1, img: 1, "users.user": 1}});
	}
  });
  
  Meteor.publish("pizzaEvents", function(){
  	if (this.userId) {
    	return PizzaEvents.find();
	} else {
		return PizzaEvents.find({}, {fields: {holder_id: 1, holder_name: 1, started: 1, status: 1}});
    }
  });

   Meteor.publish("orders", function(){
    return Orders.find({$or:[
    	{holder_id:this.userId},
        {user_id:this.userId}
      ] 
      });
  });

   Meteor.publish("ordersTotal", function(){
    return OrdersTotal.find({holder_id:this.userId});
  });

})  

//for server-side use
//event_id user_id
SSR.compileTemplate('serverUserOrder', Assets.getText('userOrder.html'));

Template.serverUserOrder.helpers({
	userOrder: function(event_id, user_id) {
	  return Orders.find({event_id: event_id, user_id: user_id});
	},

	sumOrder: function(event_id, user_id){
    var sum = 0; 
    Orders.find({event_id: event_id, user_id: user_id}, 
        {fields: { item : 1, price: 1, quantity: 1}})
        .forEach(function (item) { sum += item.price*item.quantity; }); 
    return sum;
	}
});


SSR.compileTemplate('serverAdminOrder', Assets.getText('adminOrder.html'));

Template.serverAdminOrder.helpers({

	userOrder: function(event_id) {
	  return Orders.find({event_id: event_id});
	},

	sumOrder: function(event_id){
	    var sum = 0; 
	    Orders.find({event_id: event_id})
	        .forEach(function (item) { 
	                sum += item.price*item.quantity;
	        }); 
	    return sum;
	},
	sumOrder: function(event_id){
	    var sum = 0; 
	    Orders.find({event_id: event_id})
	        .forEach(function (item) { 
	                sum += item.price*item.quantity;
	        }); 
	    return sum;
	},
	statusYes: function(status) {
		if (status == 1) return false;
		else return true;
	},
	getUserName: function(user_id) {
	    var data = Groups.findOne({"users.user_id": user_id}).users;
	    for (i = 0; i< data.length; i++) {
	        if (data[i].user_id == user_id) return data[i].user;
	    }
	},

	adminOrdersTotal: function(event_id){
	    return OrdersTotal.find({event_id: event_id});
	}
});	

Meteor.methods({ 
  sendUserEmail: function(options, event_id, user_id) {
        this.unblock();
        var html = SSR.render("serverUserOrder", {event_id: event_id, user_id: user_id});
        options.html = html;
        Email.send(options);
},
  sendEmail: function(options, event_id, user_id) {
        this.unblock();
        var html = SSR.render("serverAdminOrder", {event_id: event_id});
        console.log(html);
        options.html = html;
       
        Email.send(options);
    }
});    