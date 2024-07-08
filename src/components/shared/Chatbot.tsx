import { useUserContext } from "@/context/AuthContext";
import { useState } from "react";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
// import { openai } from '@/lib/openai';  // Uncomment and adjust according to your actual import

const Chatbot = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<any>([]);
  const { user } = useUserContext();
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
    <div className={`chatbot-container ${isOpen ? "open" : ""}`} >
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
        <div className="w-[100%] h-[5px] bg-green-400"></div>
        <div className="flex justify-between  p-[10px] border-b border-solid">
          <div>
            <p className="text-[#100f0f] text-[12px] font-semibold">
              GrowBuddy Assistant
            </p>
          </div>
          <div>
            <IoMdClose onClick={handleBackClick} />
          </div>
        </div>
        <div className="messages">
          {messages.map((message: any) => (
            // <div key={index} className={`message ${msg.role}`}>
            //   {msg.content}
            // </div>
            <div
              key={message.$id}
              className={`${message.userId === user.id ? "flex-row-reverse justify-start" : " flex-row"} flex items-center w-full gap-2`}
            >
              {/* <img
                       src={user?.imageUrl}
                       className="w-6 h-6 rounded-full"
                     /> */}
              <div className="message !py-[5px]">
                <span className="text-[12px] ">{message.content}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center py-[15px] border-t border-solid bg-white gap-2 px-[10px]">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Ask me anything..."
            className="border border-solid  py-[2px] pl-[10px] rounded-[10px] w-[100%]"
          />
          <IoIosSend className="text-[20px]" onClick={sendMessage} />
        </div>
        {/* <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "10px 20px",
          }}
        >
          <button className="hover:bg-green-100 border border-solid border-gray-300 pt-[6px] pb-[6px]">
            Send
          </button>
          <button
            
            className="hover:bg-green-100 border border-solid border-gray-300 pt-[6px] pb-[6px]"
          >
            Back
          </button>
        </div> */}
      </div>
    </div>
  );
};

export default Chatbot;
