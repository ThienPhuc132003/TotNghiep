// Avatar Debug Script for TutorClassroomPage
console.log("🔍 Avatar Debug Script - TutorClassroomPage");

// Check if dfMale image exists
function checkDefaultAvatar() {
  const img = new Image();
  img.onload = function () {
    console.log("✅ dfMale image loaded successfully:", this.src);
  };
  img.onerror = function () {
    console.error("❌ dfMale image failed to load:", this.src);
  };

  // Try to load the default avatar
  img.src = "/src/assets/images/df-male.png";
}

// Check classroom user avatars
function checkClassroomAvatars() {
  console.log("🔍 Checking classroom avatars...");

  // Find all avatar images in the page
  const avatarImages = document.querySelectorAll(
    ".tcp-student-avatar, .tcp-detail-avatar"
  );
  console.log(`Found ${avatarImages.length} avatar images`);

  avatarImages.forEach((img, index) => {
    console.log(`Avatar ${index + 1}:`, {
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      complete: img.complete,
    });

    if (!img.complete || img.naturalHeight === 0) {
      console.warn(`⚠️ Avatar ${index + 1} may have loading issues`);
    }
  });
}

// Check for broken images
function checkBrokenImages() {
  const images = document.querySelectorAll("img");
  let brokenCount = 0;

  images.forEach((img, index) => {
    if (!img.complete || img.naturalHeight === 0) {
      console.error(`💥 Broken image found:`, {
        src: img.src,
        alt: img.alt,
        className: img.className,
      });
      brokenCount++;
    }
  });

  if (brokenCount === 0) {
    console.log("✅ No broken images found");
  } else {
    console.warn(`⚠️ Found ${brokenCount} broken images`);
  }
}

// Check network requests for images
function monitorImageRequests() {
  // Override Image constructor to monitor requests
  const originalImage = window.Image;
  window.Image = function () {
    const img = new originalImage();

    img.addEventListener("load", function () {
      console.log("📸 Image loaded:", this.src);
    });

    img.addEventListener("error", function () {
      console.error("💥 Image failed to load:", this.src);
    });

    return img;
  };
}

// Main debug function
function debugTutorClassroomAvatars() {
  console.log("🎯 Starting TutorClassroomPage Avatar Debug...");

  checkDefaultAvatar();

  // Wait for page to load, then check avatars
  setTimeout(() => {
    checkClassroomAvatars();
    checkBrokenImages();
  }, 2000);
}

// Start monitoring
monitorImageRequests();

// Auto-run when script loads
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", debugTutorClassroomAvatars);
} else {
  debugTutorClassroomAvatars();
}

// Also run when page changes (for SPAs)
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    if (url.includes("tutor-classroom") || url.includes("lop-hoc")) {
      setTimeout(debugTutorClassroomAvatars, 1000);
    }
  }
}).observe(document, { subtree: true, childList: true });

console.log("🎯 Avatar debug script loaded for TutorClassroomPage");
