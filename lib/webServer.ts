import express, { Express, Router } from "express";
import fs from "fs";
import { Db } from "mongodb";


import { DatabaseHandler } from "./databaseHandler.js";
import bodyParser from "body-parser";


export class WebServer {
    // Properties
    private port: number;
    private db: DatabaseHandler

    // Constructor
    constructor(port: number, mongo: Db) {
        this.port = port;
        this.db = new DatabaseHandler(mongo);
    }

    // Methods

    // Default route
    async defaultRoute(req, res, next): Promise<void> {
        try {
            res.type("text/html")
                .status(200)
                .send(fs.promises.readFile("./public/index.html", "utf-8"));

        // Serverside error response
        } catch (err) {
            console.log(err);
            res.type("application/json")
                .status(500)
                .json({ "message": "Internal Server Error", "error": err });
        }
    }

    async start(): Promise<void> {
        // Configure REST API/Webserver
        const app = express();
        const router = Router();
        app.use(bodyParser.json());
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use("", router);

        // Default route
        router.get("/", defaultRoute);
    }
}