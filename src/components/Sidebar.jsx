import React, { useState, useEffect, useRef } from "react";
import {
  FiPlus,
  FiEdit,
  FiCreditCard,
  FiMessageSquare,
  FiSearch,
  FiSidebar,
  FiTrash2,
  FiImage,
  FiEdit2,
  FiCheck,
  FiInstagram ,
  FiZap,
  FiSettings,
  FiHelpCircle,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { useTranslation } from "../translations";
import MeowGPTIcon from "../assets/icon.svg?react";
import MeowGPTLightIcon from "../assets/icon-light.svg?react";

const Sidebar = ({
  isOpen,
  onToggle,
  chats,
  currentChat,
  onNewChat,
  onSelectChat,
  onReturnHome,
  onDeleteChat,
  onRenameChat,
  language,
  onOpenSearch,
  onOpenImageGeneration,
  onOpenYearPredictor,
  currentView,
  deletingChatId,
  theme,
  onThemeChange,
  onLanguageChange,
}) => {
  const { t } = useTranslation(language);
  const [hoveredChatId, setHoveredChatId] = useState(null);
  const [currentTheme, setCurrentTheme] = useState("light");
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [renameValue, setRenameValue] = useState("");
  const [isAccountDropdownOpen, setIsAccountDropdownOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ bottom: 0, left: 0 });
  const renameInputRef = useRef(null);
  const accountDropdownRef = useRef(null);
  const accountTriggerRef = useRef(null);
  const settingsModalRef = useRef(null);

  const themes = [
    { id: "light", name: t("themes.light") },
    { id: "dark", name: t("themes.dark") },
    { id: "system", name: t("themes.system") },
  ];

  const languages = [
    { id: "en", name: t("languages.en") },
    { id: "id", name: t("languages.id") },
    { id: "meow", name: t("languages.meow") },
  ];

  // Function to get the current theme from the document
  const getCurrentTheme = () => {
    const theme = document.documentElement.getAttribute("data-theme");
    return theme || "light";
  };

  // Function to get the appropriate logo icon based on theme
  const getLogoIcon = () => {
    return currentTheme === "dark" ? MeowGPTLightIcon : MeowGPTIcon;
  };

  // Effect to monitor theme changes
  useEffect(() => {
    const updateTheme = () => {
      setCurrentTheme(getCurrentTheme());
    };

    // Set initial theme
    updateTheme();

    // Create observer to watch for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateTheme();
        }
      });
    });

    // Start observing
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Cleanup observer
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountDropdownRef.current && !accountDropdownRef.current.contains(event.target)) {
        setIsAccountDropdownOpen(false);
      }
      if (settingsModalRef.current && !settingsModalRef.current.contains(event.target) && event.target.classList.contains("settings-modal-overlay")) {
        setIsSettingsModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenSettings = () => {
    setIsSettingsModalOpen(true);
    setIsAccountDropdownOpen(false);
  };

  const handleCloseSettings = () => {
    setIsSettingsModalOpen(false);
  };

  // Focus rename input when renaming starts
  useEffect(() => {
    if (renamingChatId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingChatId]);

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  const handleDoubleClickTitle = (e, chat) => {
    e.stopPropagation();
    if (!isOpen) return; // don't rename in rail mode
    setRenamingChatId(chat.id);
    setRenameValue(chat.title);
  };

  const commitRename = () => {
    if (renamingChatId && renameValue.trim()) {
      onRenameChat(renamingChatId, renameValue.trim());
    }
    setRenamingChatId(null);
    setRenameValue("");
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      commitRename();
    }
    if (e.key === "Escape") {
      setRenamingChatId(null);
      setRenameValue("");
    }
  };

  return (
    <div
      className={`sidebar ${!isOpen ? "closed" : ""} ${isOpen ? "open" : ""}`}
    >
      <div className="sidebar-header">
        <div className="header-top">
          <div className="logo-section">
            <button
              className="logo-btn"
              onClick={isOpen ? onReturnHome : onToggle}
              title={!isOpen ? "MeowGPT" : ""}
            >
              <div className="logo-icon">
                {React.createElement(getLogoIcon())}
              </div>
            </button>
          </div>
          {isOpen && (
            <button className="sidebar-close-btn" onClick={onToggle}>
              <FiSidebar size={18} />
            </button>
          )}
        </div>
        <button
          className="new-chat-btn"
          onClick={onNewChat}
          title={!isOpen ? t("newChat") : ""}
        >
          <FiEdit size={16} />
          <span>{t("newChat")}</span>
        </button>
        <button
          className="search-chat-btn"
          onClick={onOpenSearch}
          title={!isOpen ? t("searchChats") : ""}
        >
          <FiSearch size={16} />
          <span>{t("searchChats")}</span>
        </button>
        <button
          className={`image-generation-btn${currentView === "imageGeneration" ? " active" : ""}`}
          onClick={onOpenImageGeneration}
          title={!isOpen ? t("imageGeneration") : ""}
        >
          <FiImage size={16} />
          <span>{t("imageGeneration")}</span>
        </button>

        {/* GPTs section */}
      </div>

      <div className="sidebar-content">
        {chats.length === 0 ? (
          <div className="no-chats">{t("")}</div>
        ) : (
          chats.map((chat) => {
            const isRenaming = renamingChatId === chat.id;
            const isDeleting = deletingChatId === chat.id;

            return (
              <div
                key={chat.id}
                className={`chat-item${currentChat?.id === chat.id ? " active" : ""}${isDeleting ? " removing" : ""}`}
                onClick={() => !isRenaming && onSelectChat(chat)}
                onMouseEnter={() => setHoveredChatId(chat.id)}
                onMouseLeave={() => setHoveredChatId(null)}
                title={!isOpen ? chat.title : ""}
              >
                <div className="chat-item-content">
                  <FiMessageSquare size={16} className="chat-icon" />
                  <div className="chat-details">
                    {isRenaming ? (
                      <input
                        ref={renameInputRef}
                        className="chat-rename-input"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={handleRenameKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        maxLength={60}
                      />
                    ) : (
                      <span
                        className="chat-title"
                        onDoubleClick={(e) => handleDoubleClickTitle(e, chat)}
                      >
                        {chat.title}
                      </span>
                    )}
                  </div>
                </div>
                {isOpen && hoveredChatId === chat.id && !isRenaming && (
                  <div className="chat-item-actions">
                    <button
                      className="rename-chat-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDoubleClickTitle(e, chat);
                      }}
                      title={t("rename")}
                    >
                      <FiEdit2 size={13} />
                    </button>
                    <button
                      className="delete-chat-btn"
                      onClick={(e) => handleDeleteChat(e, chat.id)}
                      title={t("deleteChat")}
                    >
                      <FiTrash2 size={13} />
                    </button>
                  </div>
                )}
                {isOpen && isRenaming && (
                  <button
                    className="rename-confirm-btn"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      commitRename();
                    }}
                    title={t("save")}
                  >
                    <FiCheck size={13} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      <div className="sidebar-footer">
        <div className="account-dropdown" ref={accountDropdownRef}>
          <button
            ref={accountTriggerRef}
            className="account-dropdown-trigger sidebar-account-trigger"
            onClick={() => {
              if (!isAccountDropdownOpen) {
                const rect = accountTriggerRef.current.getBoundingClientRect();
                setDropdownPos({
                  bottom: window.innerHeight - rect.top + 8,
                  left: rect.left,
                });
              }
              setIsAccountDropdownOpen(!isAccountDropdownOpen);
            }}
            title={!isOpen ? t("account") : ""}
          >
            <div className="account-avatar">FA</div>
            <span className="sidebar-account-label">{t("account")}</span>
          </button>

          {isAccountDropdownOpen && (
            <div
              className="account-dropdown-menu account-dropdown-menu--fixed"
              style={{ bottom: dropdownPos.bottom, left: dropdownPos.left }}
            >
              <div className="account-info">
                <FiInstagram  size={16} />
                <a
                  href="https://www.instagram.com/simpulcreative_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: "inherit", textDecoration: "none" }}
                >
                  {t("madeBy")}
                </a>
              </div>

              <div className="dropdown-divider"></div>

              <div className="account-menu-item">
                <FiZap size={16} />
                <span>{t("upgradePlan")}</span>
              </div>

              <div className="account-menu-item">
                <FiSettings size={16} />
                <span>{t("settings")}</span>
              </div>

              <div className="dropdown-divider"></div>

              <div className="account-menu-item">
                <FiHelpCircle size={16} />
                <span>{t("help")}</span>
                <FiChevronRight size={16} className="menu-arrow" />
              </div>

              <div className="account-menu-item">
                <FiLogOut size={16} />
                <span>{t("logOut")}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {isSettingsModalOpen && (
        <div className="settings-modal-overlay" onClick={handleCloseSettings}>
          <div
            ref={settingsModalRef}
            className="settings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="settings-modal-header">
              <h2>{t("settingsTitle")}</h2>
              <button className="settings-close-btn" onClick={handleCloseSettings}>
                <FiX size={20} />
              </button>
            </div>

            <div className="settings-modal-content">
              <div className="settings-section">
                <h3>{t("appearance")}</h3>
                <div className="settings-item">
                  <label>{t("theme")}</label>
                  <select
                    className="settings-select"
                    value={theme}
                    onChange={(e) => onThemeChange(e.target.value)}
                  >
                    {themes.map((themeOption) => (
                      <option key={themeOption.id} value={themeOption.id}>
                        {themeOption.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="settings-section">
                <h3>{t("general")}</h3>
                <div className="settings-item">
                  <label>{t("language")}</label>
                  <select
                    className="settings-select"
                    value={language}
                    onChange={(e) => onLanguageChange(e.target.value)}
                  >
                    {languages.map((lang) => (
                      <option key={lang.id} value={lang.id}>
                        {lang.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
