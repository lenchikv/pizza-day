//////////////////////////////////
// PIZZA EVENT HELPERS & TEMPLATES
//////////////////////////////////
Template.pizzaEvents.helpers({
    pizzaEvents:function(){
		return pizzaEvents = PizzaEvents.find({}, {sort: {started: -1}});
    },
	statusText: function(status){
		if (status == 0) return "Ordering";
		if (status == 1) return "Ordered";
		if (status == 2) return "Delivering";
		if (status == 3) return "Delivered";
    },
    startedDate: function(started){
		return moment(started).format("DD.MM.YYYY");
    },
	isOwner: function(event_id){
		var holder_id = PizzaEvents.findOne({_id: event_id}, {fields: {holder_id:1}}).holder_id;
		if (holder_id && holder_id == currentUser.id) return true;
		else false;
	},	
	setCurrentStatus: function(event_id){
		var status = currentUser.ifJoinedToEvent(event_id);
	},
	isCheckJoined: function(event_id){
		//console.log("Trying...");
		var status = helperGetStatus(String(event_id));
		//console.log(status);
		var output;
		switch(String(status)) {
		case "-1":  
			output = "You are not member of this event";
			break;
		case "-2":  
			output = "No data";
			break;
		case "0":  
			output = "<button type='button' class='btn btn-default jsParticipateYes' value=" + event_id + ">Yes</button><button type='button' class='btn btn-default jsParticipateNo' value=" + event_id + ">No</button>";
			break;
		case "1":  
			output = "No";
			break;
		case "2":  
			output = "Yes";
			break;
		case "3":  
			output = "Yes";
			break;		
		  default:
			output = "nothing get"
			break;
		}
		return output;
	},
	isStatusYes: function(event_id){
		//console.log("isStatusYes");
		if (helperGetStatus(event_id) == 2) return true;
		else  return false;
	},
	isStatusOrder: function(event_id){
		//console.log("isStatusOrder");
		if (helperGetStatus(event_id) >= 2) return true;
			else  return false;
	},
	windowOpen: function(status){
		//console.log("isStatusOrder");
		if (status <= 2) return true;
			else  return false;
	},
	isOrdered: function(status){
		//console.log("isStatusOrder");
		if (status > 0) return true;
			else  return false;
	}
});

Template.pizzaEvents.events({
    "click .closeX": function(event){
		var box = $(event.target).closest(".window");
		box.fadeOut('slow')
     },
    "click .minimizeX": function(event){
		var minimizer = $(event.target);
		var box = minimizer.closest(".window");  
		var panelBody = box.children(".panel-body");
		if (panelBody.is(":visible")) {
			panelBody.slideUp("slow")
			minimizer.addClass("fa-chevron-down").removeClass("fa-chevron-up");
		} else {
			panelBody.slideDown("slow");
			minimizer.addClass("fa-chevron-up").removeClass("fa-chevron-down");
		}
     },
	"click .jsParticipateYes": function(event){
		//console.log("Click yes"); 
		//console.log( event.target.value);
		var values = {
			event_id: event.target.value,
			user_id: currentUser.id,
			status: 2
		};
		Meteor.call("memberStatusUpdate",values, function(err,res){
			if (!err){//all good
				sAlert.success('Great! Choose whatever you want!');
				currentUser.updateStatus(event.target.value,2);
			} 
		});
	},
	"click .jsParticipateNo": function(event){
		//console.log("Click no"); 
		var values = {
			event_id: event.target.value,
			user_id: currentUser.id,
			status: 1
		};
		Meteor.call("memberStatusUpdate",values );
		currentUser.updateStatus(event.target.value,1);	
		//may be everybody finished? Checking..
		helperUpdateGlobalStatus(event.target.value);	
	},
	"click .jsAddItemToList": function(event){
     	event.preventDefault();
     	var event_id = event.target.value;
		var fields = $(event.target).parent("form").serializeArray();

     	var index = fields[0].value;
     	var quantity = fields[1].value;
     	var data = Groups.findOne({_id: currentUser.group_id}, { fields: {menuItems : 1, _id: 0}});
     	if (data) {  //got_date
     		value = data.menuItems[index];
     		//assume one coupon for one item
     		var dataCoupon = Groups.findOne({_id : currentUser.group_id, coupons: { $elemMatch : { title: value.title, quantity : { $gt :  0 }}}})
     		if (dataCoupon) {
     			var dataOther;
     			dataOther = Orders.findOne({event_id: event_id, group_id : currentUser.group_id, user_id: currentUser.id, item: value.title});
     			if (!dataOther) {
	     			if (quantity > 1) {
	     				//at one time with coupon no more than 1
	     				sAlert.error('For discount applying please choose no more than 1 item!');
	     				return;
	     			} else {
	     				helperApplyCoupon(dataCoupon.coupons, currentUser.group_id, value.title);
		     			value.price = 0;
	     			}
     			}   
     		}
     		holder_id = PizzaEvents.findOne({_id: event_id}).holder_id;
	   		if (value && value.title != "") { 
			     	var values = {
		     		event_id: event_id,
		     		holder_id: holder_id,
					user_id: currentUser.id,
					group_id: currentUser.group_id,
					item: value.title,
					price: value.price,
					quantity: parseInt(quantity)
				};
				//console.log(values);
				Meteor.call("createOrderItem",values, function(err,res){
					if (!err){//all good
						//sAlert.success('Item successfully added!');
					} 
				});
			}
     	}
    }, 	
    
    "click .jsChangeEventStatus": function(event){
		event.preventDefault();
		var event_id = event.target.value;
		//console.log(event_id);
		//return "";
		var formData = $(event.target).parent("form").serializeArray();
		if (formData) {
			var status = formData[0].value;
			Meteor.call('changeEventGlobalStatus',event_id, status, function(err,res){
			if (!err)
				sAlert.success("Status changed successfully!");
			   });
		}	
	},	

	"click .jsCheckOutUser": function(event){
		var event_id = event.target.value;
		var values = {
			event_id: event.target.value,
			user_id: currentUser.id,
			status: 3
		};
		
		Meteor.call("updateUserSum", event_id, currentUser.id);
		Meteor.call("memberStatusUpdate",values);
		helperUpdateGlobalStatus(event_id);
		currentUser.updateStatus(event.target.value,3);
},	
	
	"click .jsCheckOut": function(event){
		var event_id = event.target.value;
		console.log("________________________CALLING jsCheckOut");
		console.log(event_id);
		
		Session.set('mail_sending', true);
		data = PizzaEvents.findOne({_id: event_id});
		 data.membersIdx.forEach(function(user_id, i) {
		 	console.log(user_id);
		 	var status = data.members[i].status;
		 	//who not joined - not mailing
		 	if (status != 1) {
				var email = Meteor.apply('userMail', [user_id], { returnStubValue: true });
				console.log(email);
				var parameters = {
					to: email,
					from: 'labby.director@gmail.com', 
					subject: 'Your new pizza order!', 
					html: '<strong>This is a test of Email.send.</strong>'	
				};
				Meteor.call('sendUserEmail',  parameters, event_id, user_id,function(err,res){
				if (err){  Session.set('mail_sending', false)  }
					});
			}	
		});
		//for not alerting on every email just catch all
		console.log(Session.get('mail_sending'));
		if (Session.get('mail_sending')) {
				sAlert.success("Email to members sended successfully!");
			} else {
				sAlert.warning("Email to members sended unsuccessfully!");
			}
		var email = currentUser.email;
		Session.get(email);
		var parameters = {
			to: currentUser.email,
			from: 'labby.director@gmail.com', 
			subject: 'Your new pizza order!', 
			html: '<strong>This is a test of Email.send.</strong>'	
		}
		Meteor.call('sendEmail', parameters, event_id, function(err,res){
			if (!err){
				sAlert.success("Email to admin sended successfully!");	
			}  });
			
	}
});

//////////////////////////////////
// PIZZA EVENT CREATION HELPERS & EVENTS
//////////////////////////////////
Template.createPizzaEvent.helpers({
    groups:function(){
		return groups = Groups.find();
    },
	date:function() {
		return moment(new Date()).format("DD.MM.YYYY");
	},
	setPristineCreation: function() {
		$(".jsGroups").prop("checked", false);
		$(".jsFormCreateEvent").slideUp();
	},	
});

Template.createPizzaEvent.events({
	"click .jsCreateEvent": function(event){ 
		event.preventDefault();
		$(".jsFormCreateEvent").slideToggle();
	},
	"click .jsCancelCreate": function(event){ 
		//set prictine
		Template.createPizzaEvent.__helpers.get('setPristineCreation').call();
	},
	"submit .jsFormCreateEvent": function(event){ 
		event.preventDefault();
		var checker = 0;
		$('.jsGroups').each(function( index ) {
			if ($( this ).is(":checked")) checker ++;
		});
		if (checker == 0) {sAlert.warning('Select at least one group!');}
		else {
			var members = [], membersIdx = []; 
			var fields = $("input[name='groupsIn']").serializeArray();
			$.each( fields, function( i, field ) {
				var userList = Groups.findOne({_id: field.value},{fields: {"users.user_id": 1, _id : 0}});
				if (typeof userList.users != undefined) {
					for (i=0; i< userList.users.length; i++) {
						var obj = 	{group_id: field.value,
									user_id: userList.users[i].user_id,
									status : 0,
									sum: 0,
									};
						membersIdx.push(userList.users[i].user_id);			
						members.push(obj);	
					}
				}
			});
			
			var values = {
				holder_id:  currentUser.id,
				holder_name:  currentUser.name,
				started: new Date(),
				status: 0,
				membersIdx: membersIdx,
				members: members,
			};
			
			var rid =  Meteor.call("createPizzaEvent", values, function(err,res){
				if (!err){//all good
					console.log("event callback received "+res);
				}
			});	
			Template.createPizzaEvent.__helpers.get('setPristineCreation').call();
			sAlert.success('Pizza event created successfully! Join!');
		}
	}
});

// handy function 
function helperGetStatus(event_id){
	var statusIdx = currentUser.currentEvents.indexOf(event_id);
	if (statusIdx != - 1) {
		return currentUser.currentStatus[statusIdx];
	}
	return -1;	
}

function helperUpdateGlobalStatus(event_id){
	var currentStatus = PizzaEvents.findOne({_id: event_id}, {fields: {status: 1, _id: 0}});
	console.log(currentStatus.status);
	if (currentStatus || currentStatus.status == 0) {
		//onle for new
		//find new and still ordering statuses
		var data = PizzaEvents.findOne({_id: event_id, members: { $elemMatch: {status :{"$in":[0,2]}}}});
		//if it is null -> everyboby finished -> changenge clobal status to netx
		if (data === undefined) {
			Meteor.call("changeEventGlobalStatus", event_id, 1);
			putToOrdersTotal(event_id);
			sAlert.success("Pizza event finished!");
		}
			
	}	
};

function putToOrdersTotal(event_id){
	var details = [], totalSum = 0;
	console.log( "putToOrdersTotal");
	console.log( event_id);
	var data = PizzaEvents.findOne({_id: event_id});
	console.log( data);
    if (data) { 
     	console.log( "got here");
    	var idx = data.membersIdx;
    	var members = data.members;
    	for (i=0; i < members.length; i++) {
    		totalSum += members[i].sum;
    		var byUser = {
    			user_id: idx[i],
    			status: members[i].status,
    			sum: members[i].sum
    		};
    		console.log(byUser);
    		details.push(byUser);
    	}
    	var value = {
			event_id: event_id,
			holder_id: data.holder_id,
			totalSum: totalSum,
			details: details
    		};
    		console.log(value);

    	Meteor.call("addOrdersTotal", value,function(err,res){
			if (err){
				sAlert.error("Can't create total order!");
			}  
		});
    }	
}  

//helperApplyCoupon(coupon.coupons);
function helperApplyCoupon(dataCoupon, group_id, title){
	var idx = -1;
	dataCoupon.forEach(function(coupon, i) {
		if (coupon.title == title)  {
				idx = i;
				//console.log("got: "+idx);
			}
		});
	if (idx >= 0) {
		Meteor.call("couponApplying", idx, group_id, function(err,res){
			if (err){ sAlert.error("Can't apply coupon!");}  
			else {sAlert.success("Discount 100% successfully applied!");}
		});
	} 
}			