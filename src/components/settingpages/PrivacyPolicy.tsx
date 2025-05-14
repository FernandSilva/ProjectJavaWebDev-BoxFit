import { FaShieldAlt } from "react-icons/fa";

const PrivacyPolicy = () => (
  <div className="w-full p-4 md:p-8">
    <h2 className="text-2xl md:text-3xl font-bold mb-4 flex items-center gap-2">
      <FaShieldAlt className="text-green-600" /> Privacy Policy
    </h2>
    <p className="text-gray-700 text-sm md:text-base leading-relaxed">
      We take your privacy seriously. GrowBuddy does not share your personal information without your consent.
      All data collected is used solely to improve your experience on the platform and is stored securely.
    </p>
    <p className="mt-4 text-gray-700 text-sm md:text-base leading-relaxed">
      If you have questions about how your data is stored or processed, feel free to reach out via the contact form.
    </p>
  </div>
);

export default PrivacyPolicy;