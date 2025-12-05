import { useMemo, useState } from "react";
import {
  FaBookOpen,
  FaCalendarAlt,
  FaShieldAlt,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaEnvelope,
} from "react-icons/fa";
import { BiSupport } from "react-icons/bi";
import { motion } from "framer-motion";

/* ---------------------------------------------------------
   Helpers: build month grid and map sessions by weekday
--------------------------------------------------------- */
type DayCell = {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  label: number;
};

function sameYMD(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function buildMonthMatrix(year: number, monthIdx0: number): DayCell[] {
  const first = new Date(year, monthIdx0, 1);
  const last = new Date(year, monthIdx0 + 1, 0);
  const startWeekday = (first.getDay() + 6) % 7; // Monday=0
  const days: DayCell[] = [];

  for (let i = 0; i < startWeekday; i++) {
    const d = new Date(year, monthIdx0, 1 - (startWeekday - i));
    days.push({ date: d, inMonth: false, isToday: sameYMD(d, new Date()), label: d.getDate() });
  }
  for (let d = 1; d <= last.getDate(); d++) {
    const curr = new Date(year, monthIdx0, d);
    days.push({ date: curr, inMonth: true, isToday: sameYMD(curr, new Date()), label: d });
  }
  const remainder = 42 - days.length;
  for (let i = 1; i <= remainder; i++) {
    const d = new Date(year, monthIdx0 + 1, i);
    days.push({ date: d, inMonth: false, isToday: sameYMD(d, new Date()), label: d.getDate() });
  }

  return days;
}

/* ---------------------------------------------------------
   Training sessions by weekday
--------------------------------------------------------- */
const SESSION_MAP: Record<number, { title: string; color: string }> = {
  1: { title: "Boxing Fundamentals", color: "bg-green-100 border-green-400 text-green-800" },
  3: { title: "Cardio Conditioning", color: "bg-blue-100 border-blue-400 text-blue-800" },
  5: { title: "Sparring & Techniques", color: "bg-rose-100 border-rose-400 text-rose-800" },
  6: { title: "Open Gym & Pads", color: "bg-amber-100 border-amber-400 text-amber-900" },
};

/* ---------------------------------------------------------
   Calendar component (responsive)
--------------------------------------------------------- */
function MonthCalendar({
  year,
  monthIdx0,
  title,
}: {
  year: number;
  monthIdx0: number;
  title: string;
}) {
  const data = useMemo(() => buildMonthMatrix(year, monthIdx0), [year, monthIdx0]);
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <div className="overflow-x-auto md:overflow-x-visible">
        <div className="px-3 py-3 min-w-[620px] md:min-w-0">
          <div className="grid grid-cols-7 gap-1 text-[11px] md:text-xs text-gray-500 mb-1">
            {weekdays.map((w) => (
              <div key={w} className="text-center py-1 font-semibold">
                {w}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {data.map((cell, idx) => {
              const dow = (cell.date.getDay() + 6) % 7; // Monday=0
              const session = SESSION_MAP[dow];
              return (
                <div
                  key={idx}
                  className={[
                    "relative flex flex-col justify-start items-center rounded-md border",
                    "md:h-24 h-16 overflow-hidden text-center p-1",
                    cell.inMonth ? "bg-white" : "bg-gray-50",
                    session ? "border-green-400" : "border-gray-200",
                  ].join(" ")}
                >
                  <div
                    className={[
                      "text-[11px] md:text-xs font-medium w-full text-right pr-1",
                      cell.isToday ? "text-green-600" : "text-gray-700",
                    ].join(" ")}
                  >
                    {cell.label}
                  </div>

                  {session && cell.inMonth && (
                    <div
                      className={`text-[9px] md:text-[11px] mt-auto mb-1 border rounded px-1 py-0.5 truncate w-full ${session.color}`}
                    >
                      {session.title}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px] md:text-xs text-gray-600">
            {Object.values(SESSION_MAP).map((s) => (
              <span
                key={s.title}
                className="inline-flex items-center gap-1 border px-2 py-0.5 rounded"
              >
                <span className={`inline-block w-3 h-3 rounded ${s.color.split(" ")[0]}`} />
                {s.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------
   Main Settings Page
--------------------------------------------------------- */
const Settings = () => {
  const [tab, setTab] = useState<"schedule" | "contact" | "about" | "privacy">("schedule");
  const [month, setMonth] = useState<"October 2025" | "November 2025" | "December 2025">(
    "October 2025"
  );

  const months = [
    { label: "October 2025", year: 2025, idx: 9 },
    { label: "November 2025", year: 2025, idx: 10 },
    { label: "December 2025", year: 2025, idx: 11 },
  ] as const;
  const current = months.find((m) => m.label === month) || months[0];

  return (
    <div className="flex flex-col w-full min-h-screen bg-gray-50">
      {/* Tabs */}
      <div className="sticky top-0 z-10 bg-white border-b">
        <div className="max-w-6xl mx-auto px-3 md:px-6">
          <div className="flex md:flex-row flex-col gap-2 py-2">
            {[
              { key: "schedule", label: "Training Schedule", icon: <FaCalendarAlt /> },
              { key: "contact", label: "Contact & Team", icon: <BiSupport /> },
              { key: "about", label: "About Us", icon: <FaBookOpen /> },
              { key: "privacy", label: "Privacy Policy", icon: <FaShieldAlt /> },
            ].map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border text-sm ${
                  tab === t.key
                    ? "bg-green-600 text-white border-green-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span className="font-medium">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-3 md:px-6 py-6 pb-[100px] md:pb-10 overflow-y-auto">
        {/* Schedule Tab */}
        {tab === "schedule" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FaCalendarAlt /> Training Schedule
              </h2>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Select Month:</label>
                <select
                  value={month}
                  onChange={(e) =>
                    setMonth(e.target.value as "October 2025" | "November 2025" | "December 2025")
                  }
                  className="border border-gray-300 rounded-md px-2 py-1 text-sm bg-white"
                >
                  {months.map((m) => (
                    <option key={m.label} value={m.label}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <MonthCalendar year={current.year} monthIdx0={current.idx} title={current.label} />

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  title: "Boxing Fundamentals",
                  day: "Monday",
                  time: "6:00 PM – 7:30 PM",
                  coach: "Coach Marcus Hill",
                  image:
                    "/assets/images/BF4.png",
                  description:
                    "Perfect for beginners learning stance, defense, and footwork techniques with guided drills.",
                },
                {
                  title: "Cardio Conditioning",
                  day: "Wednesday",
                  time: "6:00 PM – 7:30 PM",
                  coach: "Coach Taylor Reed",
                  image:
                    "/assets/images/BF5.png",
                  description:
                    "High-intensity intervals designed to build explosive endurance and improve stamina.",
                },
                {
                  title: "Sparring & Techniques",
                  day: "Friday",
                  time: "6:00 PM – 8:00 PM",
                  coach: "Coach Marcus Hill",
                  image:
                    "/assets/images/BF7.jpg",
                  description:
                    "Controlled sparring sessions focused on ring strategy, timing, and defense tactics.",
                },
                {
                  title: "Open Gym & Pads",
                  day: "Saturday",
                  time: "10:00 AM – 11:30 AM",
                  coach: "Coach Taylor Reed",
                  image:
                    "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=800&auto=format&fit=crop",
                  description:
                    "Weekend open session for mitt work, bag rounds, and personalized technical focus.",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="bg-white rounded-xl border shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <img src={s.image} alt={s.title} className="w-full h-40 md:h-48 object-cover" />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{s.title}</h3>
                    <div className="mt-1 text-sm text-gray-700">
                      <p>
                        <span className="font-medium">Day:</span> {s.day}
                      </p>
                      <p>
                        <span className="font-medium">Time:</span> {s.time}
                      </p>
                      <p>
                        <span className="font-medium">Coach:</span> {s.coach}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{s.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Contact Tab */}
        {tab === "contact" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact & Team</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="text-xl font-semibold mb-3">📍 BoxFit Gym</h3>
                <div className="flex flex-col gap-2 text-gray-700 text-sm">
                  <p className="flex items-center gap-2">
                    <FaMapMarkerAlt className="text-green-600" /> 145 King Street, Dublin, Ireland
                  </p>
                  <p className="flex items-center gap-2">
                    <FaPhoneAlt className="text-green-600" /> +353 (0)1 555 0199
                  </p>
                  <p className="flex items-center gap-2">
                    <FaEnvelope className="text-green-600" /> contact@boxfitgym.ie
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm p-5">
                <h3 className="text-xl font-semibold mb-3">🥊 Head Coach</h3>
                <div className="flex items-center gap-4">
                  <img
                    src="https://images.unsplash.com/photo-1600431521340-491eca880813?q=80&w=240&auto=format&fit=crop"
                    alt="Head Coach"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Coach Marcus Hill</p>
                    <p className="text-sm text-gray-500">Head Boxing Coach</p>
                    <p className="text-sm text-gray-600">marcus.hill@boxfitgym.ie</p>
                    <p className="text-sm text-gray-600">+353 (0)85 667 1203</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border shadow-sm p-5 md:col-span-2">
                <h3 className="text-xl font-semibold mb-3">🏋️‍♂️ Personal Trainer</h3>
                <div className="flex items-center gap-4">
                  <img
                    src="/assets/images/BF4.png"
                    alt="Trainer"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-800">Alex “The Hammer” Nolan</p>
                    <p className="text-sm text-gray-500">Head Strength & Conditioning Coach</p>
                    <p className="text-sm text-gray-600">alex.nolan@boxfitgym.ie</p>
                    <p className="text-sm text-gray-600">+353 (0)85 998 4412</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* About Tab */}
        {tab === "about" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">About BoxFit</h2>
            <p className="text-gray-700 max-w-2xl">
              BoxFit is a premier boxing and conditioning gym focused on strength, endurance, and
              mental discipline. Our mission is to build a connected boxing community that trains
              hard and supports one another—both inside and outside the ring.
            </p>
            <p className="text-gray-700 max-w-2xl mt-3">
              Our state-of-the-art facility offers multiple training programs designed by certified
              coaches for all fitness levels.
            </p>
          </motion.div>
        )}

        {/* Privacy Tab */}
        {tab === "privacy" && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Privacy Policy</h2>
            <p className="text-sm text-gray-700 max-w-xl">
              BoxFit respects the confidentiality of our members. We never share your information
              with third parties and ensure your data remains secure in compliance with GDPR
              standards.
            </p>
            <p className="text-sm text-gray-700 max-w-xl mt-2">
              For any privacy inquiries, please reach out to{" "}
              <span className="text-green-600 font-semibold">support@boxfitgym.ie</span>.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default Settings;
