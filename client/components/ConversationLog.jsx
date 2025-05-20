import { useEffect, useState } from "react";

export default function ConversationLog({ isSessionActive, events }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!events || events.length === 0) return;

    const conversationMessages = [];
    events.forEach((event) => {
      // User speaking - input transcription
      if (
        event.type ===
          "conversation.item.input_audio_transcription.completed" &&
        event.transcript
      ) {
        conversationMessages.push({
          id: event.event_id,
          type: "user",
          text: event.transcript,
          timestamp: event.timestamp,
        });
      }
      // Server response - output transcription
      else if (
        event.type === "response.audio_transcript.done" &&
        event.transcript
      ) {
        conversationMessages.push({
          id: event.event_id,
          type: "assistant",
          text: event.transcript,
          timestamp: event.timestamp,
        });
      }
    });

    setMessages(conversationMessages);
  }, [events]);

  const downloadConversation = () => {
    if (messages.length === 0) return;

    const formattedText = messages
      .map(
        (msg) =>
          `[${msg.timestamp}] ${msg.type === "user" ? "You" : "Assistant"}: ${
            msg.text
          }`,
      )
      .join("\n\n");

    const blob = new Blob([formattedText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `conversation-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <section className="h-full w-full flex flex-col gap-4">
      <div className="h-full bg-gray-50 rounded-md p-4 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">Conversation Log</h2>
          {messages.length > 0 && (
            <button
              onClick={downloadConversation}
              className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center"
            >
              Download
            </button>
          )}
        </div>
        {messages.length === 0 ? (
          <div className="text-gray-500 text-center">
            No conversation yet...
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-2 rounded-md ${
                  message.type === "user"
                    ? "bg-blue-100 ml-auto"
                    : "bg-green-100"
                } max-w-[80%]`}
              >
                <div className="text-xs text-gray-500 mb-1">
                  {message.type === "user" ? "You" : "Assistant"} •{" "}
                  {message.timestamp}
                </div>
                <div>{message.text}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
