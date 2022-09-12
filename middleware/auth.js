import jwt from 'jsonwebtoken'
import car from '../models/car.js'

const config = process.env;

export const verifyToken = (req, res, next) => {

    const onDecode = async (error, decoded) => {
        if (error){
            return res.status(401).send("Invalid Token");
        }
        const sessionCar = await car.findById(decoded._id)
        if (sessionCar) {
            req.user = sessionCar;
            if (req.user.heatedCarSeatMembership || req.user._id.toString() === req.param._id || req.body._id == req.user._id.toString()) {
                next();
            }else{
                return res.status(401).send("Please unlock (login), or register your car first")
             }
            
        }
    }

    const token =
        req.body.token || req.query.token || req.cookies["session_token"];

    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        jwt.verify(token, config.TOKEN_KEY, (err, decoded)=>onDecode(err, decoded));
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }

}
