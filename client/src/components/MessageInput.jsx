import { useRef, useState } from "react";
import { Image, Send, X, Smile, Reply } from "lucide-react";
import toast from "react-hot-toast";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import EmojiPicker from "emoji-picker-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);
  const { sendMessage, replyToMessage, setReplyToMessage } = useMessageStore();
  const { authUser } = useAuthStore();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;
    try {
      await sendMessage({ text: text.trim(), image: imagePreview });
      setText("");
      setImagePreview(null);
      setShowEmojiPicker(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  return (
    <div className="w-full">
      {/* Reply preview bar */}
      {replyToMessage && (
        <div className="mx-4 mb-1 px-3 py-2 bg-base-300 rounded-xl border-l-4 border-primary flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Reply size={14} className="text-primary shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-primary font-semibold">
                {replyToMessage.senderId === authUser._id ? "You" : "them"}
              </p>
              <p className="text-xs text-base-content/60 truncate">
                {replyToMessage.image && !replyToMessage.text
                  ? "📷 Photo"
                  : replyToMessage.text}
              </p>
            </div>
          </div>
          <button
            onClick={() => setReplyToMessage(null)}
            className="shrink-0 text-zinc-400 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="p-4">
        {imagePreview && (
          <div className="mb-3 flex items-center gap-2">
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
              />
              <button
                onClick={removeImage}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300 flex items-center justify-center"
                type="button"
              >
                <X className="size-3" />
              </button>
            </div>
          </div>
        )}

        {showEmojiPicker && (
          <div className="absolute bottom-24 left-4 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme="dark"
              emojiStyle="google"
              height={400}
              width={320}
            />
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <div className="flex-1 flex gap-2 items-center">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`btn btn-circle btn-sm ${showEmojiPicker ? "text-yellow-400" : "text-zinc-400"}`}
            >
              <Smile size={20} />
            </button>

            <input
              type="text"
              className="w-full input input-bordered rounded-lg input-sm sm:input-md"
              placeholder={
                replyToMessage ? "Type your reply..." : "Type a message..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onFocus={() => setShowEmojiPicker(false)}
            />

            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageChange}
            />

            <button
              type="button"
              className={`hidden sm:flex btn btn-circle btn-sm ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Image size={20} />
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-sm btn-circle"
            disabled={!text.trim() && !imagePreview}
          >
            <Send size={22} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
