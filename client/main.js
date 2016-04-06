Meteor.subscribe("emailUser");
Meteor.subscribe("groups");
Meteor.subscribe("pizzaEvents");
Meteor.subscribe("orders");
Meteor.subscribe("ordersTotal");

//////////////////////////////////
// USER OBJECT
//////////////////////////////////

//var currentUser = null; // holds the currentUser object when aplicable

function User(pid) {
 
    //var self   = this;
    //console.log(pid);
    var user = Meteor.users.findOne({_id : pid});
    this.id = pid;
    this.name = user.profile.name;
    //publishing of google service mail pretty long - trying quicker way
    var groupData = Groups.findOne({"users.user_id": pid});
    if (groupData === undefined) {
 		//nope - initial state - no ids, only service email
		this.email = user.services.google.email;
 	} else {
		var mail = "";
	    groupData.users.forEach(function(user, i) {
	     	if (user.user_id == pid) mail = user.email;
	     });
		this.email = mail;
	}	
	this.group_id = Groups.findOne({users: { $elemMatch: {email: this.email}}})._id;
	this.isGroupAdmin = (Groups.findOne({users: { $elemMatch: {email: this.email, isAdmin: true}}})) ? true : false;
	this.currentEvents = [];
	this.currentStatus = [];
}

//////////////////////////////////
// USER FUNCTIONS
//////////////////////////////////

User.prototype = {

	ifJoinedToEvent: function(event_id) {
		var found = false;
		var status = -1; //"You are not member of this event";
		var data = PizzaEvents.findOne({_id: event_id}, {fields: {membersIdx: 1, members: 1}});
		
		if (!data){status = -2;} 
		else {//no data
			var members = data.members;
			var memberIdx = data.membersIdx.indexOf(currentUser.id);
			if (memberIdx != -1 && members[memberIdx].user_id == currentUser.id) {
				var status = members[memberIdx].status;
			};
		}	
		//Storing all current events at the arrays, so it's easy to get
		currentUser.updateStatus(event_id,status);
		return status;
	},
	updateStatus: function(event_id, status) {
		//console.log("updateStatus");
		var exists = currentUser.currentEvents.indexOf(event_id);
		if (exists == -1) {
			//console.log("add new status");
			currentUser.currentEvents.push(event_id);
			currentUser.currentStatus.push(status);
		} else {
			currentUser.currentStatus[exists] = status;
		}
	}

};

//////////////////////////////////
// METEOR AUTORUN + SETTINGS 
//////////////////////////////////
Meteor.autorun(function() {
    if (Meteor.user()) {
    	try {
	    	var groupData = Groups.findOne({users: { $elemMatch: {user_id: Meteor.userId()}}});
	    	if (groupData === undefined) {
	    		//initial state when no user_ids yet
	    		var email = Meteor.user().services.google.email;
			    var group_id = Groups.findOne({users: { $elemMatch: {email: email}}})._id;
			    //console.log(group_id);
			    Session.set('group_id', group_id);
			  // console.log(Session.get('group_id')); 	
	    	} else {
	    		//console.log("we here");
	    	//this information we need from the very beginning
	    		Session.set('group_id', groupData._id);
	    	}
	   		currentUser = new User(Meteor.userId());
	    }	
	    catch (err) { //not yet);	
	    }
   	};
   	sAlert.config({
	    effect: '',
	    position: 'bottom-left',
	    timeout: 4000,
	    html: false,
	    onRouteClose: true,
	    stack: true,
	    offset: 200, // in px - will be added to first alert (bottom or top - depends of the position in config)
	    beep: false,
	    onClose: _.noop 
	});
});

//////////////////////////////////
// IRON ROUTER
//////////////////////////////////
Router.configure({
	layoutTemplate: 'ApplicationLayout'
});

Router.route('/', function () {
	this.render('website_nav',{
		to: "nav"
	});
	this.render('website_jumbo',{
		to: "jumbo"
	});
	this.render('website_main',{
		to: "main"
	});
	this.render('website_footer',{
		to: "footer"
	});
});

//////////////////////////////////
// SMALL HELPERS & TEMPLATES
//////////////////////////////////
//put here for not scattering over all files
Template.registerHelper('thisUser', function() {
	if (Meteor.user()) {
        return currentUser;
    } else {
        return false;
    }
});
Template.registerHelper('getUserName', function(user_id) {
    var data = Groups.findOne({"users.user_id": user_id});
    if (data) {
        for (i = 0; i< data.users.length; i++) {
            if (data.users[i].user_id == user_id) {
            	return data.users[i].user;
            }
     	}
    } 	
    return "";
});
Template.registerHelper('getUserMail', function(user_id) {
    var data = Groups.findOne({"users.user_id": user_id});
    if (data) {
        for (i = 0; i< data.users.length; i++) {
            if (data.users[i].user_id == user_id) {
            	return data.users[i].email;
            }
     	}
    } 	
    return "";
});
Template.menu.helpers({
    menuItemsGroup:function(){
	//return groups = Groups.find({_id: currentUser.group_id});
	var data = Groups.findOne({_id: Session.get('group_id')});
	return data.menuItems;
    },
	
});
Template.coupons.helpers({
    couponGroup: function(){
	return Groups.findOne({_id: Session.get('group_id')}).coupons;
    },
    ifCoupon: function(){
    var lengt = Groups.findOne({_id: Session.get('group_id')}).coupons.length;
	if (lengt && lengt > 0) return true;
	else false; 
    }
});






