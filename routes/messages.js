const express = require("express");
const ExpressError = require("../expressError");
const router = express.Router();
const Message = require("../models/message"); // Import Message model
const {
	authenticateJWT,
	ensureLoggedIn,
	ensureCorrectUser,
} = require("../middleware/auth");

/** GET /:id - get detail of message.
 *
 * => {message: {id,
 *               body,
 *               sent_at,
 *               read_at,
 *               from_user: {username, first_name, last_name, phone},
 *               to_user: {username, first_name, last_name, phone}}
 *
 * Make sure that the currently-logged-in user is either the to or from user.
 */
router.get("/:id", authenticateJWT, async function (req, res, next) {
	try {
		const message = await Message.get(req.params.id);

		// Check if the currently-logged-in user is either the sender or the receiver of the message
		if (
			req.user.username === message.from_user.username ||
			req.user.username === message.to_user.username
		) {
			return res.json({ message });
		} else {
			throw new ExpressError("Unauthorized", 401);
		}
	} catch (err) {
		return next(err);
	}
});

/** POST / - post message.
 *
 * {to_username, body} =>
 *   {message: {id, from_username, to_username, body, sent_at}}
 */
router.post("/", authenticateJWT, async function (req, res, next) {
	try {
		const { to_username, body } = req.body;
		const message = await Message.create({
			from_username: req.user.username,
			to_username,
			body,
		});
		return res.status(201).json({ message });
	} catch (err) {
		return next(err);
	}
});

/** POST/:id/read - mark message as read:
 *
 *  => {message: {id, read_at}}
 *
 * Make sure that only the intended recipient can mark as read.
 */
router.post("/:id/read", authenticateJWT, async function (req, res, next) {
	try {
		const message = await Message.get(req.params.id);

		// Check if the currently-logged-in user is the intended recipient of the message
		if (req.user.username === message.to_user.username) {
			const markedMessage = await Message.markRead(req.params.id);
			return res.json({ message: markedMessage });
		} else {
			throw new ExpressError("Unauthorized", 401);
		}
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
