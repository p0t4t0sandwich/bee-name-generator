import bodyParser from "body-parser";
import express, { Router } from "express";
import { Db } from "mongodb";


import { DatabaseHandler } from "./databaseHandler.js";

function generateToken(): string {
    const chars: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let token: string = "";
    for (let i = 0; i < 32; i++) {
        token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
}

export const DOMAIN: string = <string>process.env.DOMAIN || "https://api.sperrer.ca";
export const ROOT_ENDPOINT: string = <string>process.env.ROOT_ENDPOINT || "/api/v1/bee-name-generator";
export const AUTH_TOKEN: string = <string>process.env.AUTH_TOKEN || generateToken();


export class WebServer {
    // Properties
    private port: number = <number><unknown>process.env.REST_PORT || 3002;
    private db: DatabaseHandler;

    // Constructor
    constructor(mongo: Db) {
        this.db = new DatabaseHandler(mongo);
    }

    // Methods

    // Default route
    async defaultRoute(req, res, next): Promise<void> {
        try {
            res.type("text/html")
                .status(200)
                .send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <title>Bee Name Generator</title>
                    <style>
                        body {
                            font-family: Arial, Helvetica, sans-serif;
                        }
                    </style>
                </head>
                <body>
                    <h1>Bee Name Generator</h1>
                    <a href="https://github.com/p0t4t0sandwich/bee-name-generator">GitHub Repository</a>
                    <br>
                    <p>Get a bee name: </p>
                    <a href="${DOMAIN}${ROOT_ENDPOINT}/name">GET ${DOMAIN}${ROOT_ENDPOINT}/name</a>
                    <br>
                    <p>Upload a bee name (Authentication Required): </p>
                    <a href="${DOMAIN}${ROOT_ENDPOINT}/name">POST ${DOMAIN}${ROOT_ENDPOINT}/name</a>
                    <br>
                    <iframe name="dummyframe" id="dummyframe" style="display: none;"></iframe>
                    <p>Submit a bee name (it can make sense, or you can be punny with it): </p>
                    <form action="${DOMAIN}${ROOT_ENDPOINT}/suggestion" method="post" target="dummyframe">
                        <input type="text" name="name" placeholder="Bee Name">
                        <input type="submit" value="Submit">
                    </form>
                    <p>Get bee name suggestions (Authentication Required): </p>
                    <a href="${DOMAIN}${ROOT_ENDPOINT}/suggestion">GET ${DOMAIN}${ROOT_ENDPOINT}/suggestion</a>
                    <br>
                    <p>Accept a bee name suggestion (Authentication Required): </p>
                    <a href="${DOMAIN}${ROOT_ENDPOINT}/suggestion">PUT ${DOMAIN}${ROOT_ENDPOINT}/suggestion</a>
                    <br>
                    <p>Reject a bee name suggestion (Authentication Required): </p>
                    <a href="${DOMAIN}${ROOT_ENDPOINT}/suggestion">DELETE ${DOMAIN}${ROOT_ENDPOINT}/suggestion</a>
                </body>
                </html>
                `);

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Get a bee name
    async getBeeNameRoute(req, res, next): Promise<void> {
        try {
            // Get a random bee name from the database
            const beeName = await this.db.getBeeName();
            if (beeName.success) {
                res.type("application/json")
                    .status(200)
                    .json({ "name": beeName.data });
            } else {
                res.type("application/json")
                    .status(500)
                    .json({ "message": "Internal Server Error", "error": beeName.error });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Upload a bee name (authenticated)
    async uploadBeeNameRoute(req, res, next): Promise<void> {
        try { 
            // Check if request is authenticated
            if (req.headers.authorization === AUTH_TOKEN) {
                // Check if request body is valid
                const beeName: string = req.params.name || req.body.name;

                if (beeName) {
                    // Upload bee name to database
                    const beeName = await this.db.uploadBeeName(req.body.name);
                    if (beeName.success) {
                        res.type("application/json")
                            .status(200)
                            .json({ "name": beeName.data });

                    // Failed to upload bee name
                    } else {
                        res.type("application/json")
                            .status(500)
                            .json({ "message": "Internal Server Error", "error": beeName.error });
                    }

                // Invalid request body
                } else {
                    res.type("application/json")
                        .status(400)
                        .json({ "message": "Bad Request", "error": "Request body is invalid" });
                }

            // Unauthorized request
            } else {
                res.type("application/json")
                    .status(401)
                    .json({ "message": "Unauthorized", "error": "Request is not authenticated" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Delete a bee name (authenticated)
    async deleteBeeNameRoute(req, res, next): Promise<void> {
        try {
            // Check if request is authenticated
            if (req.headers.authorization === AUTH_TOKEN) {
                // Check if request body is valid
                const beeName: string = req.params.name || req.body.name;

                if (beeName) {
                    // Delete bee name from database
                    const beeName = await this.db.deleteBeeName(req.body.name);
                    if (beeName.success) {
                        res.type("application/json")
                            .status(200)
                            .json({ "name": beeName.data });

                    // Failed to delete bee name
                    } else {
                        res.type("application/json")
                            .status(500)
                            .json({ "message": "Internal Server Error", "error": beeName.error });
                    }

                // Invalid request body
                } else {
                    res.type("application/json")
                        .status(400)
                        .json({ "message": "Bad Request", "error": "Request body is invalid" });
                }

            // Unauthorized request
            } else {
                res.type("application/json")
                    .status(401)
                    .json({ "message": "Unauthorized", "error": "Request is not authenticated" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    async submitBeeNameRoute(req, res, next): Promise<void> {
        try {
            // Check if request body is valid
            const beeName = req.params.name || req.body.name;
            if (beeName) {
                // Upload bee name to database
                const response = await this.db.submitBeeName(beeName);

                // Check if bee name was uploaded successfully
                if (response.success) {
                    res.type("application/json")
                        .status(200)
                        .json({ "name": response.data });

                // Failed to upload bee name
                } else {
                    res.type("application/json")
                        .status(500)
                        .json({ "message": "Internal Server Error", "error": response.error });
                }

            // Invalid request body
            } else {
                res.type("application/json")
                    .status(400)
                    .json({ "message": "Bad Request", "error": "Request body is invalid" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Get bee name suggestions
    async getBeeNameSuggestionsRoute(req, res, next): Promise<void> {
        try {
            // Check if request is authenticated
            if (req.headers.authorization === AUTH_TOKEN) {
                // Check if request body is valid
                const amount: number = req.params.amount || req.body.amount || 1;

                // Get bee name suggestions from database
                const beeNameSuggestions = await this.db.getBeeNameSuggestions(amount);
                if (beeNameSuggestions.success) {
                    res.type("application/json")
                        .status(200)
                        .json({ "names": beeNameSuggestions.data });

                // Failed to get bee name suggestions
                } else {
                    res.type("application/json")
                        .status(500)
                        .json({ "message": "Internal Server Error", "error": beeNameSuggestions.error });
                }

            // Unauthorized request
            } else {
                res.type("application/json")
                    .status(401)
                    .json({ "message": "Unauthorized", "error": "Request is not authenticated" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Accept a bee name suggestion
    async acceptBeeNameSuggestionRoute(req, res, next): Promise<void> {
        try {
            // Check if request is authenticated
            if (req.headers.authorization === AUTH_TOKEN) {
                // Check if request body is valid
                const beeName: string = req.params.name || req.body.name;
                if (beeName) {
                    // Upload bee name to database
                    const response = await this.db.acceptBeeNameSuggestion(beeName);

                    // Check if bee name was uploaded successfully
                    if (response.success) {
                        res.type("application/json")
                            .status(200)
                            .json({ "name": response.data });

                    // Failed to accept bee name
                    } else {
                        res.type("application/json")
                            .status(500)
                            .json({ "message": "Internal Server Error", "error": response.error });
                    }

                // Invalid request body
                } else {
                    res.type("application/json")
                        .status(400)
                        .json({ "message": "Bad Request", "error": "Request body is invalid" });
                }

            // Unauthorized request
            } else {
                res.type("application/json")
                    .status(401)
                    .json({ "message": "Unauthorized", "error": "Request is not authenticated" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Reject a bee name suggestion
    async rejectBeeNameSuggestionRoute(req, res, next): Promise<void> {
        try {
            // Check if request body is valid
            const beeName: string = req.params.name || req.body.name;
            if (beeName) {
                // Upload bee name to database
                const response = await this.db.rejectBeeNameSuggestion(beeName);

                // Check if bee name was uploaded successfully
                if (response.success) {
                    res.type("application/json")
                        .status(200)
                        .json({ "name": response.data });

                // Failed to reject bee name
                } else {
                    res.type("application/json")
                        .status(500)
                        .json({ "message": "Internal Server Error", "error": response.error });
                }

            // Invalid request body
            } else {
                res.type("application/json")
                    .status(400)
                    .json({ "message": "Bad Request", "error": "Request body is invalid" });
            }

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    // Start webserver
    async start(): Promise<void> {
        // Configure REST API/Webserver
        const app = express();
        const router = Router();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use("", router);

        // Default route
        router.get("/", this.defaultRoute.bind(this));

        // Get a bee name
        router.get("/name", this.getBeeNameRoute.bind(this));

        // Upload a bee name
        router.post("/name", this.uploadBeeNameRoute.bind(this));
        router.post("/name/:name", this.uploadBeeNameRoute.bind(this));

        // Delete a bee name
        router.delete("/name", this.deleteBeeNameRoute.bind(this));
        router.delete("/name/:name", this.deleteBeeNameRoute.bind(this));

        // Submit a bee name
        router.post("/suggestion", this.submitBeeNameRoute.bind(this));
        router.post("/suggestion/:name", this.submitBeeNameRoute.bind(this));

        // Get bee name suggestions
        router.get("/suggestion", this.getBeeNameSuggestionsRoute.bind(this));
        router.get("/suggestion/:amount", this.getBeeNameSuggestionsRoute.bind(this));

        // Accept a bee name suggestion
        router.put("/suggestion", this.acceptBeeNameSuggestionRoute.bind(this));
        router.put("/suggestion/:name", this.acceptBeeNameSuggestionRoute.bind(this));

        // Reject a bee name suggestion
        router.delete("/suggestion", this.rejectBeeNameSuggestionRoute.bind(this));
        router.delete("/suggestion/:name", this.rejectBeeNameSuggestionRoute.bind(this));

        // Start webserver
        app.listen(this.port, () => {
            console.log(`Webserver started on port ${this.port}`);
        });
    }
}