import { useState, useRef, useEffect } from "react";
import React from "react";
import "./App.css";
import tts from "google-tts-api";
import axios from "axios";

type Message = {
  content: string;
  role: "user" | "assistant";
};

function ChatMessage(props) {
  if (props.message.role === "assistant") {
    return (
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
            A
          </div>
          <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl text-left">
            <div>{props.message.content}</div>
          </div>
        </div>
      </div>
    );
  } else if (props.message.role === "user") {
    return (
      <div className="col-start-6 col-end-13 p-3 rounded-lg">
        <div className="flex items-center justify-start flex-row-reverse">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-purple-500 flex-shrink-0">
            U
          </div>
          <div className="relative mr-3 text-sm bg-indigo-100 py-2 px-4 shadow rounded-xl text-left">
            <div>{props.message.content}</div>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <div className="col-start-1 col-end-8 p-3 rounded-lg">
        <div className="flex flex-row items-center">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-500 flex-shrink-0">
            A
          </div>
          <div className="relative ml-3 text-sm bg-white py-2 px-4 shadow rounded-xl text-left">
            <div>{props.message}</div>
          </div>
        </div>
      </div>
    );
  }
}

function Chat() {
  const [input, setInput] = useState<string>("");
  const [botState, setBotState] = useState<object>({});
  const [history, setHistory] = useState<Message[]>([
    // {
    //   content: "Hello!",
    //   role: "user",
    // },
    // {
    //   content: "Hey, how may I assist you?",
    //   role: "assistant",
    // },
  ]);
  const [query, setQuery] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [history]);

  async function chatRequest(history: Message[], botState: object) {
    try {
      const response = await fetch("http://localhost:4000/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: history, state: botState }),
      });
      const content: { botResponse: Message; newState: object } =
        await response.json();
      console.log(content);

      setHistory([...history, content.botResponse]);
      setBotState(content.newState);
    } catch (error) {
      console.error("Failed to send chat history:", error);
    }
  }
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const recognitionRef = useRef(null);
  const timeoutIdRef = useRef(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = new window.webkitSpeechRecognition();
    recognitionRef.current.continuous = true;
    recognitionRef.current.interimResults = true;
    recognitionRef.current.lang = "en-US";

    recognitionRef.current.onstart = () => {
      clearTimeout(timeoutIdRef.current); // Clear any existing timeout
    };

    recognitionRef.current.onresult = (event) => {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      setTranscript(transcript);

      clearTimeout(timeoutIdRef.current); // Clear any existing timeout
      timeoutIdRef.current = setTimeout(() => {
        sendTranscriptToServer(transcript);
      }, 1500); // Delay the function call by 1.5 seconds after the user stops speaking
    };

    recognitionRef.current.start();
  };

  const stopRecording = () => {
    setIsRecording(false);
    recognitionRef.current.stop();

    clearTimeout(timeoutIdRef.current); // Clear any existing timeout
  };

  const sendTranscriptToServer = (transcript) => {
    const newMessage: Message = {
      content: transcript,
      role: "user",
    };
    setQuery(transcript);
    setHistory([...history, newMessage]);
    setInput("");
    chatRequest([...history, newMessage], botState);
  };

  return (
    <div className="flex h-screen antialiased text-gray-800">
      <div className="flex flex-row h-full w-full overflow-x-hidden">
        <div className="flex flex-col flex-auto h-full p-6 ">
          <h1 className="heading">Acessories Bot</h1>
          <div className="flex flex-col flex-auto flex-shrink-0 rounded-2xl bg-gray-100 h-full p-4">
            <div className="flex flex-col h-full overflow-x-auto mb-4">
              <div className="grid grid-cols-12 gap-y-2">
                {history.map((message, idx) => (
                  <ChatMessage message={message} key={idx} />
                ))}

                {query ? (
                  <>
                    <div className="ml-2 mt-7">
                      <button className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0">
                        <a href={`/product/${query}`} target="blank">
                          Explore
                          <span className="mr-5">
                          <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                    </span>
                        </a>
                      </button>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>

              <div ref={chatEndRef}></div>
            </div>
            <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
              <div className="flex-grow ml-4">
                <div className="relative w-full">
                  <input
                    type="text"
                    className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 h-10"
                    value={input}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setInput(e.target.value);
                      setQuery(e.target.value);
                    }}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === "Enter") {
                        const newMessage: Message = {
                          content: input,
                          role: "user",
                        };
                        setHistory([...history, newMessage]);
                        setInput("");
                        chatRequest([...history, newMessage], botState);
                      }
                    }}
                  />
                </div>
              </div>
              <div className="ml-4">
                <button
                  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                  onClick={() => {
                    const newMessage: Message = {
                      content: input,
                      role: "user",
                    };
                    setHistory([...history, newMessage]);
                    setInput("");
                    chatRequest([...history, newMessage], botState);
                  }}
                >
                  <span>Send</span>
                  <span className="ml-2">
                    <svg
                      className="w-4 h-4 transform rotate-45 -mt-px"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      ></path>
                    </svg>
                  </span>
                </button>
              </div>
              <div className="ml-4">
                <button
                  className="flex items-center justify-center bg-indigo-500 hover:bg-indigo-600 rounded-xl text-white px-4 py-1 flex-shrink-0"
                  onClick={isRecording ? stopRecording : startRecording}
                >
                  {isRecording ? "Stop Recording" : "Start Recording"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Chat;
