// this collection stores all the documents 
this.Groups = new Mongo.Collection("groups");
// this collection stores sets of users that are editing documents
this.PizzaEvents = new Mongo.Collection("pizzaEvents");
this.Orders = new Mongo.Collection("orders");
this.OrdersTotal = new Mongo.Collection("ordersTotal");
// set up a schema controlling the allowable 
// structure of comment objects
/*Groups.attachSchema(new SimpleSchema({
  title: {
    type: String,
    label: "title",
    max: 200
  },
  shortTitle:{
    type: String,
    label: "shortTitle",
    max: 40  	
  },
  img:{
  	type: String 
  }, 
  users:{
  	type: Array 
  }, 
  
}));*/
