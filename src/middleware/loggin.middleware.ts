import { Request, Response, NextFunction } from 'express';


class LogginMiddleware {

    public loggingMiddleware(req: Request, res: Response, next: NextFunction): void {
        console.log(`Request received: ${req.method} ${req.originalUrl}`);
        console.log(`Request body: ${JSON.stringify(req.body)}`);
        
        const originalSend = res.send;
        res.send = function (body: unknown) {
            console.log(`Response sent: ${res.statusCode}`);
            console.log(`Response body: ${JSON.stringify(body)}`);
            return originalSend.apply(res, [body]);
        };

        next();
    }
}

export default LogginMiddleware;