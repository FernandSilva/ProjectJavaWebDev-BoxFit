import { useState } from "react";
import { Input, Textarea, Button } from "@/components/ui";
import { BiSupport } from "react-icons/bi";
import { submitContactRequest } from "@/lib/appwrite/api";
import { appwriteConfig } from "@/lib/appwrite/config"; // ✅ Add this import to check env mapping

const ContactUs = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    console.log("📤 Submitting contact form with data:", form);
    console.log("⚙️ Appwrite Config:", appwriteConfig);

    try {
      const result = await submitContactRequest(form);
      console.log("✅ Document created in Appwrite:", result);
      setStatus("Message sent successfully!");
      setForm({ name: "", email: "", message: "" });
    } catch (err: any) {
      console.error("❌ Submission failed:", err?.message || err);
      setStatus("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full p-4 md:p-8">
      <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
        <BiSupport className="text-green-600" /> Contact Us
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-xl">
        <Input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <Input
          type="email"
          name="email"
          placeholder="Your Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <Textarea
          name="message"
          placeholder="Your Message"
          value={form.message}
          onChange={handleChange}
          required
        />
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white py-2 px-4 rounded"
        >
          {loading ? "Sending..." : "Send Message"}
        </Button>
        {status && <p className="text-sm mt-2">{status}</p>}
      </form>
    </div>
  );
};

export default ContactUs;
