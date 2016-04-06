//////////////////////////////////
// GROUPS HELPERS & EVENTS
//////////////////////////////////
Template.groups.helpers({

    groups: function(){
		return groups = Groups.find();
    },
	ifCurrentGroup: function(group_id){
		//console.log("ifCurrentGroup");
		if (Session.get('group_id') == group_id) return true;
			else return false;
    },
    ifUserAdmin: function(group_id){
		//console.log("ifUserAdmin");
		return (currentUser.isGroupAdmin && currentUser.group_id == group_id) ? true : false;
	},	
	ifCanBeDeleted: function(group_id, user_id){
		//console.log("ifCanBeDeleted");
		if (currentUser) {
			return (currentUser.isGroupAdmin && currentUser.group_id == group_id && user_id != currentUser.id) ? true : false;
			var data = Groups.findOne({ _id: group_id, users: { $elemMatch: {user_id: currentUser.id, isAdmin: true}}});
		}	
	},

});

Template.groups.events({
    "dblclick .jsChangeMenuItem": function(event){
    	var tdElement = $(event.target);
		var tdDish = tdElement.html();
		var trElement = tdElement.parent();
		var tdPrice = trElement.children(".price").html();
		trElement.html("<td colspan=2><form class='form-inline jsEditMenuItem' name='modifyDish'><div class='form-group'><label class='sr-only' for='dish'>Dish</label><input type='text' id='dish' name='dish' class='form-control' value='" + tdDish + "' required></div><div class='form-group'><div class='input-group'><span class='input-group-addon'>$</span><input type='number' name='price' min='0' step='0.1' data-number-to-fixed='2' data-number-stepfactor='100' class='form-control currency' value="+tdPrice+" required /></div></div><button type='submit' class='btn btn-warning jsModifyDish' value='@index'>Change it!</button></form></td>"); 
    },
    "click .jsCreateUser": function(event){
    	event.preventDefault();
		var group_id = event.target.value;
		console.log($(event.target).parent("form"));
		
		console.log($(event.target).closest("tr").attr('value'));
		var formData = $(event.target).parent("form").serializeArray();
		//var message = "";
		if (formData) {
			var email = formData[0].value;
			var data = Meteor.users.findOne({"services.google.email": email});
			var groupData = Groups.findOne( { _id: { $ne: group_id }, "users.email": email});
      		if (!data) { 
      			sAlert.warning('No such email at the user table!', {timeout: 5000});
        		}
      		else if (groupData) {
       			sAlert.warning('User already exists in other group!',  {timeout: 5000});
      		}
      		else {  var user_id = data._id;
      				
      				values = {
      					user_id: user_id,
						email: email,
						user: data.profile.name,
						isAdmin: false
						};
					//console.log(values);	
      				Meteor.call("addGroupUser", values,  group_id);
      				$("input[name='email']").val("");
      				sAlert.success('User upserted successfully into group!');
    		}	
	    }  	
    },
    "click .jsRemoveUser": function(event){
    	//event.preventDefault();
		var user_id = event.target.value;
		Meteor.call("removeGroupUser", user_id );
		sAlert.success('User removed successfully from group!');
	},
		
	"click .jsAddNewDish": function(event){
    	event.preventDefault();
		var group_id = event.target.value;
		var formData = $(event.target).parent("form").serializeArray();
		if (formData) {
			var dish = formData[0].value;
			if (dish == "") {sAlert.warning('Please insert title of the dish!');
							return;}
			var groupData = Groups.findOne( { _id: group_id , "menuItems.title": dish});
			if (groupData) {sAlert.warning('Such item already presents at this group menu!');
				return;};
			var value = {
				 title: dish,
				 price: Number(formData[1].value)
				};
			Meteor.call("addNewDish", value, group_id, function(err,res){
				if (!err){//all good
					sAlert.success('Dish successfully added!');
					$("input[name='dish']").val("");
					$("input[name='price']").val("");
				}
			});	
		}
	},	

	"click .jsModifyDish": function(event){
    	event.preventDefault();
		var group_id = Session.get('group_id');
		var trMod = $(".jsEditMenuItem").closest("tr");
		var idx = trMod.attr('value');
		var formData = $(event.target).parent("form").serializeArray();
		//var message = "";
		if (formData) {
			var dish = formData[0].value;
			if (dish == "") {sAlert.warning('Please insert title of the dish!');
							return;}
			var value = {
				 title: dish,
				 price: formData[1].value
				};
			Meteor.call("modifyDish", value, group_id, idx, function(err,res){
				if (!err){//all good
					sAlert.success('Dish successfully updated!');
				} else sAlert.error('Something get wrong!');
			});	
			trMod.html("<td class='dish jsChangeMenuItem'>"+formData[0].value+"</td><td class='price'>"+formData[1].value+"</td>");
		}
	},
	//Lazy munu.html template for different purposes
	"click .jsAddItemToList": function(event){
     	event.preventDefault();
     	var group_id = event.target.value;
		var fields = $(event.target).parent("form").serializeArray();
     	var index = fields[0].value;
     	var quantity = fields[1].value;
     	var data = Groups.findOne({_id: group_id}, { fields: {menuItems : 1, _id: 0}});
     	if (data) {  //got_date
     		value = data.menuItems[index];
     		if (value && value.title != "") { 
		     	var values = {
		     		title: value.title,
					price: Number(value.price),
					quantity: parseInt(quantity)
				};
				//console.log(values);
				Meteor.call("createFreeCoupons",values, group_id, function(err,res){
					if (!err){//all good
						sAlert.success('Coupon added!');
					} 
				});
			}
     	}
    },
    "click .jsRemoveCoupon": function(event){
    	//event.preventDefault();
		var idx = event.target.value;
		var group_id = Session.get('group_id');
		Meteor.call("removeCoupon", idx, group_id, function(err,res){
			if (!err){//all good
				sAlert.success('Coupon removed!');
			} 
		});	
	},

});
