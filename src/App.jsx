import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import ChatInterface from "./components/ChatInterface";
import ImageGeneration from "./components/ImageGeneration";
import { FiSearch, FiX, FiPlus, FiMessageSquare, FiZap } from "react-icons/fi";
import { useTranslation } from "./translations";
import andriImg from "./assets/andri.png";
import musicFile from "./assets/lagu.mp3";


// LocalStorage keys
const STORAGE_KEYS = {
  CHATS: "meowgpt-chats",
  CURRENT_CHAT: "meowgpt-current-chat",
  LANGUAGE: "meowgpt-language",
};

// Supported languages
const SUPPORTED_LANGUAGES = [
  "en",
  "id",
  "meow",
];

// Function to detect user's preferred language
const detectUserLanguage = () => {
  // Get browser language
  const browserLanguage = navigator.language || navigator.userLanguage;

  // Extract language code (e.g., "en-US" -> "en")
  const languageCode = browserLanguage.split("-")[0].toLowerCase();

  console.log(
    `🌐 Browser language: ${browserLanguage}, detected code: ${languageCode}`
  );

  // Check if the language is supported
  if (SUPPORTED_LANGUAGES.includes(languageCode)) {
    console.log(`✅ Language ${languageCode} is supported`);
    return languageCode;
  }

  // Fallback to English if not supported
  console.log(
    `❌ Language ${languageCode} not supported, falling back to English`
  );
  return "en";
};

// Storage utility functions
const StorageUtils = {
  save: (key, value) => {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
      console.log(`✅ Saved ${key}:`, value);
      return true;
    } catch (error) {
      console.error(`❌ Error saving ${key}:`, error);
      return false;
    }
  },

  load: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      if (item === null || item === "undefined" || item === "null") {
        console.log(
          `📦 No data found for ${key}, using default:`,
          defaultValue
        );
        return defaultValue;
      }
      const parsed = JSON.parse(item);
      console.log(`📦 Loaded ${key}:`, parsed);
      return parsed;
    } catch (error) {
      console.error(`❌ Error loading ${key}:`, error);
      localStorage.removeItem(key);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
      console.log(`🗑️ Removed ${key}`);
    } catch (error) {
      console.error(`❌ Error removing ${key}:`, error);
    }
  },
};
// fix jawaban ai home mempelai tanggal galeri dan ucapan

const fixedResponses = {
  mempelai: {
content: `
<b>Assalamualaikum Warahmatullahi Wabarakatuh</b>
  
Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan putra-putri kami:

<b>Fitriyatun Nisa</b>
Putri Bapak Edi Supriyanto dan Ibu Maleha
<b>&</b>
<b>Andri Isnaeni</b>
Putra Bapak Abdul Karim dan Ibu Tati

Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai. Atas kehadiran dan doa restunya, kami ucapkan terima kasih.

<b>Wassalamualaikum Warahmatullahi Wabarakatuh</b>
Kami yang berbahagia,`},
  waktu: 
  {content:`
<b>Hari & Tanggal:</b>
Minggu, 21 Juni 2026
<b>Pukul:</b>
08.00 WIB – Selesai
<b>Tempat:</b>
Kediaman Mempelai Wanita (Perum. Taman Rahayu Regency Blok C7 no.168, RT6, RW8, Ciketingudik, Bantar Gebang, Kota Bekasi, Jawa Barat.)
<a href="https://maps.app.goo.gl/d4zPdFPogrZfY6uZ7" target="_blank" rel="noopener noreferrer">
Lihat Lokasi di Google Maps
</a>`},
  loveStory: {
    content:`
<b>Pertemuan:</b>
Berawal dari Organisasi (2018 - 2019) Dipertemukan di sekretariat organisasi pada 2018, kedekatan kami berlanjut saat berjuang bersama sebagai calon Presma dan Wapresma di tahun 2019. Dari rekan organisasi yang menyelaraskan visi, tumbuh ketertarikan untuk saling mendampingi sebagai partner hidup.

<b>Lamaran:</b>
Menautkan Komitmen (10 April 2026) Setelah melewati perjalanan panjang, kami memutuskan untuk membawa hubungan ini ke arah yang lebih sakral. Pada 10 April 2026, di hadapan kedua keluarga besar, kami resmi menautkan komitmen lewat ikatan lamaran untuk mempersiapkan masa depan bersama.

<b>Pernikahan:</b>
Babak Baru yang Abadi (21 Juni 2026) Dan inilah hari yang kami tunggu. Pada 21 Juni 2026, kami akan mengikrarkan janji suci untuk memulai ibadah terpanjang kami.`
  },
  weddingGift: {
      content: `
    ANDRI ISNAENI                FITRIYATUN NISA
    Bank Mandiri                    Bank Mandiri
    1380023281541               1730014978713`,
      image: andriImg,
    },
};

const inputMap = {
  "mempelai": "mempelai",
  "waktu": "waktu",
  "our love story": "loveStory",
  "love story": "loveStory",
  "wedding gift": "wedding gift",
};

const intentMap = {
  mempelai: ["mempelai", "siapa mempelai", "siapa?", "pengantin"],
  waktu: ["waktu", "kapan", "tanggal", "acara"],
  loveStory: ["love story", "cerita cinta", "galeri", "kisah"],
  weddingGift: ["wedding gift", "gift", "wedding"],
};

const getResponse = (input) => {
  const normalized = input.toLowerCase();

  for (const key in intentMap) {
    if (intentMap[key].some(keyword => normalized.includes(keyword))) {
      return fixedResponses[key];
    }
  }

  return "Maaf, aku tidak mengerti 🤍";
};

// Function to generate random meow responses in different languages

function App() {
  const audioRef = useRef(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [hasStartedMusic, setHasStartedMusic] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    window.innerWidth > 768 // Open by default on desktop, closed on mobile
  );
  const [chats, setChats] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [language, setLanguage] = useState(detectUserLanguage());
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Search modal state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState([]);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [imageGallery, setImageGallery] = useState([]); // Gallery for all generated images

  // View mode state
  const [currentView, setCurrentView] = useState("chat"); // "chat" or "imageGeneration"
  const [viewTransitionKey, setViewTransitionKey] = useState(0); // bumped on view change to trigger CSS entrance animation

  // Temporary chat mode — messages not saved to history
  const [isTemporaryMode, setIsTemporaryMode] = useState(false);
  const [temporaryChat, setTemporaryChat] = useState(null);

  // Chat interaction states
  const [deletingChatId, setDeletingChatId] = useState(null); // id of chat being animated out

  // Year Predictor modal state
  const [isYearPredictorOpen, setIsYearPredictorOpen] = useState(false);
  const [yearInput, setYearInput] = useState("");
  const [yearPrediction, setYearPrediction] = useState("");
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionMessage, setPredictionMessage] = useState("");
  const [predictionError, setPredictionError] = useState("");

  const { t } = useTranslation(language);

  // Initialize app data from localStorage
  useEffect(() => {
        const startMusic = async () => {
          if (!hasStartedMusic && audioRef.current) {
            try {
              await audioRef.current.play();
              setIsMusicPlaying(true);
              setHasStartedMusic(true);
            } catch (err) {
              console.error("Autoplay blocked:", err);
            }
          }
        };
  
        document.addEventListener("pointerdown", startMusic, { once: true });
  
        return () => {
          document.removeEventListener("pointerdown", startMusic);
        };
      }, [hasStartedMusic]);
  useEffect(() => {
    const initializeApp = () => {
      console.log("🚀 Initializing app...");

      const savedLanguage = StorageUtils.load(
        STORAGE_KEYS.LANGUAGE,
        detectUserLanguage()
      );

      setLanguage(savedLanguage);

      // Load chats
      const savedChats = StorageUtils.load(STORAGE_KEYS.CHATS, []);
      const savedCurrentChat = StorageUtils.load(
        STORAGE_KEYS.CURRENT_CHAT,
        null
      );

      // Validate and set chats
      if (Array.isArray(savedChats)) {
        setChats(savedChats);
      } else {
        console.warn("Invalid chats data, resetting...");
        setChats([]);
      }

      // Validate and set current chat
      if (
        savedCurrentChat &&
        typeof savedCurrentChat === "object" &&
        savedCurrentChat.id
      ) {
        setCurrentChat(savedCurrentChat);
      } else {
        setCurrentChat(null);
      }

      setIsInitialized(true);
      console.log("✅ App initialized successfully");
    };

    initializeApp();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape — close open panels/views
      if (e.key === "Escape") {
        if (isSearchOpen) { handleCloseSearch(); return; }
        if (currentView === "imageGeneration") { handleCloseImageGeneration(); return; }
        if (isYearPredictorOpen) { handleCloseYearPredictor(); return; }
      }

      // Ignore shortcuts when user is typing in an input/textarea
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const mod = e.ctrlKey || e.metaKey;
      // Ctrl/Cmd + K  — open search
      if (mod && e.key === "k") {
        e.preventDefault();
        if (!isSearchOpen) handleOpenSearch();
        return;
      }
      // Ctrl/Cmd + N  — new chat
      if (mod && e.key === "n") {
        e.preventDefault();
        handleNewChat();
        return;
      }
      // Ctrl/Cmd + B  — toggle sidebar
      if (mod && e.key === "b") {
        e.preventDefault();
        toggleSidebar();
        return;
      }
      // Ctrl/Cmd + I  — image generation
      if (mod && e.key === "i") {
        e.preventDefault();
        if (currentView !== "imageGeneration") handleOpenImageGeneration();
        else handleCloseImageGeneration();
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSearchOpen, currentView, isYearPredictorOpen, isSidebarOpen]);

  // Save chats to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    StorageUtils.save(STORAGE_KEYS.CHATS, chats);
  }, [chats, isInitialized]);

  // Save current chat to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    if (currentChat) {
      StorageUtils.save(STORAGE_KEYS.CURRENT_CHAT, currentChat);
    } else {
      StorageUtils.remove(STORAGE_KEYS.CURRENT_CHAT);
    }
  }, [currentChat, isInitialized]);

  // Save language to localStorage
  useEffect(() => {
    if (!isInitialized) return;

    StorageUtils.save(STORAGE_KEYS.LANGUAGE, language);
  }, [language, isInitialized]);

  // Define handleNewChat before it's used in the next useEffect
  const handleNewChat = useCallback(() => {
    // Check if there's already an empty chat (no messages)
    const existingEmptyChat = chats.find((chat) => chat.messages.length === 0);

    if (existingEmptyChat) {
      // If there's an empty chat, just select it instead of creating a new one
      console.log("📱 Selecting existing empty chat:", existingEmptyChat);
      setCurrentChat(existingEmptyChat);
      return;
    }

    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [],
      createdAt: Date.now(), // Use timestamp instead of Date object
    };

    console.log("🆕 Creating new chat:", newChat);
    setChats((prevChats) => [newChat, ...prevChats]);
    setCurrentChat(newChat);
    setCurrentView("chat"); // Switch back to chat view
  }, [chats]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleToggleTemporaryMode = () => {
    setIsTemporaryMode((prev) => {
      if (prev) {
        // Turning off — clear temporary chat
        setTemporaryChat(null);
      } else {
        // Turning on — clear current chat selection
        setCurrentChat(null);
        setTemporaryChat(null);
      }
      return !prev;
    });
  };

  const handleSelectChat = (chat) => {
    console.log("📱 Selecting chat:", chat);
    setCurrentChat(chat);
    setCurrentView("chat");
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleReturnHome = () => {
    console.log("🏠 Returning to home");
    setCurrentChat(null);
  };

  const handleDeleteChat = (chatId) => {
    console.log("🗑️ Deleting chat:", chatId);

    setChats((prevChats) => {
      const updatedChats = prevChats.filter((chat) => chat.id !== chatId);
      console.log("Updated chats after deletion:", updatedChats);
      return updatedChats;
    });

    if (currentChat?.id === chatId) {
      setCurrentChat(null);
    }
  };

  // Search modal functions
  const handleOpenSearch = () => {
    setIsSearchOpen(true);
    setSearchQuery("");
    setSearchResults([]);

    // Close sidebar on mobile when opening search modal
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      return;
    }

    // Filter chats based on title
    const filtered = chats.filter((chat) =>
      chat.title.toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  const handleSearchChatSelect = (chat) => {
    handleSelectChat(chat);
    handleCloseSearch();
  };

  // Year Predictor modal functions
  const handleOpenYearPredictor = () => {
    setIsYearPredictorOpen(true);
    setYearInput("");
    setYearPrediction("");
  };

  const handleCloseYearPredictor = () => {
    setIsYearPredictorOpen(false);
    setYearInput("");
    setYearPrediction("");
    setIsPredicting(false);
    setPredictionMessage("");
    setPredictionError("");
  };

  const handleYearInputChange = (e) => {
    const value = e.target.value;
    // Only allow 4 digits
    if (value === "" || /^\d{1,4}$/.test(value)) {
      setYearInput(value);
    }
  };
  const handlePredict = async () => {
    if (!yearInput || yearInput.length !== 4) return;

    // Check if the current year (2025) is entered
    const currentYear = new Date().getFullYear();
    const inputYear = parseInt(yearInput);

    setIsPredicting(true);
    setYearPrediction("");
    setPredictionError("");

    // Array of funny prediction messages
    const messages = [
      t("loadingMessage1"),
      t("loadingMessage2"),
      t("loadingMessage3"),
    ];

    let messageIndex = 0;
    setPredictionMessage(messages[messageIndex]);

    // Cycle through messages every 2 seconds
    const messageInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % messages.length;
      setPredictionMessage(messages[messageIndex]);
    }, 2000);

    // Complete prediction after 6 seconds (3 messages × 2 seconds each)
    setTimeout(() => {
      clearInterval(messageInterval);
      const predictedYear = inputYear;
      const messages = [
        "Tahun itu menjadi saksi bersatunya dua jiwa dalam cinta 💍",
        "Janji suci akan terucap dan mengikat selamanya ❤️",
        "Semesta merestui kisah cinta yang indah ini ✨",
        "Awal dari perjalanan cinta yang abadi dimulai di tahun itu 💞",
      ];

      const randomMessage = messages[Math.floor(Math.random() * messages.length)];

      setYearPrediction(`${predictedYear} — ${randomMessage}`);
      setIsPredicting(false);
      setPredictionMessage("");
    }, 6000);
  };

  // Image generation view functions
  const handleOpenImageGeneration = () => {
    setCurrentView("imageGeneration");
    setViewTransitionKey((k) => k + 1);
    setImagePrompt("");
    setGeneratedImages([]);
    setIsGeneratingImages(false);

    // Close sidebar on mobile when switching to image generation
    const isMobile = window.innerWidth <= 768;
    if (isMobile && isSidebarOpen) {
      setIsSidebarOpen(false);
    }
  };

  const handleCloseImageGeneration = () => {
    setCurrentView("chat");
    setViewTransitionKey((k) => k + 1);
    setImagePrompt("");
    setGeneratedImages([]);
    setIsGeneratingImages(false);
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGeneratingImages(true);

    try {
      const photos = [
        "public/img/1.jpg",
        "public/img/2.jpg",
        "public/img/3.jpg",
      ];

      const randomPhoto =
        photos[Math.floor(Math.random() * photos.length)];

      const newImage = {
        id: Date.now(),
        url: randomPhoto,
        prompt: imagePrompt,
        timestamp: Date.now(),
      };

      // Add to current generated images (for display)
      setGeneratedImages([newImage]);

      // Add to gallery (for persistent storage)
      setImageGallery((prevGallery) => [newImage, ...prevGallery]);

      // Clear the prompt after successful generation
      setImagePrompt("");
    } catch (error) {
      console.error("Error generating image:", error);

      const fallbackImage = {
        id: Date.now(),
        url: "public/img/1.jpg",
        prompt: imagePrompt,
        timestamp: Date.now(),
      };

      setGeneratedImages([fallbackImage]);
      setImageGallery((prevGallery) => [fallbackImage, ...prevGallery]);

      setImagePrompt("");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  const handleSendMessage = (message) => {
    const messageWithTimestamp = {
      ...message,
      timestamp: Date.now(),
    };

    // --- Temporary chat mode: never touch `chats` ---
    if (isTemporaryMode) {
      const baseChat = temporaryChat ?? {
        id: "temp",
        title: "Temporary Chat",
        messages: [],
        createdAt: Date.now(),
        temporary: true,
      };
      const updatedTemp = {
        ...baseChat,
        messages: [...baseChat.messages, messageWithTimestamp],
      };
      setTemporaryChat(updatedTemp);

      const responseData = getResponse(message.content);
      const aiResponseContent =
        typeof responseData === "string"
          ? responseData
          : responseData.content;
      const typingDuration = calculateTypingDuration(aiResponseContent);
      setIsAiTyping(true);

      setTimeout(() => {
        const aiResponse = {
        id: Date.now() + 1,
        content: responseData.content || "",
        image: responseData.image || null,
        accounts: responseData.accounts || null,
        sender: "ai",
        timestamp: Date.now(),
      };
        setTemporaryChat((prev) => ({
          ...prev,
          messages: [...prev.messages, aiResponse],
        }));
        setIsAiTyping(false);
      }, typingDuration);
      return;
    }

    if (!currentChat) {
      // Create new chat first
      const newChat = {
        id: Date.now(),
        title:
          message.content.length > 30
            ? message.content.slice(0, 30) + "..."
            : message.content,
        messages: [messageWithTimestamp],
        createdAt: Date.now(),
      };

      console.log("💬 Creating new chat with message:", newChat);

      setChats((prevChats) => [newChat, ...prevChats]);
      setCurrentChat(newChat);

      // Generate AI response content first to calculate typing duration
      const responseData = getResponse(message.content);
      const aiResponseContent =
        typeof responseData === "string"
          ? responseData
          : responseData.content;
      const typingDuration = calculateTypingDuration(aiResponseContent);

      // Show typing indicator
      setIsAiTyping(true);

      // Add AI response after calculated delay
      setTimeout(() => {
      const aiResponse = {
      id: Date.now() + 1,
      content: responseData.content || "",
      image: responseData.image || null,
      accounts: responseData.accounts || null,
      sender: "ai",
      timestamp: Date.now(),
    };

        const finalChat = {
          ...newChat,
          messages: [...newChat.messages, aiResponse],
        };

        console.log("🤖 Adding AI response to new chat:", finalChat);

        setCurrentChat(finalChat);
        setChats((prevChats) =>
          prevChats.map((chat) => (chat.id === newChat.id ? finalChat : chat))
        );
        setIsAiTyping(false);
      }, typingDuration);
      return;
    }

    const updatedChat = {
      ...currentChat,
      messages: [...currentChat.messages, messageWithTimestamp],
      title:
        currentChat.title === "New Chat"
          ? message.content.length > 30
            ? message.content.slice(0, 30) + "..."
            : message.content
          : currentChat.title,
    };

    console.log("💬 Adding message to existing chat:", updatedChat);

    setCurrentChat(updatedChat);
    setChats((prevChats) =>
      prevChats.map((chat) => (chat.id === currentChat.id ? updatedChat : chat))
    );

    // Generate AI response content first to calculate typing duration
    const responseData = getResponse(message.content);
    const aiResponseContent =
      typeof responseData === "string"
        ? responseData
        : responseData.content;
    const typingDuration = calculateTypingDuration(aiResponseContent);

    // Show typing indicator
    setIsAiTyping(true);

    // Add AI response after a delay
    setTimeout(() => {
      const aiResponse = {
      id: Date.now() + 1,
      content: responseData.content || "",
      image: responseData.image || null,
      accounts: responseData.accounts || null,
      sender: "ai",
      timestamp: Date.now(),
    };

      const finalChat = {
        ...updatedChat,
        messages: [...updatedChat.messages, aiResponse],
      };

      console.log("🤖 Adding AI response to existing chat:", finalChat);

      setCurrentChat(finalChat);
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === currentChat.id ? finalChat : chat))
      );
      setIsAiTyping(false);
    }, typingDuration);
  };

  // Calculate typing duration based on message content
  const calculateTypingDuration = (message) => {
    if (!message) return 1000; // Default 1 second

    // Count words in the message
    const words = message
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    const wordCount = words.length;

    // Base duration: 200ms per word, with minimum 800ms and maximum 4000ms
    const baseTime = 200;
    const minTime = 700;
    const maxTime = 2000;

    const calculatedTime = Math.max(
      minTime,
      Math.min(maxTime, wordCount * baseTime)
    );

    console.log(
      `💬 Message: "${message.substring(
        0,
        50
      )}..." | Words: ${wordCount} | Typing duration: ${calculatedTime}ms`
    );

    return calculatedTime;
  };

  // Regenerate AI response for a specific message
  const handleRegenerateResponse = (messageId) => {
    if (!currentChat) return;

    console.log("🔄 Regenerating response for message:", messageId);

    // Find the message to regenerate
    const messageIndex = currentChat.messages.findIndex(
      (msg) => msg.id === messageId
    );
    if (
      messageIndex === -1 ||
      currentChat.messages[messageIndex].sender !== "ai"
    ) {
      console.log("❌ Message not found or not an AI message");
      return;
    }

    // Generate new AI response content
    const responseData = getResponse(message.content);
    const aiResponseContent =
      typeof responseData === "string"
        ? responseData
        : responseData.content;
    const typingDuration = calculateTypingDuration(newAiResponseContent);

    // Immediately replace the message with typing indicator
    const updatedMessagesWithTyping = [...currentChat.messages];
    updatedMessagesWithTyping[messageIndex] = {
      ...updatedMessagesWithTyping[messageIndex],
      content: "typing",
      isTyping: true,
      timestamp: Date.now(),
    };

    const chatWithTyping = {
      ...currentChat,
      messages: updatedMessagesWithTyping,
    };

    setCurrentChat(chatWithTyping);
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === currentChat.id ? chatWithTyping : chat
      )
    );

    // Replace with actual content after calculated delay
    setTimeout(() => {
      const updatedMessages = [...currentChat.messages];
      updatedMessages[messageIndex] = {
        ...updatedMessages[messageIndex],
        content: newAiResponseContent,
        isTyping: false,
        timestamp: Date.now(), // Update timestamp to show it's regenerated
      };

      const updatedChat = {
        ...currentChat,
        messages: updatedMessages,
      };

      console.log("🔄 Regenerated AI response:", newAiResponseContent);

      setCurrentChat(updatedChat);
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.id === currentChat.id ? updatedChat : chat
        )
      );
    }, typingDuration);
  };

  const handleDeleteChatAnimated = (chatId) => {
    setDeletingChatId(chatId);
    setTimeout(() => {
      setDeletingChatId(null);
      if (currentChat?.id === chatId) {
        setCurrentChat(null);
      }
      setChats((prevChats) => prevChats.filter((c) => c.id !== chatId));
    }, 320);
  };

  const handleRenameChat = (chatId, newTitle) => {
    if (!newTitle.trim()) return;
    const trimmed = newTitle.trim();
    setChats((prevChats) =>
      prevChats.map((c) => (c.id === chatId ? { ...c, title: trimmed } : c))
    );
    if (currentChat?.id === chatId) {
      setCurrentChat((prev) => ({ ...prev, title: trimmed }));
    }
  };

  const handleLanguageChange = (newLanguage) => {
    console.log("🌐 Language changing to:", newLanguage);
    setLanguage(newLanguage);
  };

  // Debug function to clear all localStorage data
  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This cannot be undone."
      )
    ) {
      Object.values(STORAGE_KEYS).forEach((key) => StorageUtils.remove(key));
      setChats([]);
      setCurrentChat(null);
      setLanguage(detectUserLanguage());
      console.log("🧹 All data cleared");
    }
  };

  // Add to window for debugging (remove in production)
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      window.clearChatData = clearAllData;
      window.showStorageData = () => {
        console.log("📊 Current storage data:");
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
          console.log(`${name}:`, StorageUtils.load(key));
        });
      };
      window.testStorage = () => {
        console.log("🧪 Testing localStorage functionality...");

        // Test saving and loading
        StorageUtils.save("test-key", { test: "data", timestamp: Date.now() });
        const loaded = StorageUtils.load("test-key");
        console.log("Test save/load:", loaded);

        // Test current state
        console.log("Current state:", {
          chats: chats.length,
          currentChat: currentChat?.id,
          language,
          isInitialized,
        });

        StorageUtils.remove("test-key");
        console.log("✅ Storage test completed");
      };
      window.testLanguageDetection = () => {
        console.log("🧪 Testing language detection...");
        console.log("Browser language:", navigator.language);
        console.log("Detected language:", detectUserLanguage());
        console.log("Supported languages:", SUPPORTED_LANGUAGES);
        console.log("Current language:", language);
        console.log("✅ Language detection test completed");
      };
      window.testRandomMeow = () => {
        console.log("🧪 Testing random meow generation...");
        for (let i = 0; i < 5; i++) {
          console.log(`Sample ${i + 1}:`, generateRandomMeowResponse(language));
        }
        console.log("✅ Random meow test completed");
      };
    }
  }, [chats, currentChat, language, isInitialized]);

  // Add development helper to show storage status
  useEffect(() => {
    if (import.meta.env.MODE === "development") {
      console.log("📊 Current app state:");
      console.log("- Chats:", chats.length);
      console.log("- Current chat:", currentChat?.id || "none");
      console.log("- Language:", language);
      console.log("- Initialized:", isInitialized);
    }
  }, [chats, currentChat, language, isInitialized]);

  // Don't render until initialized to prevent flash of empty state
  if (!isInitialized) {
    return (
      <div
        className="app"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          fontSize: "18px",
          color: "#6b7280",
        }}
      >
        {t("loading")}
      </div>
    );
  }

  return (
    <div className={`app`}>
      <audio
        ref={audioRef}
        src={musicFile}
        loop
        preload="auto"
      />
      {/* AI typing progress bar */}
      <div className={`ai-progress-bar ${isAiTyping ? "active" : ""}`} />
      <Sidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        chats={chats}
        currentChat={currentChat}
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onReturnHome={handleReturnHome}
        onDeleteChat={handleDeleteChatAnimated}
        onRenameChat={handleRenameChat}
        language={language}
        onOpenSearch={handleOpenSearch}
        onOpenImageGeneration={handleOpenImageGeneration}
        onOpenYearPredictor={handleOpenYearPredictor}
        currentView={currentView}
        deletingChatId={deletingChatId}
        onLanguageChange={handleLanguageChange}
      />
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? "active" : ""}`}
        onClick={toggleSidebar}
      />
      {/* Main Content Area */}
      <div key={viewTransitionKey} className="view-content">
        {currentView === "chat" ? (
          <ChatInterface
            currentChat={isTemporaryMode ? temporaryChat : currentChat}
            onSendMessage={handleSendMessage}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            language={language}
            onLanguageChange={handleLanguageChange}
            isAiTyping={isAiTyping}
            onRegenerateResponse={handleRegenerateResponse}
            onOpenSearch={handleOpenSearch}
            onNewChat={handleNewChat}
            isTemporaryMode={isTemporaryMode}
            onToggleTemporaryMode={handleToggleTemporaryMode}
            audioRef={audioRef}
            isMusicPlaying={isMusicPlaying}
            setIsMusicPlaying={setIsMusicPlaying}
          />
        ) : (
          <ImageGeneration
            language={language}
            imagePrompt={imagePrompt}
            setImagePrompt={setImagePrompt}
            generatedImages={generatedImages}
            isGeneratingImages={isGeneratingImages}
            onGenerateImage={handleGenerateImage}
            imageGallery={imageGallery}
            setImageGallery={setImageGallery}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={toggleSidebar}
            audioRef={audioRef}
            isMusicPlaying={isMusicPlaying}
            setIsMusicPlaying={setIsMusicPlaying}
          />
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div className="search-modal-overlay" onClick={handleCloseSearch}>
          <div className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-modal-header">
              <div className="search-input-container">
                <FiSearch size={16} className="search-input-icon" />
                <input
                  type="text"
                  placeholder={t("searchChats")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                  autoFocus
                />
              </div>
              <button
                className="search-modal-close"
                onClick={handleCloseSearch}
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="search-modal-divider" />
            <div className="search-modal-content">
              {searchQuery === "" ? (
                <div className="search-empty-state">
                  <div
                    className="search-suggestion"
                    onClick={() => {
                      handleNewChat();
                      handleCloseSearch();
                    }}
                  >
                    <FiPlus size={16} />
                    <span>{t("newChat")}</span>
                  </div>
                </div>
              ) : searchResults.length === 0 ? (
                <div className="search-no-results">
                  <span>{t("noChatsFound")}</span>
                </div>
              ) : (
                <div className="search-results">
                  {searchResults.map((chat) => (
                    <div
                      key={chat.id}
                      className={`search-result-item ${
                        currentChat?.id === chat.id ? "active" : ""
                      }`}
                      onClick={() => handleSearchChatSelect(chat)}
                    >
                      <FiMessageSquare
                        size={16}
                        className="search-result-icon"
                      />
                      <span className="search-result-title">{chat.title}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Year Predictor Modal */}
      {isYearPredictorOpen && (
        <div
          className="year-predictor-modal-overlay"
          onClick={handleCloseYearPredictor}
        >
          <div
            className="year-predictor-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="year-predictor-modal-header">
              <h2>{t("nextYearPredictor")}</h2>
              <button
                className="year-predictor-modal-close"
                onClick={handleCloseYearPredictor}
              >
                <FiX size={18} />
              </button>
            </div>
            <div className="year-predictor-modal-content">
              <div className="year-input-section">
                <label htmlFor="year-input">{t("enterYear")}</label>
                <input
                  id="year-input"
                  type="text"
                  value={yearInput}
                  onChange={handleYearInputChange}
                  placeholder={t("yearPlaceholder")}
                  maxLength="4"
                  className="year-input"
                />
                <button
                  className="predict-btn"
                  onClick={handlePredict}
                  disabled={yearInput.length !== 4 || isPredicting}
                >
                  {isPredicting ? t("predicting") : t("predict")}
                </button>
              </div>

              {predictionError && (
                <div className="prediction-error">
                  <p>{predictionError}</p>
                </div>
              )}

              {(yearPrediction || isPredicting) && (
                <div className="prediction-output">
                  <h3>{t("prediction")}</h3>
                  <div className="prediction-text">
                    {isPredicting ? (
                      <div className="prediction-loading">
                        <div className="loading-spinner">
                          <FiZap className="spinner" size={20} />
                        </div>
                        <span>{predictionMessage}</span>
                      </div>
                    ) : (
                      <p>{yearPrediction}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
