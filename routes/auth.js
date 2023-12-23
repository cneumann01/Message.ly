const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");
const User = require("../models/user"); // Import your User model
const {
	authenticateJWT,
	ensureLoggedIn,
	ensureCorrectUser,
} = require("../middleware/auth");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async function (req, res, next) {
	try {
		const { username, password } = req.body;
		if (await User.authenticate(username, password)) {
			await User.updateLoginTimestamp(username);
			const _token = jwt.sign({ username }, SECRET_KEY);
			return res.json({ _token });
		}
		throw new ExpressError("Invalid username/password", 401);
	} catch (err) {
		return next(err);
	}
});

/** POST /register - register user: registers, logs in, and returns token.
 *
 * {username, password, first_name, last_name, phone} => {token}.
 *
 *  Make sure to update their last-login!
 */
router.post("/register", async function (req, res, next) {
	try {
		const { username, password, first_name, last_name, phone } = req.body;
		const user = await User.register({
			username,
			password,
			first_name,
			last_name,
			phone,
		});
		await User.updateLoginTimestamp(username);
		const _token = jwt.sign({ username }, SECRET_KEY);
		return res.status(201).json({ _token });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
