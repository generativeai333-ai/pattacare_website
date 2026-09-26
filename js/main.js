/**
 * Patta Care — Interactive Core Engine
 * Handles:
 * 1. Mobile Menu & Sticky Navigation
 * 2. YouTube Video Embed, Click-to-Play & Protocol Fallbacks
 * 3. Regional Solution Tabs (US, UK, CA, IN)
 * 4. Interactive Practice ROI & Impact Calculator
 * 5. Interactive WhatsApp Live Care Simulator (with typing indicators & delivery ticks)
 * 6. Clinician Dashboard Table Filter & Triage
 * 7. FAQ Accordion
 * 8. Consultation Booking Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initVideoPlayer();
  initRegionalTabs();
  initRoiCalculator();
  initWhatsAppSimulator();
  initDashboardFilter();
  initFaqAccordion();
  initDemoForm();
});

/* 1. Navigation */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isVisible = navMenu.style.display === 'flex';
      navMenu.style.display = isVisible ? 'none' : 'flex';
      if (!isVisible) {
        navMenu.style.flexDirection = 'column';
        navMenu.style.position = 'absolute';
        navMenu.style.top = '100%';
        navMenu.style.left = '0';
        navMenu.style.width = '100%';
        navMenu.style.backgroundColor = '#FFFFFF';
        navMenu.style.padding = '1.5rem';
        navMenu.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
        navMenu.style.borderBottom = '1px solid #E2EAF0';
        navMenu.style.zIndex = '999';
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          navMenu.style.display = 'none';
        }
      });
    });
  }
}

/* 2. YouTube Video Embed, Click-to-Play & File:// Fallback Handler */
function initVideoPlayer() {
  const videoOverlay = document.getElementById('video-poster-overlay');
  const videoIframe = document.getElementById('youtube-video-frame');
  const watchHeroBtn = document.getElementById('hero-watch-video-btn');
  const fileProtocolNotice = document.getElementById('file-protocol-notice');

  // Detect if running under file:/// scheme
  const isFileProtocol = window.location.protocol === 'file:';
  if (isFileProtocol && fileProtocolNotice) {
    fileProtocolNotice.style.display = 'flex';
  }

  const playVideo = () => {
    if (!videoIframe) return;

    const dataSrc = videoIframe.getAttribute('data-src') || "https://www.youtube-nocookie.com/embed/Tl5u1xdbeXk?autoplay=1&rel=0&modestbranding=1&enablejsapi=1";
    
    if (videoIframe.src !== dataSrc) {
      videoIframe.src = dataSrc;
    }

    if (videoOverlay) {
      videoOverlay.classList.add('hidden');
    }
  };

  if (videoOverlay) {
    videoOverlay.addEventListener('click', playVideo);
  }

  if (watchHeroBtn) {
    watchHeroBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoSection = document.getElementById('video-overview');
      if (videoSection) {
        videoSection.scrollIntoView({ behavior: 'smooth' });
        setTimeout(playVideo, 450);
      }
    });
  }
}

/* 3. Regional Tabs (USA, UK, Canada, India) */
function initRegionalTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content-panel');

  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      const targetRegion = button.getAttribute('data-region');

      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabPanels.forEach(panel => panel.classList.remove('active'));

      button.classList.add('active');
      const targetPanel = document.getElementById(`panel-${targetRegion}`);
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });
}

/* 4. Interactive ROI & Practice Impact Calculator */
function initRoiCalculator() {
  const patientSlider = document.getElementById('patient-slider');
  const patientCountDisplay = document.getElementById('patient-count-display');
  const currencySelector = document.getElementById('currency-selector');

  const annualRevenueDisplay = document.getElementById('roi-annual-revenue');
  const hoursSavedDisplay = document.getElementById('roi-hours-saved');
  const readmissionPreventedDisplay = document.getElementById('roi-readmissions');

  if (!patientSlider || !annualRevenueDisplay) return;

  const updateCalculations = () => {
    const patients = parseInt(patientSlider.value, 10);
    patientCountDisplay.textContent = `${patients.toLocaleString()} Patients`;

    const currency = currencySelector ? currencySelector.value : 'USD';
    let symbol = '$';
    let ratePerPatientPerYear = 1440; // avg ~$120/month Medicare RPM/CCM reimbursement

    if (currency === 'GBP') {
      symbol = '£';
      ratePerPatientPerYear = 1100;
    } else if (currency === 'CAD') {
      symbol = 'CA$';
      ratePerPatientPerYear = 1500;
    } else if (currency === 'INR') {
      symbol = '₹';
      ratePerPatientPerYear = 18000; // Rs 1500/mo clinic monitoring program
    }

    const grossAnnual = patients * ratePerPatientPerYear;
    const hoursSavedMonthly = Math.round(patients * 1.8);
    const readmissionsAvoided = Math.round(patients * 0.28);

    annualRevenueDisplay.textContent = `${symbol}${grossAnnual.toLocaleString()}`;
    hoursSavedDisplay.textContent = `${hoursSavedMonthly.toLocaleString()} hrs/mo`;
    readmissionPreventedDisplay.textContent = `${readmissionsAvoided.toLocaleString()} patients`;
  };

  patientSlider.addEventListener('input', updateCalculations);
  if (currencySelector) {
    currencySelector.addEventListener('change', updateCalculations);
  }

  updateCalculations();
}

/* 5. Interactive WhatsApp Live Simulator with Typing Indicators */
function initWhatsAppSimulator() {
  const scenarioButtons = document.querySelectorAll('.scenario-btn');
  const chatArea = document.getElementById('live-chat-area');
  const contactStatus = document.querySelector('.phone-contact-status');

  if (!chatArea) return;

  const scenarios = {
    normal: [
      { sender: 'bot', text: 'Good morning, Mr. Sharma! 🌅 Time for your morning Blood Pressure check. Please take a reading using your Patta Care cuff.' },
      { sender: 'patient', text: 'Done! Reading just took with the cuff.' },
      { sender: 'bot', text: '✅ Vitals Received automatically via 4G:\n• Blood Pressure: 122/78 mmHg\n• Pulse: 72 bpm\n\nYour numbers look great today! Doctor Anand’s clinic has been updated. Have a wonderful day!', isData: true }
    ],
    alert: [
      { sender: 'bot', text: 'Good afternoon, Sarah. Please check your blood glucose before lunch.' },
      { sender: 'patient', text: 'Just checked with my cellular meter: 235 mg/dL' },
      { sender: 'bot', text: '⚠️ Reading Alert: 235 mg/dL is elevated above your 180 mg/dL target.\n\n• Please drink a glass of water.\n• We have dispatched an instant alert to Nurse Jennifer on your care dashboard.\n• You will receive a follow-up call within 15 minutes.', isAlert: true }
    ],
    meds: [
      { sender: 'bot', text: 'Reminder: It is 2:00 PM. Please take your afternoon Metformin (500mg) with a meal.' },
      { sender: 'patient', text: 'Taken with lunch, thank you!' },
      { sender: 'bot', text: 'Great job maintaining your streak! 🌟 That is 7 consecutive days of 100% adherence logged.' }
    ]
  };

  const getTime = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  let timeoutIds = [];

  const clearPending = () => {
    timeoutIds.forEach(id => clearTimeout(id));
    timeoutIds = [];
  };

  const renderScenario = (key) => {
    clearPending();
    chatArea.innerHTML = '';
    const messages = scenarios[key] || scenarios.normal;

    messages.forEach((msg, index) => {
      const delay = index === 0 ? 100 : (index * 900);

      const tid = setTimeout(() => {
        // Show typing indicator if bot message
        if (msg.sender === 'bot' && contactStatus) {
          contactStatus.textContent = 'typing...';
          contactStatus.style.color = '#14B8A6';
        }

        setTimeout(() => {
          if (contactStatus) {
            contactStatus.textContent = 'Official Clinical Health Bot';
            contactStatus.style.color = '#8696A0';
          }

          const bubble = document.createElement('div');
          bubble.className = `chat-bubble ${msg.sender}`;
          if (msg.isAlert) bubble.classList.add('alert-highlight');

          const checkmarks = msg.sender === 'patient' ? '<span style="color:#53bdeb; margin-left:4px;">✔✔</span>' : '';
          let innerContent = `<p style="margin:0; white-space: pre-line;">${msg.text}</p>`;
          innerContent += `<span class="chat-time">${getTime()} ${checkmarks}</span>`;

          bubble.innerHTML = innerContent;
          chatArea.appendChild(bubble);
          chatArea.scrollTop = chatArea.scrollHeight;
        }, msg.sender === 'bot' && index > 0 ? 400 : 0);

      }, delay);

      timeoutIds.push(tid);
    });
  };

  scenarioButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      scenarioButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderScenario(btn.getAttribute('data-scenario'));
    });
  });

  // initial render
  renderScenario('normal');
}

/* 6. Clinician Dashboard Table Filter */
function initDashboardFilter() {
  const filterBtns = document.querySelectorAll('.triage-filter-btn');
  const tableRows = document.querySelectorAll('.triage-table tbody tr');

  if (!filterBtns.length || !tableRows.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => {
        b.style.backgroundColor = '#FFFFFF';
        b.style.color = '#0B1F33';
        b.style.borderColor = '#E2EAF0';
      });

      btn.style.backgroundColor = '#1B4B91';
      btn.style.color = '#FFFFFF';
      btn.style.borderColor = '#1B4B91';

      const filter = btn.getAttribute('data-filter');

      tableRows.forEach(row => {
        if (filter === 'all') {
          row.style.display = '';
        } else {
          const rowCategory = row.getAttribute('data-category');
          row.style.display = (rowCategory === filter) ? '' : 'none';
        }
      });
    });
  });
}

/* 7. FAQ Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    questionBtn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/* 8. Demo Request Form */
function initDemoForm() {
  const form = document.getElementById('b2b-demo-form');
  const formSuccess = document.getElementById('form-success-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = 'Scheduling Demonstration...';
      submitBtn.disabled = true;

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 750);
    });
  }
}
