import {registerCar, getAllCars, updateCarById, registerAdminCar, unlockCar, updateHeatedCarseatMembership, deleteCar} from "../controller/dealershipController.js";
import {verifyToken} from "../middleware/auth.js"
import express from "express";
import { deleteManyByYear } from "../controller/carController.js";
const router= express.Router()

router.get('/', getAllCars)

// Creating one
router.post('/register', registerCar)

// Creating admin
router.post('/register/admin', registerAdminCar)

// login
router.post('/unlock', unlockCar)

//make admin
router.patch('/uptdate/membership', verifyToken, updateHeatedCarseatMembership)

// Updating one
router.patch('/update', verifyToken, updateCarById)

//Deleting many
router.post('/deleteByYear', verifyToken, deleteManyByYear)

//Deleting one
router.delete('/:id', deleteCar)


export default router