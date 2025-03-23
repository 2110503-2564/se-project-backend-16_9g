const Reservation = require('../models/Reservation');
const Restaurant = require('../models/Restaurant');


exports.getRestaurants= async(req,res,next)=>{
    let query;

    const reqQuery={...req.query}; 

    const removeFields=['select','sort','page','limit'];

    removeFields.forEach(param=>delete reqQuery[param]);
    console.log(reqQuery);

    let queryStr=JSON.stringify(reqQuery);
    
    queryStr=queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match=>`$${match}`); 

    query = Restaurant.find(JSON.parse(queryStr)).populate('reservations');

    if(req.query.select) {
        const fields=req.query.select.split(',').join(' ');
        query=query.select(fields);
    }

    if(req.query.sort){
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    const page = parseInt(req.query.page,10)||1;
    const limit = parseInt(req.query.limit,10)||25;
    const startIndex= (page-1)*limit;
    const endIndex= page*limit;
    
    try{
        const total=await Restaurant.countDocuments();
    
        query = query.skip(startIndex).limit(limit);
        
        const restaurants = await query;

        const pagination ={}; // {}=json

        if(endIndex<total) {
            pagination.next={
                page:page+1, limit
            }
        }

        if(startIndex>0){
            pagination.prev={
                page:page-1, limit
            }
        }

        res.status(200).json({success:true, count:restaurants.length,pagination, data:restaurants});
    } catch(err){
        res.status(400).json({success:false});
    }

};

exports.getRestaurant= async(req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id);

        if(!restaurant){
            return res.status(400).json({success:false});
        }
        res.status(200).json({success:true, data:restaurant});
    } catch(err){
        res.status(400).json({success:false});
    }
    
};

exports.createRestaurant= async(req,res,next)=>{
    const restaurant = await Restaurant.create(req.body);
    res.status(201).json({success:true, data:restaurant});
};

exports.updateRestaurant=async(req,res,next)=>{
    try{
        const restaurant = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        if(!restaurant) {
            return res.status(400).json({success:false,msg:'is not restaurant'});
        }

        res.status(200).json({success:true, data: restaurant});
    } catch (err) {
        res.status(400).json({success: false});
    }
};

exports.deleteRestaurants= async(req,res,next)=>{
    try{
        const restaurant = await Restaurant.findById(req.params.id); 

        if(!restaurant) {
            return res.status(404).json({
                success:false, 
                message:`Restaurant not found with id of ${req.params.id}`});
        }

        await Reservation.deleteMany({restaurant: req.params.id});
        await Restaurant.deleteOne({_id: req.params.id});

        res.status(200).json({success:true, data: {}});
        
    } catch (err) {
        res.status(400).json({success: false});
    }
};

exports.reviewRestaurant = async(req,res,next) => {
    try {
        const {user, rating, comment} = req.body;
        const restaurant = await Restaurant.findById(req.params.id);

        if(!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        const newReview = {user, rating, comment};
        restaurant.reviews.push(newReview);
        await restaurant.save();

        res.status(201).json({success: true, data:restaurant});

    } catch(err) {
        console.log(err.stack)
        res.status(500).json({success: false, message: "Can't make a review"})
    }
}

exports.getALlReviewsFromRestaurant = async(req,res,next) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id)
        if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

        res.status(200).json({success: true, count: restaurant.length, data: restaurant.reviews})
    } catch(err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: "Can't get all reviews"})
    }
}

exports.deleteReviews = async(req,res,next) => {
    try {
        const { id, reviewId } = req.params;
        const restaurant = await Restaurant.findById(id);

        if(!restaurant) {
            return res.status(404).json({ message: "Restaurant not found" });
        }

        restaurant.reviews = restaurant.reviews.filter(
            (review) => review._id.toString() !== reviewId
        );

        await restaurant.save();
        res.status(200).json({ success: true, message: "Deleted review successfully" });

    } catch(err) {
        console.log(err.stack);
        res.status(500).json({success: false, message: "Can't delete a review"})
    }
}

