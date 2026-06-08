import React, { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiChevronDown,
  FiMessageCircle,
  FiCopy,
  FiThumbsUp,
  FiThumbsDown,
  FiRefreshCw,
  FiShare,
  FiMenu,
  FiCheck,
  FiBook,
  FiImage,
  FiPlus,
  FiFileText,
  FiHeart,
  FiX,
  FiMessageSquare,
  FiCalendar,
  FiUser,
  FiHome,
  FiCreditCard,
} from "react-icons/fi";
import { AiFillLike, AiFillDislike } from "react-icons/ai";
import { useTranslation } from "../translations";
import catImg from "../assets/ang.png";
import { FiVolume2, FiVolumeX } from "react-icons/fi";


const ChatInterface = ({
  currentChat,
  onSendMessage,
  isSidebarOpen,
  onToggleSidebar,
  language,
  onLanguageChange,
  isAiTyping = false,
  setIsAiTyping,
  onRegenerateResponse,
  onOpenSearch,
  onNewChat,
  isTemporaryMode = false,
  onToggleTemporaryMode,
  audioRef,
  isMusicPlaying,
  setIsMusicPlaying,
}) => {
  const { t } = useTranslation(language);
  const [inputValue, setInputValue] = useState("");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState("MeowGPT");
  const [messageRatings, setMessageRatings] = useState({});
  const [copiedMessages, setCopiedMessages] = useState({});
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isAttachDropdownOpen, setIsAttachDropdownOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState([]);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const dropdownRef = useRef(null);
  const attachDropdownRef = useRef(null);
  const imageInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const models = [
    {
      id: "gpt-4",
      name: t("models.MeowGPT"),
      description: t("modelDescriptions.MeowGPT"),
    },
  ];

  const languages = [
    { id: "en", name: t("languages.en") },
    { id: "id", name: t("languages.id") },
    { id: "meow", name: t("languages.meow") },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsModelDropdownOpen(false);
      }
      if (attachDropdownRef.current && !attachDropdownRef.current.contains(event.target)) {
        setIsAttachDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleFileSelect = (type) => (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((file) => ({
      type,
      name: file.name,
      url: URL.createObjectURL(file),
      size: file.size,
    }));
    setAttachedFiles((prev) => [...prev, ...newAttachments]);
    e.target.value = "";
  };

  const removeAttachment = (index) => {
    setAttachedFiles((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].url);
      updated.splice(index, 1);
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim() || attachedFiles.length > 0) {
      const message = {
        id: Date.now(),
        content: inputValue,
        sender: "user",
        timestamp: Date.now(),
        attachments: attachedFiles.length > 0 ? [...attachedFiles] : undefined,
      };

      onSendMessage(message);
      setInputValue("");
      setAttachedFiles([]);

      if (setIsAiTyping) {
        setIsAiTyping(true);
      }
    }
  };

  const handleSuggestionClick = (text) => {
    const message = {
      id: Date.now(),
      content: text,
      sender: "user",
      timestamp: Date.now(),
    };

    onSendMessage(message);

    if (setIsAiTyping) {
      setIsAiTyping(true);
    }
  };

  const suggestions = [
    { icon: <FiUser />, text: t("suggestionMousePoem") },
    { icon: <FiCalendar />, text: t("suggestionCatsPurr") },
    { icon: <FiBook />, text: t("suggestionGaleri") },
    { icon: <FiCreditCard />, text: t("suggestionUcapan") },
  ];

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const scrollHeight = textarea.scrollHeight;
      textarea.style.height = Math.min(scrollHeight, 200) + "px";
      textarea.style.overflowY = scrollHeight > 200 ? "auto" : "hidden";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const handleCopyMessage = (content, messageId) => {
    navigator.clipboard.writeText(content);

    setCopiedMessages((prev) => ({
      ...prev,
      [messageId]: true,
    }));

    setTimeout(() => {
      setCopiedMessages((prev) => ({
        ...prev,
        [messageId]: false,
      }));
    }, 2000);
  };

  const handleRegenerateResponse = (messageId) => {
    if (onRegenerateResponse) {
      onRegenerateResponse(messageId);
    }
  };

  const handleShareMessage = (content) => {
    if (navigator.share) {
      navigator.share({
        title: "MeowGPT",
        text: content,
      });
    } else {
      navigator.clipboard.writeText(content);
    }
  };

  const handleRateMessage = (messageId, rating) => {
    setMessageRatings((prev) => {
      const newRatings = { ...prev };
      if (newRatings[messageId] === rating) {
        delete newRatings[messageId];
      } else {
        newRatings[messageId] = rating;
      }
      return newRatings;
    });
  };

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance < -minSwipeDistance && !isSidebarOpen) {
      onToggleSidebar();
    }

    if (distance > minSwipeDistance && isSidebarOpen) {
      onToggleSidebar();
    }
  };

  const handleInputFocus = () => {
    if (window.innerWidth <= 768 && isSidebarOpen) {
      onToggleSidebar();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const [guestName, setGuestName] = useState("");

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  const name = params.get("to");

  if (name) {
    setGuestName(decodeURIComponent(name));
  }
}, []);

  return (
    <div
      className={`chat-interface ${!isSidebarOpen ? "sidebar-closed" : ""} ${!currentChat || currentChat.messages.length === 0 ? "is-empty" : ""}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="chat-header">
        <div className="header-left">
          <button
            className="hamburger-menu mobile-only"
            onClick={onToggleSidebar}
            title={t("toggleMenu")}
          >
            <FiMenu size={20} />
          </button>
          <div className="chatgpt-logo">
            ChatF&A
          </div>
          <FiChevronDown size={16} />
        </div>

        <div className="header-right">
          <button
            className={`temporary-chat-btn${isTemporaryMode ? " active" : ""}`}
            title={t("temporaryChat")}
            onClick={onToggleTemporaryMode}
          >
            <FiMessageCircle size={16} />
          </button>
        </div>
      </div>

      {isTemporaryMode && (
        <div className="temporary-chat-banner">
          <FiMessageCircle size={14} />
          <span>
            {t("temporaryChatNotice")}
          </span>
        </div>
      )}

      <div className="chat-messages">
        {!currentChat || currentChat.messages.length === 0 ? (
          <div className="welcome-screen">
            <img
              src={catImg}
              className="welcome-cat"
            />
            <h1 className="welcome-title">{t("welcomeTitle")}</h1>
            <p className="welcome-subtitle">{t("welcomeSubtitle")}</p>
            {guestName && (
              <p className="welcome-guest-name">{guestName}</p>
            )}
          </div>
        ) : (
          <>
            {currentChat.messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                {message.sender === "user" ? (
                  <div className="user-message-container">
                    <div className="user-message-bubble">
                      {message.attachments?.map((att, i) =>
                        att.type === "image" ? (
                          <img
                            key={i}
                            src={att.url}
                            alt={att.name}
                            className="message-image"
                          />
                        ) : (
                          <div key={i} className="message-document-chip">
                            <FiFileText size={14} />
                            <div className="message-document-info">
                              <span className="message-document-name">{att.name}</span>
                              <span className="message-document-size">{formatFileSize(att.size)}</span>
                            </div>
                          </div>
                        )
                      )}
                      {message.content && (
                        <div className="message-text">{message.content}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="message-container">
                    <div className="message-content-wrapper">
                      {message.isTyping ? (
                        <div className="typing-dots">
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                          <div className="typing-dot"></div>
                        </div>
                      ) : (
                        <>
                          {message.accounts ? (
                            <div className="gift-accounts">
                              {message.accounts.map((account, index) => (
                                <div key={index} className="gift-account">
                                  <img
                                    src={account.image}
                                    alt="rekening"
                                    className="chat-image"
                                  />

                                  <div
                                    className="message-content"
                                    dangerouslySetInnerHTML={{
                                      __html: account.content,
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          ) : (
                            <>
                              {message.image && (
                                <img
                                  src={message.image}
                                  alt="response"
                                  className="chat-image"
                                />
                              )}

                              <div
                                className="message-content"
                                dangerouslySetInnerHTML={{ __html: message.content }}
                              />
                            </>
                          )}
                        </>
                      )}
                      {!message.isTyping && (
                        <div className="message-actions">
                          <button
                            className={`action-btn ${
                              copiedMessages[message.id] ? "copy-success" : ""
                            }`}
                            onClick={() =>
                              handleCopyMessage(message.content, message.id)
                            }
                            title={
                              copiedMessages[message.id]
                                ? t("copied")
                                : t("copy")
                            }
                          >
                            {copiedMessages[message.id] ? (
                              <FiCheck size={14} />
                            ) : (
                              <FiCopy size={14} />
                            )}
                          </button>
                          <button
                            className={`action-btn ${
                              messageRatings[message.id] === "thumbsUp"
                                ? "active"
                                : ""
                            }`}
                            title={t("goodResponse")}
                            onClick={() =>
                              handleRateMessage(message.id, "thumbsUp")
                            }
                          >
                            {messageRatings[message.id] === "thumbsUp" ? (
                              <AiFillLike size={14} />
                            ) : (
                              <FiThumbsUp size={14} />
                            )}
                          </button>
                          <button
                            className={`action-btn ${
                              messageRatings[message.id] === "thumbsDown"
                                ? "active"
                                : ""
                            }`}
                            title={t("badResponse")}
                            onClick={() =>
                              handleRateMessage(message.id, "thumbsDown")
                            }
                          >
                            {messageRatings[message.id] === "thumbsDown" ? (
                              <AiFillDislike size={14} />
                            ) : (
                              <FiThumbsDown size={14} />
                            )}
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleRegenerateResponse(message.id)}
                            title={t("regenerate")}
                          >
                            <FiRefreshCw size={14} />
                          </button>
                          <button
                            className="action-btn"
                            onClick={() => handleShareMessage(message.content)}
                            title={t("share")}
                          >
                            <FiShare size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isAiTyping && (
              <div className="typing-indicator">
                <div className="message-container">
                  <div className="typing-dots">
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                    <div className="typing-dot"></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <div className="chat-input-container">
        <div className="chat-input-wrapper">
          <form onSubmit={handleSubmit}>
            {attachedFiles.length > 0 && (
              <div className="attachment-preview">
                {attachedFiles.map((file, i) => (
                  <div key={i} className="attachment-preview-item">
                    {file.type === "image" ? (
                      <img
                        src={file.url}
                        alt={file.name}
                        className="attachment-preview-thumb"
                      />
                    ) : (
                      <div className="attachment-preview-doc">
                        <FiFileText size={20} />
                        <span className="attachment-preview-name">{file.name}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      className="attachment-remove-btn"
                      onClick={() => removeAttachment(i)}
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="input-row">
              <div className="attach-dropdown-wrapper" ref={attachDropdownRef}>
                <button
                  type="button"
                  className="attach-btn"
                  onClick={() => setIsAttachDropdownOpen(!isAttachDropdownOpen)}
                  title={t("attachFile")}
                >
                  <FiPlus size={18} />
                </button>
                {isAttachDropdownOpen && (
                  <div className="attach-dropdown-menu">
                    <div
                      className="attach-option"
                      onClick={() => {
                        handleSuggestionClick("Mempelai");
                        setIsAttachDropdownOpen(false);
                      }}
                    >
                      <FiUser size={16} />
                      <span>Mempelai</span>
                    </div>

                    <div
                      className="attach-option"
                      onClick={() => {
                        handleSuggestionClick("Hari dan Tanggal");
                        setIsAttachDropdownOpen(false);
                      }}
                    >
                      <FiCalendar size={16} />
                      <span>Hari dan Tanggal</span>
                    </div>

                    <div
                      className="attach-option"
                      onClick={() => {
                        handleSuggestionClick("Our Love Story");
                        setIsAttachDropdownOpen(false);
                      }}
                    >
                      <FiBook size={16} />
                      <span>Our Love Story</span>
                    </div>

                    <div
                      className="attach-option"
                      onClick={() => {
                        handleSuggestionClick("Wedding Gift");
                        setIsAttachDropdownOpen(false);
                      }}
                    >
                      <FiCreditCard size={16} />
                      <span>Wedding Gift</span>
                    </div>
                  </div>
                )}
              </div>

              <textarea
                ref={textareaRef}
                className="chat-input"
                placeholder={t("messagePlaceholder")}
                value={inputValue}
                readOnly
                rows="1"
              />
              <div className="input-actions">

                <button
                  type="submit"
                  className="send-button"
                  disabled={!inputValue.trim() && attachedFiles.length === 0}
                >
                  <FiSend size={16} />
                </button>
              </div>
            </div>

            <input
              ref={imageInputRef}
              multiple
              style={{ display: "none" }}
            />
            <input
              ref={documentInputRef}
              multiple
              style={{ display: "none" }}
            />
          </form>
        </div>
        {(!currentChat || currentChat.messages.length === 0) && (
          <div className="suggestions-container">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion.text)}
              >
                <span className="suggestion-icon">{suggestion.icon}</span>
                <span className="suggestion-text">{suggestion.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="chat-info-text">{t("disclaimer")}</div>
      <button
        className="music-toggle-btn"
        onClick={async () => {
          if (isMusicPlaying) {
            audioRef.current.pause();
            setIsMusicPlaying(false);
          } else {
            await audioRef.current.play();
            setIsMusicPlaying(true);
          }
        }}
      >
        {isMusicPlaying ? <FiVolume2 size={20} /> : <FiVolumeX size={20} />}
      </button>

    </div>
  );
};

export default ChatInterface;
