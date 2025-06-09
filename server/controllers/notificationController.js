import Notification from '../models/Notification.js';
import Contact from '../models/Contact.js';
import VisitRequest from '../models/VisitRequest.js';
import Resident from '../models/Resident.js';

/**
 * Fetch all notifications for the authenticated user.
 */
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .populate('contact')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getRequestes = async (req, res) => {
  try {
    const user = req.user;

    let notifications = [];

    if (user.role === 'resident') {
      // Resident: find their associated resident document
      const resident = await Resident.findOne({ userId: user.id });

      if (!resident) {
        return res.status(404).json({ success: false, message: 'Resident not found.' });
      }

      notifications = await Notification.find({
        user: resident.userId,
        visitRequest: { $ne: null }
      })
        .populate({
          path: 'visitRequest',
          populate: {
            path: 'createdBy',
            select: 'name email'
          }
        })
        .sort({ createdAt: -1 });

    } else if (user.role === 'admin') {
      // Admin: get all visitRequest-related notifications directly
      notifications = await Notification.find({
        user: user._id, // or resident.userId for resident
        visitRequest: { $ne: null }
      })
      .populate({
        path: 'visitRequest',
        populate: [
          {
            path: 'createdBy',
            select: 'name email'
          },
          {
            path: 'targetResident',
            populate: {
              path: 'userId',
              select: 'name' // <<== This is the KEY to get the name of the resident
            }
          }
        ]
      })
      .sort({ createdAt: -1 });
      
    } else {
      return res.status(403).json({ success: false, message: 'Unauthorized role.' });
    }

    res.status(200).json({ success: true, requests: notifications });

  } catch (error) {
    console.error('Error fetching visit requests:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch visit requests.' });
  }
};

/**
 * Mark all notifications as read for the authenticated user.
 */
export const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
    });
    
    const unreadMessagesCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
      contact: { $exists: true } // Only count notifications with contact
    });
    
    const unreadNotificationsCount = await Notification.countDocuments({
      user: req.user._id,
      isRead: false,
      visitRequest: { $exists: true } // Only count notifications with visitRequest
    });

    res.json({ 
      unreadCount,
      unreadMessagesCount,
      unreadNotificationsCount 
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    res.json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

