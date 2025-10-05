import { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import User from "../models/User";

// ----------------------------- Controllers ----------------------------------

// ✅ Send a message
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { senderId, receiverId, text } = req.body;
    if (!senderId || !receiverId || !text) {
      return res.status(400).json({ error: "senderId, receiverId, and text are required" });
    }

    const message = new Message({ senderId, receiverId, text });
    await message.save();

    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

// ✅ Get messages between two users
export async function getMessagesBetweenUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId1, userId2 } = req.params;
    if (!userId1 || !userId2) {
      return res.status(400).json({ error: "Both user IDs are required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    })
      .sort({ createdAt: 1 }) // oldest → newest
      .lean();

    res.json(messages);
  } catch (err) {
    next(err);
  }
}

// ✅ Get all conversations for a user
export async function getUserConversations(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    // Find distinct partners this user has chatted with
    const sentTo = await Message.distinct("receiverId", { senderId: userId });
    const receivedFrom = await Message.distinct("senderId", { receiverId: userId });

    const partnerIds = Array.from(new Set([...sentTo, ...receivedFrom]));

    const partners = await User.find({ _id: { $in: partnerIds } }).lean();
    res.json(partners);
  } catch (err) {
    next(err);
  }
}

// ✅ Delete a message
export async function deleteMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { messageId } = req.params;
    if (!messageId) return res.status(400).json({ error: "messageId required" });

    await Message.findByIdAndDelete(messageId);
    res.json({ message: "Message deleted" });
  } catch (err) {
    next(err);
  }
}
