import Contact from "../models/Contact.js";
import Resident from "../models/Resident.js";
import User from "../models/User.js";
import Notification from '../models/Notification.js';


export const getMessages = async (req, res) => {
  try {
    const contacts = await Contact.find()
      .populate({
        path: 'resident',
        populate: {
          path: 'userId',
          model: 'User',
          select: 'name email'
        }
      })
      .lean();

    // Fetch notifications related to these contacts
    const contactIds = contacts.map(c => c._id);
    const notifications = await Notification.find({ contact: { $in: contactIds } })
      .lean();

    const notificationsMap = {};
    notifications.forEach(n => {
      notificationsMap[n.contact.toString()] = n.isRead;
    });

    const formattedContacts = contacts.map(contact => ({
      ...contact,
      sentAt: new Date(contact.sentAt).toISOString(),
      name: contact.resident?.userId?.name || "Unknown",
      email: contact.resident?.userId?.email || "No email",
      seen: notificationsMap[contact._id.toString()] ? "Seen" : "Not Seen"
    }));

    console.log("Formatted Contacts:", formattedContacts);

    return res.status(200).json({ success: true, contacts: formattedContacts });

  } catch (error) {
    console.error("Error fetching messages:", error);
    return res.status(500).json({ success: false, error: "Server error" });
  }
};


export const addContact = async (req, res) => {
  try {
    // 1. Get the userId from the authenticated resident
    const userId = req.user._id;

    // 2. Find the resident profile using the user ID
    const resident = await Resident.findOne({ userId });

    if (!resident) {
      return res.status(400).json({ success: false, error: "Resident not found for this user" });
    }

    // 3. Destructure the submitted form data
    const { subject, message } = req.body;

    // 4. Save the contact message
    const newContact = new Contact({
      subject,
      message,
      resident: resident._id,
      isResolved: false,
    });

    await newContact.save();

    // ✅ 5. Find the admin user (assuming one admin)
    const admin = await User.findOne({ role: "admin" });

    if (!admin) {
      return res.status(500).json({ success: false, error: "Admin user not found" });
    }

    // 6. Create a notification *for the admin*
    const newNotification = new Notification({
      user: admin._id,         // Notify the admin
      contact: newContact._id, // Link to the contact message
    });

    await newNotification.save();

    // 7. Return success
    return res.status(200).json({ success: true, contact: newContact });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: "Add contact server error" });
  }
};



export const getContactById = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id).populate('resident');
    if (!contact) {
      return res.status(404).json({ success: false, error: 'Contact not found' });
    }
    return res.status(200).json({ success: true, contact });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Server error while retrieving contact' });
  }
};

export const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    // Find the contact by ID
    const contact = await Contact.findById(id).populate('resident');
    if (!contact) {
      return res.status(404).json({ success: false, error: "Contact not found" });
    }

    // Update contact with the reply
    contact.reply = {
      message,
      sentAt: new Date(),
    };
    contact.isResolved = true;
    await contact.save();

    // ✅ Find the user ID from the resident
    const resident = await Resident.findById(contact.resident._id).populate('userId');
    if (!resident || !resident.userId) {
      return res.status(400).json({ success: false, error: "User not found for the resident" });
    }

    // ✅ Create a new notification
    const notification = new Notification({
      user: resident.userId._id,
      contact: contact._id,
    });

    await notification.save(); // Save notification to DB

    res.status(200).json({ success: true, message: "Reply sent successfully and notification created" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Server error" });
  }
};

export const deleteContact = async (req,res) =>{
    try {
        const {id} = req.params;
        console.log("******",id)
        const deleteContact = await Contact.findById({_id: id})
        await deleteContact.deleteOne()
        
        if (!deleteContact) {
            return res.status(404).json({ success: false, error: "Contact not found" });
        }
        return res.status(200).json({success: true, deleteContact})
    } catch (error) {
        return res.status(500).json({success: false,error: "delete Contact server error"})
    }
}