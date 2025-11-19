// src/_root/pages/UsersList.tsx
import { Input } from "@/components/ui";
import { useUserContext } from "@/context/AuthContext";
import {
  useContacts,
  useGetNotifications,     // ✅ corrected import
  useMarkNotificationAsRead,
} from "@/lib/react-query/queries";
import { getUserById } from "@/lib/appwrite/api";
import { multiFormatDateString } from "@/lib/utils";
import { User } from "@/types";
import { useState, useEffect, useMemo } from "react";

type EnrichedUser = User & {
  latestMessage?: { content: string; timestamp: string };
};

function UsersList({
  onSelectUser,
  selectedUser,
  setSteps,
}: {
  onSelectUser: (user: User) => void;
  selectedUser: User | null;
  setSteps?: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [enriched, setEnriched] = useState<EnrichedUser[]>([]);
  const { user } = useUserContext();

  // Contacts
  const { data: contactsRaw, isLoading } = useContacts(
    user?.id as string,
    searchQuery
  );

  const contacts: any[] = useMemo(() => {
    if (Array.isArray(contactsRaw)) return contactsRaw;
    if (contactsRaw?.documents && Array.isArray(contactsRaw.documents)) {
      return contactsRaw.documents;
    }
    return [];
  }, [contactsRaw]);

  const contactsSignature = useMemo(() => {
    try {
      return JSON.stringify(
        contacts.map((c) => ({
          peerId: c.peerId ?? c.$id ?? c.id ?? "",
          lmId:
            c.lastMessage?.$id ??
            c.latestMessage?.$id ??
            c.lastMessage?.createdAt ??
            c.latestMessage?.createdAt ??
            c.lastMessage?.timestamp ??
            c.latestMessage?.timestamp ??
            "",
          lmContent: c.lastMessage?.content ?? c.latestMessage?.content ?? "",
        }))
      );
    } catch {
      return String(contacts.length);
    }
  }, [contacts]);

  // Notifications  ✅ corrected hook
  const {
    data: notifications,
    refetch: refetchNotifications,
  } = useGetNotifications(user?.id as string);

  const { mutate: markNotificationAsRead } = useMarkNotificationAsRead();

  const unreadUserIds = useMemo(() => {
    if (!notifications?.documents) return new Set<string>();
    return new Set(
      notifications.documents
        .filter((n) => n.type === "message" && !n.isRead)
        .map((n) => n.senderId as string)
    );
  }, [notifications]);

  // Enrich contacts
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (contacts.length === 0) {
        if (!cancelled) setEnriched([]);
        return;
      }

      const looksLikeUserObjs =
        "username" in contacts[0] || "name" in contacts[0] || "imageUrl" in contacts[0];

      if (looksLikeUserObjs) {
        const normalized = contacts.map((it) => {
          const lm = it.latestMessage || it.lastMessage;
          const lmObj =
            lm && typeof lm === "object"
              ? {
                  content: lm.content ?? "",
                  timestamp:
                    lm.$createdAt ??
                    lm.createdAt ??
                    lm.timestamp ??
                    "",
                }
              : undefined;
          return { ...it, latestMessage: lmObj };
        });
        if (!cancelled) setEnriched(normalized);
        return;
      }

      const peerIds: string[] = Array.from(
        new Set(contacts.map((c) => String(c.peerId)).filter(Boolean))
      );

      try {
        const userDocs = await Promise.all(
          peerIds.map(async (id) => {
            try {
              return await getUserById(id);
            } catch {
              return null;
            }
          })
        );

        const byId = new Map<string, any>();
        userDocs.forEach((doc, idx) => {
          if (doc?.$id) byId.set(peerIds[idx], doc);
        });

        const enrichedList: EnrichedUser[] = contacts
          .map((c) => {
            const doc = byId.get(String(c.peerId));
            if (!doc) return null;

            const lm = c.lastMessage || c.latestMessage;
            const latestMessage =
              lm && typeof lm === "object"
                ? {
                    content: lm.content ?? "",
                    timestamp:
                      lm.$createdAt ??
                      lm.createdAt ??
                      lm.timestamp ??
                      "",
                  }
                : undefined;

            return { ...doc, latestMessage } as EnrichedUser;
          })
          .filter(Boolean) as EnrichedUser[];

        if (!cancelled) setEnriched(enrichedList);
      } catch {
        if (!cancelled) setEnriched([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [contactsSignature]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return enriched.filter((u) => {
      const uname = (u.username || "").toLowerCase();
      const name = (u.name || "").toLowerCase();
      return uname.includes(q) || name.includes(q);
    });
  }, [searchQuery, enriched]);

  const chatUsers = useMemo(
    () => enriched.filter((u) => !!u.latestMessage),
    [enriched]
  );

  function handleSelectUser(u: EnrichedUser) {
    onSelectUser(u);
    if (setSteps) setSteps(1);

    const notification = notifications?.documents?.find(
      (n) => n.senderId === u.$id && !n.isRead && n.type === "message"
    );

    if (notification) {
      markNotificationAsRead(notification.$id, {
        onSuccess: () => refetchNotifications(),
      });
    }
  }

  function renderUserItem(u: EnrichedUser) {
    const hasUnreadMessage = unreadUserIds.has(u.$id);

    return (
      <div
        key={u.$id}
        onClick={() => handleSelectUser(u)}
        className={`user-item ${
          u.$id === selectedUser?.$id ? "!bg-gray-200" : "bg-white"
        } flex items-center gap-4 p-2 border-b cursor-pointer`}
      >
        <img
          src={u.imageUrl || "/assets/icons/profile-placeholder.svg"}
          className="w-8 h-8 rounded-full"
          alt={`Profile of ${u.username || u.name || "user"}`}
        />
        <div className="w-full">
          <span
            className={`font-semibold ${
              hasUnreadMessage ? "text-black" : "text-gray-800"
            }`}
          >
            {u.username || u.name || "Unknown"}
          </span>

          <div
            className={`flex justify-between w-full text-xs pt-1 gap-2 ${
              hasUnreadMessage ? "font-bold" : "font-normal"
            }`}
          >
            <span className="text-ellipsis max-w-[120px] overflow-hidden whitespace-nowrap">
              {u.latestMessage?.content ||
                (hasUnreadMessage ? "New message..." : "")}
            </span>
            <span className="text-[10px]">
              {u.latestMessage?.timestamp
                ? multiFormatDateString(u.latestMessage.timestamp)
                : ""}
            </span>
          </div>
        </div>
        <img
          src={`/assets/icons/${hasUnreadMessage ? "notify.svg" : "notify1.svg"}`}
          alt="Message Notification"
          className="w-5 h-5"
        />
      </div>
    );
  }

  const list = searchQuery ? searchResults : chatUsers;

  return (
    <div className="users-list h-[84vh] sm:h-auto !w-[100%] lg:!w-[30%]">
      <div className="flex items-center py-4 border-b justify-between">
        <h2 className="font-bold text-2xl">Chats</h2>
      </div>

      <div className="search-section py-4 border-b">
        <Input
          placeholder="Search for users"
          className="shad-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="p-4 text-gray-500">Loading users...</div>
      ) : searchQuery && list.length === 0 ? (
        <div className="p-4 text-gray-500">
          No users found for "{searchQuery}".
        </div>
      ) : !searchQuery && list.length === 0 ? (
        <div className="p-4 text-gray-500">No open chats yet.</div>
      ) : (
        <div>{list.map(renderUserItem)}</div>
      )}
    </div>
  );
}

export default UsersList;
