const express = require("express")
const userController = require("../Controller/userController")
const authController = require("../Controller/authController")
const reviewController = require("../Controller/reviewController")
const router = express.Router()

router.post("/signup", authController.SignUp)
router.get("/login", authController.Login)


router.get("/me",authController.Protect, userController.getMe , userController.getUser)

router.post("/forgetPassword", authController.forgotPassword)
router.patch("/updateMe", authController.Protect, userController.updateMe)
router.delete("/deleteMe" , authController.Protect, userController.deleteMe)

router.patch("/resetPassword/:token", authController.resetPassword)
router.patch("/updatePassword", 
authController.Protect,
 authController.updatePassword)

 router.use(authController.restrictTo('admin'))

router.route("/").get(userController.getAllUsers).post(userController.CreateUser);
router.route("/:id").get(userController.getUser).patch(userController.updateUser).delete(userController.deleteUser)




module.exports = router;


