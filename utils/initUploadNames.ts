import fs from "fs";

import { mongo } from "../lib/mongo.js";


// Uploads a name to the database
async function uploadName(name: string, collection: string): Promise<boolean> {
    try {

        // Check if the name already exists
        const existsName = await mongo.collection(collection).findOne({ name });

        if (existsName) {
            return false;
        }

        const upload = await mongo.collection(collection).insertOne({ name });

        if (!upload) {
            return false;
        }

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

// Read the names from the file
async function readNames(directory: string): Promise<string[]> {
    try {
        const names: string[] = [];

        // Get the files in the directory
        const files: string[] = await fs.promises.readdir(directory);

        // Read the files
        for await (const file of files) {
            try {
                const _names: string = await fs.promises.readFile(`${directory}/${file}`, "utf-8");
                names.push(..._names.split("\n"));
            } catch (err) {
                console.error(err);
            }
        }

        // Return the names
        return names;
    } catch (err) {
        console.error(err);
        return [];
    }
}

// Upload the names
async function uploadAll(): Promise<void> {
    try {
        const names: string[] = await readNames("../names");

        for await (const name of names) {
            const success: boolean = await uploadName(name.toLocaleLowerCase(), "all_names");

            if (!success) {
                console.error(`Failed to upload ${name}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

// Find all names that contain "bee"
async function findAndUploadBees(): Promise<void> {
    try {
        const names = await mongo.collection("all_names").find({ name: /bee/ }).toArray();

        for await (const name of names) {
            const success: boolean = await uploadName(name.name, "bee_names");

            if (!success) {
                console.error(`Failed to upload ${name.name}`);
            }
        }
    } catch (err) {
        console.error(err);
    }
}
