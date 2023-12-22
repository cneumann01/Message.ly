/** User class for message.ly */

/** User of the site. */

class User {
	/** register new user -- returns
	 *    {username, password, first_name, last_name, phone}
	 */

	static async register({
		username,
		password,
		first_name,
		last_name,
		phone,
	}) {
		const result = await db.query(
			`INSERT INTO users 
        (username, password, first_name, last_name, phone, join_at, last_login_at) 
        VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
        RETURNING username, password, first_name, last_name, phone`,
			[username, password, first_name, last_name, phone]
		);

		return result.rows[0];
	}

	/** Authenticate: is this username/password valid? Returns boolean. */

	static async authenticate(username, password) {
		const result = await db.query(
			`SELECT username 
       FROM users 
       WHERE username = $1 AND password = $2`,
			[username, password]
		);

    if (!result.rows[0]) {
      throw new ExpressError(`Invalid username/password`, 401);
    }

		return result.rows.length > 0;
	}

	/** Update last_login_at for user */

	static async updateLoginTimestamp(username) {
		await db.query(
			`UPDATE users 
       SET last_login_at = CURRENT_TIMESTAMP 
       WHERE username = $1`,
			[username]
		);
	}

	/** All: basic info on all users:
	 * [{username, first_name, last_name, phone}, ...] */

	static async all() {
		const result = await db.query(
			`SELECT username, first_name, last_name, phone 
       FROM users`
		);

    if (!result.rows[0]) {
      throw new ExpressError(`No users found`, 404);
    }

		return result.rows;
	}

	/** Get: get user by username
	 *
	 * returns {username,
	 *          first_name,
	 *          last_name,
	 *          phone,
	 *          join_at,
	 *          last_login_at } */

	static async get(username) {
		const result = await db.query(
			`SELECT username, first_name, last_name, phone, join_at, last_login_at 
       FROM users 
       WHERE username = $1`,
			[username]
		);

    if (!result.rows[0]) {
      throw new ExpressError(`Username does not exist: ${username}`, 404);
    }

		return result.rows[0];
	}

	/** Return messages from this user.
	 *
	 * [{id, to_user, body, sent_at, read_at}]
	 *
	 * where to_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesFrom(username) {
		const result = await db.query(
			`SELECT id, to_username AS to_user, body, sent_at, read_at 
       FROM messages 
       WHERE from_username = $1`,
			[username]
		);

    if (!result.rows[0]) {
      throw new ExpressError(`No messages from user: ${username}`, 404);
    }
		return result.rows;
	}

	/** Return messages to this user.
	 *
	 * [{id, from_user, body, sent_at, read_at}]
	 *
	 * where from_user is
	 *   {username, first_name, last_name, phone}
	 */

	static async messagesTo(username) {
		const result = await db.query(
			`SELECT id, from_username AS from_user, body, sent_at, read_at 
       FROM messages 
       WHERE to_username = $1`,
			[username]
		);

    if (!result.rows[0]) {
      throw new ExpressError(`No messages to user: ${username}`, 404);
    }
		return result.rows;
	}
}

module.exports = User;
