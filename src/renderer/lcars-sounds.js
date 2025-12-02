/**
 * LCARS Sounds - Click sound effects for navigation
 * Based on www.TheLCARS.com template
 */

// Play a beep sound by number (1-4)
function playBeep(beepNumber) {
  const audio = document.getElementById('beep' + beepNumber);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => {
      // Ignore autoplay errors (user hasn't interacted yet)
      console.log('Audio play prevented:', err.message);
    });
  }
}

// Play sound and then navigate to URL
function playSoundAndNavigate(beepNumber, url) {
  const audio = document.getElementById('beep' + beepNumber);
  if (audio) {
    audio.currentTime = 0;
    audio.play().catch(err => console.log('Audio play prevented:', err.message));

    // Navigate after a short delay to let sound play
    setTimeout(() => {
      window.location.href = url;
    }, 150);
  } else {
    window.location.href = url;
  }
}

// Initialize sound effects on all navigation buttons
document.addEventListener('DOMContentLoaded', () => {
  // Add click sounds to sidebar shape buttons
  const sidebarButtons = document.querySelectorAll(
    '.home-shape, .about-shape, .terminal-shape, .file-system-shape, ' +
    '.back-button-shape, .previous-button-shape'
  );

  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const href = btn.getAttribute('href');
      if (href && href !== '#') {
        playSoundAndNavigate(2, href);
      } else {
        playBeep(2);
      }
    });
  });

  // Add click sounds to navigation text links
  const navLinks = document.querySelectorAll(
    '.home-button a, .about-button a, .terminal-button a, .file-system a, ' +
    '.back-button a, .previous-button a'
  );

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href !== '#') {
        playSoundAndNavigate(2, href);
      } else {
        playBeep(2);
      }
    });
  });

  // Add click sound to network status button
  const networkBtn = document.querySelector('.network-status-container');
  if (networkBtn) {
    networkBtn.closest('a')?.addEventListener('click', (e) => {
      e.preventDefault();
      const href = networkBtn.closest('a').getAttribute('href');
      playSoundAndNavigate(1, href);
    });
  }
});
