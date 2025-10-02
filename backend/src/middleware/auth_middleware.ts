/*
	Middleware to enforce authentication outside of /openapi/auth requests
*/

import { Request, Response, NextFunction } from "express"

export const authMiddleware = (excludePaths = ['/openapi/auth']) => {
	return (req: Request, res: Response, next: NextFunction) => {
		console.log(`Path: ${req.path}`);
		console.log(`Excluding: ${excludePaths}`)
		const skipPath = excludePaths.some(path => req.path.startsWith(path))
		if (skipPath) return next();
		console.log("path not skipped!")

		console.log(req.cookies);

		if (!req.cookies || !req.cookies.sessionId) {
			return res.status(401).json({
				error: 'Authentication Required'
			});
		}

		next();
	}
}