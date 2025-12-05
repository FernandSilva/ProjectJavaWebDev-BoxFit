import { Request, Response, NextFunction } from "express";
import Message from "../models/Message";
import User from "../models/User";

// ───────────────────────────────
// ✅ Send a message
// ───────────────────────────────
export async function sendMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const senderId =
      req.body.senderId || req.body.userId || req.body.from || req.body.user;
    const receiverId =
      req.body.receiverId || req.body.recipientId || req.body.to;
    const text = req.body.text || req.body.content;

    if (!senderId || !receiverId || !text) {
      return res.status(400).json({
        error: "senderId/receiverId/text (or userId/recipientId/content) required",
      });
    }

    const message = await Message.create({
      senderId,
      receiverId,
      text,
    });

    const populated = await Message.findById(message._id)
      .populate("senderId", "name username imageUrl _id")
      .populate("receiverId", "name username imageUrl _id")
      .lean();

    res.status(201).json(populated);
  } catch (err) {
    console.error("❌ sendMessage error:", (err as Error).message);
    next(err);
  }
}

// ───────────────────────────────
// ✅ Get messages between two users
// ───────────────────────────────
export async function getMessagesBetweenUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, peerId } = req.query;
    const u1 = userId as string;
    const u2 = peerId as string;

    if (!u1 || !u2) {
      return res.status(400).json({ error: "userId and peerId are required" });
    }

    const messages = await Message.find({
      $or: [
        { senderId: u1, receiverId: u2 },
        { senderId: u2, receiverId: u1 },
      ],
    })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ documents: messages });
  } catch (err) {
    console.error("❌ getMessagesBetweenUsers error:", (err as Error).message);
    next(err);
  }
}

// ───────────────────────────────
// ✅ Get all conversation contacts
// ───────────────────────────────
export async function getContacts(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId, q } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const sentTo = await Message.distinct("receiverId", { senderId: userId });
    const receivedFrom = await Message.distinct("senderId", { receiverId: userId });
    const partnerIds = Array.from(new Set([...sentTo, ...receivedFrom]));

    let filter: any = {};

    if (q && String(q).trim().length > 0) {
      const query = String(q).replace(/^@/, "");
      filter = {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { name: { $regex: query, $options: "i" } },
        ],
      };
    } else if (partnerIds.length > 0) {
      filter = { _id: { $in: partnerIds } };
    } else {
      return res.json({ documents: [] });
    }

    const users = await User.find(filter)
      .select("name username imageUrl _id")
      .lean();

    const contacts = await Promise.all(
      users.map(async (u) => {
        const lastMsg = await Message.findOne({
          $or: [
            { senderId: userId, receiverId: u._id },
            { senderId: u._id, receiverId: userId },
          ],
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          ...u,
          peerId: u._id,
          latestMessage: lastMsg
            ? {
                content: (lastMsg as any).text || (lastMsg as any).content || "",
                createdAt: lastMsg.createdAt,
              }
            : null,
        };
      })
    );

    res.json({ documents: contacts });
  } catch (err) {
    console.error("❌ getContacts error:", (err as Error).message);
    next(err);
  }
}

// ───────────────────────────────
// ✅ Delete a message
// ───────────────────────────────
export async function deleteMessage(req: Request, res: Response, next: NextFunction) {
  try {
    const { messageId } = req.params;
    if (!messageId) return res.status(400).json({ error: "messageId required" });

    await Message.findByIdAndDelete(messageId);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ deleteMessage error:", (err as Error).message);
    next(err);
  }
}
