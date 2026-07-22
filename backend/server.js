const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

const Contact = require("./models/Contact");

dotenv.config();

const app = express();


// ==========================================
// MIDDLEWARE
// ==========================================

// Allow frontend to communicate with backend
app.use(cors());

// Allow JSON data from frontend
app.use(express.json());


// ==========================================
// MONGODB CONNECTION
// ==========================================

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log("=================================");
        console.log("MongoDB connected successfully");
        console.log("=================================");
    })
    .catch((error) => {
        console.error("MongoDB connection failed:");
        console.error(error);
    });


// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        message: "The Nourished Roots backend is running successfully."
    });

});


// ==========================================
// CREATE CONTACT MESSAGE
// ==========================================

app.post("/api/contact", async (req, res) => {

    try {

        const {
            fullName,
            email,
            phone,
            subject,
            message
        } = req.body;


        // ----------------------------------
        // VALIDATION
        // ----------------------------------

        if (!fullName || !email || !subject || !message) {

            return res.status(400).json({

                success: false,

                message:
                    "Please fill in all required fields."

            });

        }


        // ----------------------------------
        // CREATE NEW CONTACT
        // ----------------------------------

        const newContact = new Contact({

            fullName: fullName.trim(),

            email: email.trim().toLowerCase(),

            phone: phone ? phone.trim() : "",

            subject: subject.trim(),

            message: message.trim()

        });


        // ----------------------------------
        // SAVE TO MONGODB
        // ----------------------------------

        const savedContact =
            await newContact.save();


        // ----------------------------------
        // SUCCESS RESPONSE
        // ----------------------------------

        res.status(201).json({

            success: true,

            message:
                "Thank you! Your message has been sent successfully.",

            data: {

                id: savedContact._id,

                fullName: savedContact.fullName,

                email: savedContact.email,

                subject: savedContact.subject

            }

        });


    } catch (error) {

        console.error(
            "Error saving contact message:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Something went wrong. Please try again later."

        });

    }

});


// ==========================================
// GET ALL CONTACT MESSAGES
// ==========================================

app.get("/api/contact", async (req, res) => {

    try {

        const contacts =
            await Contact
                .find()
                .sort({ createdAt: -1 });


        res.status(200).json({

            success: true,

            count: contacts.length,

            data: contacts

        });


    } catch (error) {

        console.error(
            "Error fetching contact messages:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch contact messages."

        });

    }

});


// ==========================================
// GET SINGLE CONTACT MESSAGE
// ==========================================

app.get("/api/contact/:id", async (req, res) => {

    try {

        const contact =
            await Contact.findById(
                req.params.id
            );


        if (!contact) {

            return res.status(404).json({

                success: false,

                message:
                    "Contact message not found."

            });

        }


        res.status(200).json({

            success: true,

            data: contact

        });


    } catch (error) {

        console.error(
            "Error fetching contact:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to fetch contact message."

        });

    }

});


// ==========================================
// DELETE CONTACT MESSAGE
// ==========================================

app.delete("/api/contact/:id", async (req, res) => {

    try {

        const deletedContact =
            await Contact.findByIdAndDelete(
                req.params.id
            );


        if (!deletedContact) {

            return res.status(404).json({

                success: false,

                message:
                    "Contact message not found."

            });

        }


        res.status(200).json({

            success: true,

            message:
                "Contact message deleted successfully."

        });


    } catch (error) {

        console.error(
            "Error deleting contact:",
            error
        );


        res.status(500).json({

            success: false,

            message:
                "Unable to delete contact message."

        });

    }

});


// ==========================================
// SERVER
// ==========================================

const PORT =
    process.env.PORT || 5000;


app.listen(PORT, () => {

    console.log("");
    console.log("=================================");
    console.log(
        `Server running on port ${PORT}`
    );
    console.log(
        `http://localhost:${PORT}`
    );
    console.log("=================================");
    console.log("");

});