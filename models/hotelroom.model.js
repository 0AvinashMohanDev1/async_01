const mongoose=require("mongoose");
const express=require("express");


const roomSchema=mongoose.Schema({
    guest_name:String,
    checkin_date:{type:Date,default:Date.now()},
    checkout_date:Date,
    room_type:String,
    room_number:Number,
    room_cost:Number
})

const RoomModel=mongoose.model("hotelRoom",roomSchema);


module.exports={
    RoomModel
}
