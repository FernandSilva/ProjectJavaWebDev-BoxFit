import { useState } from "react";
// import { openai } from '@/lib/openai';  // Uncomment and adjust according to your actual import

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const [isOpen, setIsOpen] = useState(false); // State to handle the chatbox visibility

  const toggleChat = () => setIsOpen(!isOpen); // Function to toggle chat visibility

  const handleInputChange = (e: any) => {
    setInput(e.target.value);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", content: input };
    setMessages([...messages, userMessage]);

    // This part simulates getting a response from a chat service like OpenAI
    try {
      // const response = await openai.createCompletion({
      //   model: "text-davinci-002",
      //   prompt: input,
      //   max_tokens: 150,
      // });
      // Simulated delay and response for example
      setTimeout(() => {
        const botMessage = { role: "bot", content: `Echo: ${input}` }; // Simulated response
        setMessages((prev: any) => [...prev, userMessage, botMessage]);
      }, 1000);
    } catch (error) {
      console.error("Error calling OpenAI API:", error);
      const errorMessage = {
        role: "bot",
        content: "Error communicating with the chat service.",
      };
      setMessages((prev: any) => [...prev, userMessage, errorMessage]);
    }

    setInput("");
  };

  const handleBackClick = () => {
    setIsOpen(false); // Closes the chatbox
  };

  return (
    <div className={`chatbot-container ${isOpen ? "open" : ""}`}>
      <div className="chatbot-trigger" onClick={toggleChat}>
        <img
          src="/assets/icons/GrowB.jpeg"
          alt="Chatbot"
          style={{
            width: "50px", // Adjust the size as needed
            height: "50px", // Adjust the size as needed
            objectFit: "cover", // Ensures the image covers the element completely
            cursor: "pointer", // Changes the cursor to pointer on hover
            transition: "transform 0.3s ease", // Smooth transition for hover effect
            borderRadius: "50%", // Makes the image edges fully rounded
          }}
        />
      </div>
      <div className="chatbox">
        <div className="messages">
          {messages.map((msg: any, index: any) => (
            <div key={index} className={`message ${msg.role}`}>
              {msg.content}
            </div>
          ))}
        </div>
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyPress={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask me anything..."
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: 20,
          }}
        >
          <button onClick={sendMessage}>Send</button>
          <button onClick={handleBackClick}>Back</button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
