import { Db } from "mongodb";

export interface DataBaseResponse<T> {
    success: boolean,
    data?: T,
    error?: any
}


export class DatabaseHandler {
    private db: Db;

    constructor(db: Db) {
        this.db = db;
    }

    // Methods

    // Get a random bee name from the database
    async getBeeName(): Promise<DataBaseResponse<string>> {
        try {
            // Get a random bee name from the database
            const query = await this.db.collection("bee_names").aggregate([{ $sample: { size: 1 } }]).toArray();
            const beeName: string = query[0].name.replace("\\", "").replace(/(\r\n|\n|\r)/gm, "");
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Upload bee name to database
    async uploadBeeName(beeName: string): Promise<DataBaseResponse<string>> {
        try {
            // Check if the name already exists
            const existsName = await this.db.collection("bee_names").findOne({ name: beeName });

            if (existsName) {
                return { success: false, error: "Name already exists" };
            }

            // Upload bee name to database
            const query = await this.db.collection("bee_names").insertOne({ name: beeName });

            // Check if bee name was uploaded successfully
            if (query.acknowledged === false) {
                return { success: false, error: "Failed to upload bee name" };
            }

            // Return bee name if successful
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Delete bee name from database
    async deleteBeeName(beeName: string): Promise<DataBaseResponse<string>> {
        try {
            // Delete bee name from database
            const query = await this.db.collection("bee_names").deleteOne({ name: beeName });

            // Check if bee name was deleted successfully
            if (query.acknowledged === false) {
                return { success: false, error: "Failed to delete bee name" };
            }

            // Return bee name if successful
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Submit a bee name
    async submitBeeName(beeName: string): Promise<DataBaseResponse<string>> {
        try {
            // Check if the name already exists
            const existsName = await this.db.collection("bee_name_suggestions").findOne({ name: beeName });

            if (existsName) {
                return { success: false, error: "Suggestion already exists" };
            }

            const query = await this.db.collection("bee_name_suggestions").insertOne({ name: beeName });

            // Check if bee name was submitted successfully
            if (query.acknowledged === false) {
                return { success: false, error: "Failed to submit bee name" };
            }

            // Return bee name if successful
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Get bee name suggestions
    async getBeeNameSuggestions(amount: number): Promise<DataBaseResponse<string[]>> {
        try {
            // Get bee name suggestions
            const query = await this.db.collection("bee_name_suggestions").aggregate([{ $sample: { size: amount } }]).toArray();

            // Turn into array of strings
            const beeNameSuggestions: string[] = [];
            query.forEach((beeName) => beeNameSuggestions.push(beeName.name));

            // Check if bee name suggestions were found
            if (beeNameSuggestions.length === 0) {
                return { success: false, error: "No suggestions found" };
            }

            // Return bee name suggestions if successful
            return { success: true, data: beeNameSuggestions };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Accept a bee name suggestion
    async acceptBeeNameSuggestion(beeName: string): Promise<DataBaseResponse<string>> {
        try {
            // Check if the name already exists
            const existsName = await this.db.collection("bee_names").findOne({ name: beeName });

            if (existsName) {
                return { success: false, error: "Name already exists" };
            }

            // Upload bee name to database
            const uploadQuery = await this.db.collection("bee_names").insertOne({ name: beeName });

            // Check if bee name was uploaded successfully
            if (uploadQuery.acknowledged === false) {
                return { success: false, error: "Failed to upload bee name" };
            }

            // Delete bee name suggestion
            const deleteQuery = await this.db.collection("bee_name_suggestions").deleteOne({ name: beeName });

            // Check if bee name suggestion was deleted successfully
            if (deleteQuery.acknowledged === false) {
                return { success: false, error: "Failed to delete bee name suggestion" };
            }

            // Return bee name if successful
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }

    // Reject a bee name suggestion
    async rejectBeeNameSuggestion(beeName: string): Promise<DataBaseResponse<string>> {
        try {
            // Delete bee name suggestion
            const deleteQuery = await this.db.collection("bee_name_suggestions").deleteOne({ name: beeName });

            // Check if bee name suggestion was deleted successfully
            if (deleteQuery.acknowledged === false) {
                return { success: false, error: "Failed to delete bee name suggestion" };
            }

            // Return bee name if successful
            return { success: true, data: beeName };
        } catch (err) {
            console.log(err);
            return { success: false, error: err };
        }
    }
}