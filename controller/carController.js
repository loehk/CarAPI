import Cars from "../models/car.js"

export async function getCarById(req, res, next) {
    try {
        const car = await Cars.findById(req.body._id)
        if (car == null) {
            return res.status(404).json({message: 'Cannot find car'})
        } else{
            res.car = car
            console.log(car)
            next()
        }
    } catch (err) {
        return res.status(500).json({ message: err.message})
    }
    next()

}

export async function deleteManyByYear(req, res, next){
    
    const deletedYear = req.body.year

    Cars.find({ year: { $eq: deletedYear} }).then((matchingCars)=>{
        matchingCars.forEach(car=>{
            car.remove()
        })
        return res.status(200).json({message: `Cars of year: ${deletedYear} deleted`})
    }).catch(function(error){
        console.log(error); // Failure
        return res.status(500).json({ message: err.message})
    });

} 
