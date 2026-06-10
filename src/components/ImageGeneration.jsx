import React, { useRef, useEffect, useState } from "react";
import {
  FiImage,
  FiDownload,
  FiTrash2,
  FiMenu,
  FiSend,
  FiVolume2,
  FiVolumeX,
  FiZap,
} from "react-icons/fi";
import { useTranslation } from "../translations";
import img1 from "../assets/1.png";
import img2 from "../assets/2.png";
import img3 from "../assets/3.png";
import img4 from "../assets/4.png";
import { useSwipeable } from "react-swipeable";

const ImageGeneration = ({
  language,
  imagePrompt,
  setImagePrompt,
  generatedImages,
  isGeneratingImages,
  onGenerateImage,
  imageGallery,
  setImageGallery,
  isSidebarOpen,
  onToggleSidebar,
  audioRef,
  isMusicPlaying,
  setIsMusicPlaying,
}) => {
  const { t } = useTranslation(language);
  const textareaRef = useRef(null);
  const REVEAL_DELAY_MS = 5000;
  const [selectedImage, setSelectedImage] = useState(0);

  const handlers = useSwipeable({
    onSwipedLeft: () =>
      setSelectedImage((prev) => (prev + 1) % galleryImages.length),

    onSwipedRight: () =>
      setSelectedImage(
        (prev) => (prev - 1 + galleryImages.length) % galleryImages.length
      ),

    trackTouch: true,
  });

  // revealedImage: the image currently shown (delayed by REVEAL_DELAY_MS after generation)
  const [revealedImage, setRevealedImage] = useState(null);
  // isWaiting: generation done but delay not elapsed yet → keep skeleton
  const [isWaiting, setIsWaiting] = useState(false);
  // countdown seconds for the skeleton label
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  // Watch for new generated image → start delay
  useEffect(() => {
    const latest = generatedImages[0] ?? null;
    if (!latest) return;
    // same image already revealed → skip
    if (revealedImage && revealedImage.id === latest.id) return;

    // Clear any previous timers
    clearTimeout(timerRef.current);
    clearInterval(countdownRef.current);

    setIsWaiting(true);
    setCountdown(Math.round(REVEAL_DELAY_MS / 1000));

    // Tick countdown each second
    let remaining = Math.round(REVEAL_DELAY_MS / 1000);
    countdownRef.current = setInterval(() => {
      remaining -= 1;
      setCountdown(remaining);
      if (remaining <= 0) clearInterval(countdownRef.current);
    }, 1000);

    timerRef.current = setTimeout(() => {
      clearInterval(countdownRef.current);
      setIsWaiting(false);
      setRevealedImage(latest);
    }, REVEAL_DELAY_MS);

    return () => {
      clearTimeout(timerRef.current);
      clearInterval(countdownRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [generatedImages]);
  
  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  }, [imagePrompt]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!imagePrompt.trim() || isGeneratingImages || isWaiting) return;
    onGenerateImage();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleDownloadImage = (imageUrl, index) => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `meowgpt-image-${index + 1}.jpg`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearGallery = () => {
    if (window.confirm(t("clearGalleryConfirm"))) {
      setImageGallery([]);
      setRevealedImage(null);
    }
  };

  const galleryImages = [
    img1,
    img2,
    img3,
    img4,
  ];
  return (
    <div className="img-gen-root">
      {/* Top bar */}
      <header className="img-gen-header">
        <div className="img-gen-header-left">
          <button
            className="hamburger-menu mobile-only"
            onClick={onToggleSidebar}
            title={t("toggleMenu")}
          >
            <FiMenu size={20} />
          </button>
          <span className="img-gen-title-icon"><FiZap size={20} /></span>
          <h1 className="img-gen-title">{t("imageGenerationTitle")}</h1>
        </div>
        {imageGallery.length > 0 && (
          <button className="img-gen-clear-btn" onClick={handleClearGallery}>
            <FiTrash2 size={15} />
            <span>{t("clearGallery")}</span>
          </button>
        )}
      </header>

      {/* Scrollable body */}
      <div className="img-gen-body">

        {/* Result area */}
        <div {...handlers} className="img-gen-viewer-wrapper">
          <img
            src={galleryImages[selectedImage]}
            alt={`Gallery ${selectedImage + 1}`}
            className="img-gen-viewer-image"
          />
        </div>
        <div className="img-gen-gallery-viewer">

          <div className="img-gen-thumbnails">
            {galleryImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Thumbnail ${index + 1}`}
                className={`img-gen-thumb ${
                  selectedImage === index ? "active" : ""
                }`}
                onClick={() => setSelectedImage(index)}
              />
            ))}
          </div>
        </div>

        {/* Gallery — only past images, below the main result */}
        {(() => {
          const pastImages = imageGallery.filter(
            (img) => img.id !== (generatedImages[0]?.id)
          );
          if (pastImages.length === 0) return null;
          return (
            <div className="img-gen-gallery">
              <div className="img-gen-gallery-header">
                <span className="img-gen-gallery-title">{t("galleryTitle")}</span>
                <span className="img-gen-gallery-count">{pastImages.length}</span>
              </div>
              <div className="img-gen-grid">
                {pastImages.map((image, index) => (
                  <div key={image.id} className="img-gen-card">
                    <div className="img-gen-card-img-wrap">
                      <img
                        src={image.url}
                        alt={`${t("generatedImageNumberAlt")} ${index + 1}`}
                        className="img-gen-card-img"
                      />
                      <div className="img-gen-card-overlay">
                        <button
                          className="img-gen-card-dl-btn"
                          onClick={() => handleDownloadImage(image.url, index)}
                          title={t("downloadImage")}
                        >
                          <FiDownload size={15} />
                        </button>
                      </div>
                    </div>
                    <p className="img-gen-card-prompt">
                      {image.prompt.length > 80
                        ? image.prompt.substring(0, 80) + "…"
                        : image.prompt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
      </div>

      {/* Prompt input bar — fixed at bottom */}
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

export default ImageGeneration;
