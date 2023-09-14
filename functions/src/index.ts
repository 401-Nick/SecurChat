import * as functions from "firebase-functions";
import * as cors from "cors";
import * as jwt from 'jsonwebtoken';
import { JwtPayload } from 'jsonwebtoken';

const corsHandler = cors({ origin: true });

interface MyPayload extends JwtPayload {
    roomId?: string;
}

export const generateToken = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        const roomId = request.query.roomId as string;
        if (!roomId) {
            response.status(400).send('Missing room ID');
            return;
        }


        //'secret' is the secret key used to sign the token, this will be replaced with a more secure key in production
        jwt.sign({ roomId }, 'secret', { expiresIn: '24h' }, (err: any, token: any) => {
            if (err) {
                console.error(err);
                response.status(500).send('An error occurred while generating the token.');
                return;
            }
            response.status(200).send({ token });
        });
    });
});

export const verifyToken = functions.https.onRequest((request, response) => {
    corsHandler(request, response, async () => {
        const roomId = request.query.roomId as string;
        const token = request.query.token as string;

        if (!roomId || !token) {
            response.status(400).send('Missing room ID or token');
            return;
        }

        try {
            const decoded = <MyPayload>jwt.verify(token, 'secret');
            if (decoded.roomId === roomId) {
                response.status(200).send({ valid: true });
            } else {
                response.status(200).send({ valid: false });
            }
        } catch (error) {
            console.error(error);
            response.status(500).send('An error occurred while verifying the token.');
        }
    });
});
