Meteor.methods({

  addOrdersTotal: function(value){
   if (!this.userId){
      console.log("Credentiales are insufficient");
      return;
    }
    else {
      var id = OrdersTotal.insert(value);
     // console.log("OrdersTotal create method: got an id " + id);
      return id; 
    }    
  },

  updateUserSum: function(event_id, user_id){
    if (!this.userId){
      console.log("Credentiales are insufficient");
      return;
    }
    else {
      var sum = 0;
      Orders.find({event_id: event_id, user_id: user_id}).map(function(pizza) {  sum += pizza.price * pizza.quantity;})
      console.log("total sum" + sum);
      if (sum > 0) {
        var event = PizzaEvents.findOne({_id: event_id});
        var usersIdx = event.membersIdx;
        var users = event.members;
        var idx = usersIdx.indexOf(user_id);
        if (idx != -1) {
            users[idx].sum = sum;
            PizzaEvents.update( {_id: event_id} ,
              { 
              $set : { 
              "members" : users
                } }, false, true );  
        }
      }
    }  
  },
  couponApplying: function(idx, group_id,){ 
    if (!this.userId){
      console.log("Credentiales are insufficient");
      return;
    }
    else {
      data = Groups.findOne({_id: group_id});
      if (data) {
        var coupons = data.coupons;
        var quantity = coupons[idx].quantity;
        if (coupons[idx].quantity > 0) {
          coupons[idx].quantity -= 1;
          Groups.update( {_id : group_id} ,
          { 
          $set : { 
          "coupons" : coupons
            } }, false, true );  
        }
      }  
    }
  }, 
  removeCoupon: function(idx, group_id,){ 
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      var data = Groups.findOne( {"_id" : group_id});
      if (data) {
        var coupons = data.coupons;
        console.log(coupons);
        coupons.splice(idx, 1);
        var id = Groups.update( {"_id" : group_id} ,
          { $set : { "coupons" : coupons} }, false, true ); 
      }   
    }
  },  
  
  createFreeCoupons: function(values, group_id){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      Groups.update({
          _id: group_id}, {
           $push : {
            coupons: values
          }}, false, true );
      console.log("Coupon created!");
    }
  },

  modifyDish: function(value, group_id, idx){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      data = Groups.findOne({_id: group_id});
      if (data) {
        var items = data.menuItems;
        items[idx].title = value.title;
        items[idx].price = Number(value.price);
        Groups.update( {_id : group_id} ,
          { 
          $set : { 
          "menuItems" : items
            } }, false, true );  
       }
    }
  },
  
  addNewDish: function(values, group_id){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      Groups.update({
          _id: group_id}, {
           $push : {
            menuItems: values
          }}, false, true );
      console.log("Groups items updated");
    }
  },
 // method to add a new document
  createPizzaEvent: function(values){
    if (!values.holder_id || !this.userId){
		console.log("Credentiales are insufficient");
		return;
    }
    else {
		  var id = PizzaEvents.insert(values);
      //console.log("PizzaEvent create method: got an id " + id);
      return id;
    }
  },
  createOrderItem: function(values){
   if (!values.user_id || !this.userId){
      console.log("Credentiales are insufficient");
      return;
    }
    else {
      //var id = PizzaEvents.insert(values);
      var id = Orders.insert( values);
      return id;
    }
  },
  memberStatusUpdate: function(values){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
     //PizzaEvents.update({'_id': 'SB4SNiSaGBMcSN3Sb'}, {'$set': {'groups.1.members.0.status': 1}})
    	PizzaEvents.update( { 
    		"_id" : values.event_id, 
    		"members.user_id" : values.user_id
    		}, { 
    		$set : { 
    			"members.$.status" : values.status 
    		} }, false, true );
    }
	},
  changeEventGlobalStatus: function(event_id, status){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      PizzaEvents.update( { 
        "_id" : event_id, 
       }, { 
        $set : { 
          status : status 
        } }, false, true );
    }
  },
  addGroupUser: function(values, group_id){
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      //console.log("addGroupUser");
       var data = Groups.findOne( {_id : group_id});
      if (data) {
        var users = data.users;
        var found = false;
        for (i = 0; i < users.length; i++){
          if (users[i].email == values.email) {
            //found this user, just o update
            users[i].user_id = values.user_id,
            users[i].email = values.email,
            users[i].user = values.user,
            found = true;
          }
        }
        if (!found) {
          users.push(values);
        }
        var id = Groups.update( {"_id" : group_id} ,
          { 
          $set : { 
          "users" : users
            } }, false, true );
      }
     } 
   },
  removeGroupUser: function(user_id){ 
    if (!this.userId){
    console.log("Credentiales are insufficient");
    return;
    }
    else {
      var data = Groups.findOne( {"users.user_id" : user_id});
      if (data) {
        var group_id = data._id;
        var users = data.users;
        for (i = 0; i < users.length; i++){
          if (users[i].user_id == user_id) {
              var idx = i;
              break;
          }
        };
        users.splice(idx,1);
        //console.log(users);
        var id = Groups.update( {"_id" : group_id} ,
          { 
          $set : { 
          "users" : users
            } }, false, true );  
      }   
    }
  },  
  userName: function(user_id) {
      var data = Groups.findOne({"users.user_id": user_id});

      for (i = 0; i< data.users.length; i++) {
          if (data.users[i].user_id == user_id) return data.users[i].user;
      }
      return "";
  },
  userMail: function(user_id) {
        var data = Groups.findOne({"users.user_id": user_id});
     
        for (i = 0; i< data.users.length; i++) {
            if (data.users[i].user_id == user_id) return data.users[i].email;
        }
        return "";
}
  })
