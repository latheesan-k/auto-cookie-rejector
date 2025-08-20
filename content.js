// Auto Cookie Rejector - Using EasyList Cookie rules
// Track if we've already processed this page
let processed = false;
let processingAttempts = 0;
const MAX_ATTEMPTS = 10;
const RETRY_DELAY = 1500;

// EasyList Cookie general hide rules (most common cookie consent containers)
const cookieContainerSelectors = [
  // Generic cookie containers
  '#cookie-notice',
  '#cookie-banner',
  '#cookie-consent',
  '#cookie-policy',
  '#cookie-popup',
  '#cookie-overlay',
  '#cookie-modal',
  '#cookie-dialog',
  '#cookie-alert',
  '#gdpr-consent',
  '#privacy-policy',
  '#consent-banner',
  '#cc-banner',
  '#cc-modal',
  '#cc-popup',
  '#cc-container',
  '.cookie-notice',
  '.cookie-banner',
  '.cookie-consent',
  '.cookie-policy',
  '.cookie-popup',
  '.cookie-overlay',
  '.cookie-modal',
  '.cookie-dialog',
  '.cookie-alert',
  '.gdpr-consent',
  '.privacy-policy',
  '.consent-banner',
  '.cc-banner',
  '.cc-modal',
  '.cc-popup',
  '.cc-container',
  
  // More specific selectors from EasyList Cookie
  '#-CookieConsentContainer',
  '#ACCETTA_COOKIES',
  '#AF_GDPR',
  '#AVGcookiemelding',
  '#AcceptCookie',
  '#AcceptCookieContainer',
  '#AcceptCookieInfo',
  '#AcceptCookies',
  '#AiraGdprDialog',
  '#AlertCookie',
  '#AlertCookieBanner',
  '#AlertCookies',
  '#AlertDialogConatiner',
  '#AlertaCookies',
  '#AllowCookieContainer',
  '#AllowCookiesMessage',
  '#AllowCookiesWrapper',
  '#AppCookieBar',
  '#ArsysCookieAcceptance',
  
  // YouTube-specific
  'ytd-consent-bump-v2-lightbox',
  '.consent-bump-v2-lightbox',
  'ytd-consent-bump-v2'
];

// EasyList Cookie specific button selectors (reject/deny/decline buttons)
const rejectButtonSelectors = [
  // Generic reject buttons
  'button:contains("Reject")',
  'button:contains("Deny")',
  'button:contains("Decline")',
  'button:contains("Refuse")',
  'button:contains("I Decline")',
  'button:contains("Do Not Accept")',
  'button:contains("Necessary Only")',
  'button:contains("Only Essential")',
  
  // More specific selectors from EasyList Cookie
  '[data-testid="consent-reject-all-endpoint"]',
  '#cookie_decline',
  
  // YouTube-specific reject buttons
  'ytd-consent-bump-v2-lightbox .buttons ytd-button-renderer:last-child',
  'ytd-consent-bump-v2-lightbox .buttons button[aria-label*="reject" i]',
  'ytd-consent-bump-v2-lightbox .buttons button:contains("Reject all")',
  'ytd-consent-bump-v2-lightbox .buttons button:contains("Reject")',
  'ytd-consent-bump-v2-lightbox .buttons button:contains("Deny")'
];

// Custom contains selector function
function containsText(selector, text) {
  const elements = document.querySelectorAll(selector);
  for (let el of elements) {
    if (el.textContent && el.textContent.toLowerCase().includes(text.toLowerCase())) {
      return el;
    }
  }
  return null;
}

// Enhanced check if element is visible and in viewport
function isVisible(element) {
  if (!element) return false;
  
  // Basic visibility check
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || 
      style.visibility === 'hidden' || 
      style.opacity === '0') {
    return false;
  }
  
  // Size check
  if (element.offsetWidth === 0 && element.offsetHeight === 0) {
    return false;
  }
  
  // Check if element is in viewport
  const rect = element.getBoundingClientRect();
  const windowHeight = (window.innerHeight || document.documentElement.clientHeight);
  const windowWidth = (window.innerWidth || document.documentElement.clientWidth);
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= windowHeight &&
    rect.right <= windowWidth
  );
}

// Enhanced tryClick function with better error handling
function tryClick(selector) {
  let elements = [];
  
  try {
    if (selector.includes(':contains')) {
      // Handle selectors with :contains pseudo-selector
      const containsMatches = selector.match(/^([^\:]+):contains\("([^"]+)"\)(.*)$/);
      if (containsMatches) {
        const baseSelector = containsMatches[1];
        const textContent = containsMatches[2];
        const remainingSelector = containsMatches[3];
        
        // Get elements matching the base selector
        let baseElements = Array.from(document.querySelectorAll(baseSelector));
        
        // Filter by text content
        baseElements = baseElements.filter(el => 
          el.textContent && el.textContent.toLowerCase().includes(textContent.toLowerCase())
        );
        
        // If there's a remaining selector part, apply additional filtering
        if (remainingSelector) {
          // Handle chained :not(:contains()) selectors
          if (remainingSelector.includes(':not(:contains')) {
            const notContainsMatches = [...remainingSelector.matchAll(/:not\(:contains\("([^"]+)"\)\)/g)];
            const excludeTexts = notContainsMatches.map(match => match[1].toLowerCase());
            
            // Filter out elements that contain any of the excluded texts
            baseElements = baseElements.filter(el => {
              const elText = el.textContent ? el.textContent.toLowerCase() : '';
              return !excludeTexts.some(excludeText => elText.includes(excludeText));
            });
          }
        }
        
        elements = baseElements;
      } else {
        // Fallback for simple :contains selectors
        const [sel, text] = selector.split(':contains');
        const textContent = text.replace(/[\(\)"]/g, '');
        elements = [containsText(sel.trim(), textContent)].filter(Boolean);
      }
    } else {
      elements = Array.from(document.querySelectorAll(selector));
    }
  } catch (error) {
    console.log('Auto Cookie Rejector: Selector error for', selector, error);
    return false;
  }
  
  // Sort elements by visibility (visible ones first)
  elements.sort((a, b) => {
    const aVisible = isVisible(a) ? 1 : 0;
    const bVisible = isVisible(b) ? 1 : 0;
    return bVisible - aVisible;
  });
  
  for (const element of elements) {
    try {
      if (isVisible(element)) {
        console.log('Auto Cookie Rejector: Clicking element', element);
        element.click();
        return true;
      } else {
        console.log('Auto Cookie Rejector: Skipping invisible element', element);
      }
    } catch (error) {
      console.log('Auto Cookie Rejector: Click error', error);
    }
  }
  return false;
}

// Debounced execution to prevent multiple runs
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Improved main function to dismiss cookie banners
function dismissCookieBanner() {
  // Prevent multiple executions
  if (processed || processingAttempts >= MAX_ATTEMPTS) {
    return;
  }
  
  processingAttempts++;
  console.log(`Auto Cookie Rejector: Processing attempt ${processingAttempts}`);
  
  // Special handling for YouTube
  if (window.location.hostname.includes('youtube.com')) {
    for (const selector of rejectButtonSelectors) {
      if (selector.includes('ytd-consent') && tryClick(selector)) {
        processed = true;
        console.log('Auto Cookie Rejector: Successfully processed YouTube cookie banner');
        return;
      }
    }
  }
  
  // First, try to find and hide cookie containers
  for (const selector of cookieContainerSelectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (isVisible(element)) {
          console.log('Auto Cookie Rejector: Found cookie container', element);
          
          // Try to click reject buttons within this container
          for (const buttonSelector of rejectButtonSelectors) {
            if (tryClick(buttonSelector)) {
              processed = true;
              console.log('Auto Cookie Rejector: Successfully clicked reject button');
              return;
            }
          }
          
          // If no specific reject button found, try generic buttons
          const buttons = element.querySelectorAll('button');
          for (const button of buttons) {
            const text = button.textContent ? button.textContent.toLowerCase() : '';
            if (text.includes('reject') || text.includes('deny') || text.includes('decline')) {
              if (isVisible(button)) {
                console.log('Auto Cookie Rejector: Clicking generic reject button', button);
                button.click();
                processed = true;
                console.log('Auto Cookie Rejector: Successfully clicked generic reject button');
                return;
              }
            }
          }
        }
      }
    } catch (error) {
      console.log('Auto Cookie Rejector: Error processing container', selector, error);
    }
  }
  
  // Try standalone reject buttons if container approach didn't work
  for (const selector of rejectButtonSelectors) {
    if (!selector.includes('ytd-consent') && tryClick(selector)) {
      processed = true;
      console.log('Auto Cookie Rejector: Successfully clicked standalone reject button');
      return;
    }
  }
  
  // Try again after delay if we haven't processed yet
  if (!processed && processingAttempts < MAX_ATTEMPTS) {
    setTimeout(dismissCookieBanner, RETRY_DELAY);
  }
}

// Observer for dynamically loaded content
const observer = new MutationObserver(debounce(function(mutations) {
  if (!processed && processingAttempts < MAX_ATTEMPTS) {
    dismissCookieBanner();
  }
}, 500));

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Run after a short delay to let page load
setTimeout(() => {
  if (!processed) {
    dismissCookieBanner();
  }
}, 500);

// Additional check after 3 seconds
setTimeout(() => {
  if (!processed) {
    dismissCookieBanner();
  }
}, 3000);

// Final check after 6 seconds for slow loading pages
setTimeout(() => {
  if (!processed) {
    dismissCookieBanner();
  }
}, 6000);

// Cleanup observer when page unloads
window.addEventListener('beforeunload', function() {
  observer.disconnect();
});