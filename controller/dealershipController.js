import bcrypt from "bcrypt"
import Cars from "../models/car.js"
import Jwt from "jsonwebtoken";


export const hashCarKeys = (carKeys) => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(carKeys, salt);
}

export const getAllCars = async (req, res) => {

    try {
        const cars = await Cars.find()
        res.json(cars)
    } catch (err) {
        res.status(500).json({ message: err.message })
    }

}


export const registerAdminCar = async (req, res) => {
    //heatedCarSeatMembership = isAdmin
    const { make, model, year, carKeys } = req.body;

    if (!make || !model || !year || !carKeys) {
        return res.status(400).json({ error: "Please make sure to have a car make, model, year and carKeys" });
    }

    const hashedCarKeys = hashCarKeys(carKeys)

    try {
        const newCar = new Cars({ make, model, year, carKeys: hashedCarKeys, heatedCarSeatMembership: true });

        newCar.save()
        res.status(201).json({ message: `Enjoy your brand new ${make} with heated car seats` });
    } catch (err) {
        res.send(err);
    }
};

export const registerCar = async (req, res) => {
    //heatedCarSeatMembership = isAdmin
    const { make, model, year, carKeys, heatedCarSeatMembership } = req.body;

    if (!make || !model || !year || !carKeys) {
        return res.status(400).json({ error: "Please make sure to have a car make, model, year and carKeys" });
    }

    const hashedCarKeys = hashCarKeys(carKeys)

    if (heatedCarSeatMembership) {
        return res.status(400).json({ error: "To make a VIP car, please contact the president of `Cars`" });
    }
    try {
        const newCar = new Cars({ make, model, year, carKeys: hashedCarKeys });

        let token
        try {
            token = Jwt.sign(
                {
                    _id: newCar._id,
                    model: newCar.model,
                    make: newCar.make,
                    year: newCar.year,
                    carKeys: newCar.carKeys,
                    heatedCarSeatMembership: newCar.heatedCarSeatMembership,
                },
                process.env.TOKEN_KEY,
                {
                    expiresIn: "2h",
                }
            );
        } catch (err) {
            console.log(err);
        }
        newCar.token = token
        newCar.save()
        res.cookie("session_token", token, { httpOnly: true })
            .status(201).json({ message: `Enjoy your brand new ${make}` })
    } catch (err) {
        res.send(err);
    }
};

export const deleteCar = async (req, res) => {
    const carId = req.params.id;
    try {
        await Cars.findByIdAndDelete(carId);
        res.status(200).json({ message: "Car has been sent to a car compactor, we can buy the scrap metal from your deleted car" });
    } catch (err) {
        res.send(err);
    }
};

const badLoginResponse = (res) => {
    return res.status(403).json({ error: "Invalid carKey, or car Id presented" })
}

export const unlockCar = async (req, res, next) => 
{
    const { _id, carKeys } = req.body;
    if (!_id || !carKeys)
        return badLoginResponse(res);
    try {
        console.log(_id, carKeys)
        const lockedCar = await Cars.findById(_id);
        console.log(lockedCar)
        if (!lockedCar) {
            return badLoginResponse(res);
        }
        const isCorrectKey = bcrypt.compareSync(carKeys, lockedCar.carKeys);
        if (isCorrectKey) {
            let token
            try {
                token = Jwt.sign(
                    {
                        _id: lockedCar._id,
                        model: lockedCar.model,
                        make: lockedCar.make,
                        year: lockedCar.year,
                        carKeys: lockedCar.carKeys,
                        heatedCarSeatMembership: lockedCar.heatedCarSeatMembership,
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
            } catch (err) {
                console.log(err);
            }

            lockedCar.token = token
            lockedCar.save()
            return res
                .cookie("session_token", token, { httpOnly: true })
                .status(200)
                .json({ message: "Car unlocked" });
        } else {
            return badLoginResponse(res);
        }
    } catch (err) {
        return res.send(err);
    }
}

export const updateHeatedCarseatMembership = async (req, res) => {
    // heatedCarSeatMembership = isAdmin
    const carId = req.body._id;
    console.log(carId)
    const existingCar = await Cars.findById(carId)
    if (!existingCar) return res.status(400).json({
        error: "Bad request",
    });

    if (req.user.heatedCarSeatMembership) {
        existingCar.heatedCarSeatMembership = req.body?.heatedCarSeatMembership;

        //invalidates session
        if (req.user._id === carId) {
            let token
            try {
                token = Jwt.sign(
                    {
                        _id: existingCar._id,
                        model: existingCar.model,
                        make: existingCar.make,
                        year: existingCar.year,
                        carKeys: existingCar.carKeys,
                        heatedCarSeatMembership: existingCar.heatedCarSeatMembership,
                    },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
            } catch (err) {
                console.log(err);
            }

            existingCar.token = token;
            existingCar.save()
            return res
                .cookie("session_token", token, { httpOnly: true })
                .status(200)
                .json({ message: "User Successfully Updated." });
        }else{
            console.log(existingCar);
            existingCar.token = "";
            existingCar.carKeys = existingCar.carKeys;
            existingCar.save()
            return res.status(200).json({message: `Updated user -> Heated seats: ${existingCar.heatedCarSeatMembership}, for car: ${existingCar._id}`})
        }

    } else {
        return res
            .status(401)
            .json({ error: "Unauthorized" });
    }

}

export const updateCarById = async (req, res) => {
    const isAuthorized = req.body._id === req.user._id.toString() || req.user.heatedCarSeatMembership
    console.log(req.body._id)
    console.log(req.user._id.toString())
    console.log(req.user.heatedCarSeatMembership)
    const existingCar = await Cars.findById(req.body._id)
    if(!isAuthorized){
        return res.status(401).json({message:"Unauthorized"})
    }
    try {
        if (!existingCar) {
            return res.status(400).json({
                error: "Bad request",
            });
        }

        const { make, model, year, carKeys } = req.body;
        make && (existingCar.make = make)
        model && (existingCar.model = model);
        year && (existingCar.year = year);

        if (carKeys) {
            const hashedCarKeys = hashCarKeys(carKeys)
            existingCar.carKeys = hashedCarKeys
        }
        existingCar.save()
        return res.status(200).json({message:"car updated"})

    } catch (err) {
        res.status(500).json({
            error: "Internal error"
        })
    }
};

