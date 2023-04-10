const express=require("express");
const {connection}=require("./config/connection")
const app=express();
const {RoomModel}=require("./models/hotelroom.model")

app.use(express.json());

app.get("/",(req,res)=>{
    res.send("home page");
})

/*
{
    "_id": "6433d2ebf8ac6f5f514fabdb",
    "guest_name": "Avinash",
    "room_type": "Standard",
    "room_number": 1,
    "room_cost": 1200,
    "__v": 0,
    "checkin_date": "2023-04-10T09:33:02.532Z"
  },
*/


app.post("/book",async(req,res)=>{
    
    try{
        let data=req.body;
        console.log(data);
        let total=await RoomModel.aggregate([{$group:{_id:"$room_type",room_count:{$sum:1}}},{$sort:{_id:1}}]);
        console.log(total);
        if(data.room_type==='Standard'&&total[2].room_count<3){
            data.room_cost=1200;
        }else if(data.room_type==='Premium'&&total[1].room_count<2){
            data.room_cost=2300;
        }else if(data.room_type==='Deluxe'&&total[0].room_count<1){
            data.room_cost=4650;
        }else{
            res.send({"mess":"sorry, no room left..."});
            return;
        }
        let room=new RoomModel(data);
        await room.save();
        res.send("room booked");
    }catch(err){
        console.log(err.message);
    }
})

app.get("/bookings",async(req,res)=>{
    try{
        // console.log(total);
        let data=await RoomModel.find();
        res.send(data);
    }catch(err){
        console.log(err.message);
    }
})

app.get("/bookings/:id",async(req,res)=>{
    try{
        let id=req.params.id;
        let data=await RoomModel.findById(id);
        if(data){
            res.send(data);
        }else{
            res.send("wrong id, please enter correct id");
        }
    }catch(err){
        console.log(err.message);
    }
})

app.put("/bookings/:id",async(req,res)=>{
    try{
        let id=req.params.id;
        let body=req.body;
        let data=await RoomModel.findByIdAndUpdate(id,body);
        if(data){
            res.send({"mess":"data updated"});
        }else{
            res.send("wrong id, please enter correct id");
        }
    }catch(err){
        console.log(err.message);
    }
})

app.delete("/bookings/:id",async(req,res)=>{
    try{
        let id=req.params.id;
        let data=await RoomModel.findByIdAndDelete(id);
        if(data){
            res.send({"mess":"room id deleted"});
        }else{
            res.send("wrong id, please enter correct id");
        }
    }catch(err){
        console.log(err.message);
    }
})

app.get("/checkout/:id",async(req,res)=>{
    try{
        let id=req.params.id;
        let data=await RoomModel.findById(id);
        data.room_type='zzz';
        data.checkout_date=Date.now();
        await RoomModel.findByIdAndUpdate(id,data);
        res.send("checkout successfully");
    }catch(err){
        console.log(err.message);
    }
})

app.get("/top_2_star_users",async(req,res)=>{
    try{
        // we are taking name as users unique id, because we don't have anything else which can match use various days
        let data=await RoomModel.aggregate([{$group:{_id:"$guest_name",bookings:{$sum:1}}},{$sort:{bookings:-1}},{$limit:2}]);
        res.send(data);
    }catch(err){
        console.log(err.message);
    }
})

app.get("/bookings1",async(req,res)=>{
    // let data=req.params.id;
    let checkin_date='2023-04-10T09:14:47.010Z';
    let checkout_date='2023-04-10T10:01:08.949Z';
    let data=await RoomModel.aggregate([{$match:{checkin_date:{$lte:(checkin_date),$gte:(checkout_date)}}}]);
    console.log(data);
    res.send(data);
})

app.get("/earnings2",async(req,res)=>{
    try{
        let checkin_date='2023-04-10T09:14:47.010Z';
    let checkout_date='2023-04-10T10:01:08.949Z';
    let data=await RoomModel.aggregate([{$match:{checkin_date:{$gte:ISODate(checkin_date),$lte:ISODate(checkout_date)}}},{$group:{_id:"total_earning",total:{$sum:"$room_cost"}}}]);
    console.log(data);
    }catch(err){
        console.log(err.message);
    }
})

app.listen(4300,async()=>{
    try{
        await connection;
        console.log("connected at 4300");
    }catch(err){
        console.log({"error":err.message});
    }
})

/*
[
  {
    "_id": "6433d2ebf8ac6f5f514fabdb",
    "guest_name": "Avinash",
    "room_type": "zzz",
    "room_number": 1,
    "room_cost": 1200,
    "__v": 0,
    "checkin_date": "2023-04-10T10:26:29.738Z",
    "checkout_date": "2023-04-10T10:29:23.644Z"
  },
  {
    "_id": "6433d3879456b1b31d3ce7ca",
    "guest_name": "Mohan",
    "room_type": "Premium",
    "room_number": 4,
    "room_cost": 2300,
    "checkin_date": "2023-04-10T09:14:47.010Z",
    "__v": 0
  },
  {
    "_id": "6433dad643089ad8d71d1424",
    "guest_name": "Dev",
    "room_type": "Deluxe",
    "room_number": 6,
    "room_cost": 4650,
    "checkin_date": "2023-04-10T09:45:58.474Z",
    "__v": 0
  },
  {
    "_id": "6433de64bca18d606c4a0073",
    "guest_name": "Dev",
    "room_type": "Premium",
    "room_number": 3,
    "room_cost": 2300,
    "checkin_date": "2023-04-10T10:01:08.949Z",
    "__v": 0
  },
  {
    "_id": "6433de97bca18d606c4a0077",
    "guest_name": "Mohan",
    "room_type": "Standard",
    "room_number": 2,
    "room_cost": 1200,
    "checkin_date": "2023-04-10T10:01:59.494Z",
    "__v": 0
  },
  {
    "_id": "6433e3b1cf75375eb482000a",
    "guest_name": "Avinash",
    "checkin_date": "2023-04-10T10:22:25.963Z",
    "room_type": "Standard",
    "room_number": 2,
    "room_cost": 1200,
    "__v": 0
  },
  {
    "_id": "6433e51cf4d7bf6202e51258",
    "guest_name": "Avinash",
    "checkin_date": "2023-04-10T10:26:29.738Z",
    "room_type": "Standard",
    "room_number": 2,
    "room_cost": 1200,
    "__v": 0
  }
]
*/