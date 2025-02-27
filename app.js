// app.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require('cors');
const app = express();

// Middleware
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  ssl: true,  // تأكد من تضمين SSL
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define Mongoose Schema & Model
const FormSchema = new mongoose.Schema({
  username: String,
  email: String,
  description: String,
  phone: String,
  city: String,
});

const Form = mongoose.model("Form", FormSchema);

// Enable CORS for all origins (You can customize this to restrict to specific domains)
app.use(cors());

// POST Endpoint
app.post("/submit-form", async (req, res) => {
  try {
    const { username, email, description, phone, city } = req.body;

    // Simple validation (optional)
    if (!username || !email || !description || !phone || !city) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const formData = new Form({
      username,
      email,
      description,
      phone,
      city,
    });

    await formData.save();
    res.status(201).json({ message: "Form submitted successfully" });
  } catch (error) {
    console.error("Error saving form data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// get endpoint 

app.get("/forms", async (req, res) => {
    console.log("GET /forms triggered :)");  
    try {
        const forms = await Form.find();
        res.status(200).json(forms);
    } catch (error) {
        console.error("Error fetching forms:", error);
        res.status(500).json({ message: "Error fetching forms", error });
    }
});


//delete end point

app.delete("/forms/:id", async (req, res) => {
    console.log("Deleting form with ID:", req.params.id);

    try {
        const result = await Form.deleteOne({ _id: req.params.id });

        if (result.deletedCount === 0) {
            return res.status(404).json({ message: "Form not found" });
        }

        res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
        console.error("Error deleting form:", error);
        res.status(500).json({ message: "Error deleting form", error });
    }
});




app.put("/forms/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { username, email, description, phone, city } = req.body;

        // Simple validation (optional)
        if (!username || !email || !description || !phone || !city) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const updatedForm = await Form.findByIdAndUpdate(
            id, 
            { username, email, description, phone, city }, 
            { new: true, runValidators: true } // Return the updated document
        );

        if (!updatedForm) {
            return res.status(404).json({ message: "Form not found" });
        }

        res.status(200).json({ message: "Form updated successfully", form: updatedForm });
    } catch (error) {
        console.error("Error updating form data:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
