/*
    Router for handling /openapi/auth/ requests
*/

import { Router } from "express";
import { components } from "../../openapi/schema";

export const authRouter = Router();

authRouter.post("/login", async (req, res) => {
	const credentials = req.body;
	let authenticated = false;
	let sessiontoken = "testTokoen"
	if (credentials.password !== "") {
		authenticated = true;
	}

	if (authenticated) {
		res.cookie('sessionId', sessiontoken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			maxAge: 24 * 60 * 60 * 1000, // 24 hour lifetime
			sameSite: 'strict'
		});
		res.json({ success: true });
	} else {
		res.status(401);
		res.json({ success: false });
	}

	return res;
});

authRouter.get("/logout", async (req, res) => {
	res.clearCookie('sessionId');
	res.json({ success: true });

	return res;
})