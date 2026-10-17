/**
 * PattaCare — Post-Operative Recovery & Continuous Clinical Visibility Engine
 * Handles:
 * 1. Mobile Menu & Sticky Navigation
 * 2. YouTube Video Embed, Click-to-Play & Protocol Fallbacks
 * 3. Interactive Post-Operative Recovery Demo (Synchronized WhatsApp Simulation ⇄ Care Team Triage)
 * 4. FAQ Accordion
 * 5. Surgical Consultation / Demo Booking Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initVideoPlayer();
  initHeroInteractive();
  initWhitepaperModal();
  initRpmTabs();
  initDeviceFilters();
  initPostOpInteractiveDemo();
  initFaqAccordion();
  initDemoForm();
});

/* RPM 4-Vertical Tab Switcher */
function initRpmTabs() {
  const tabBtns = document.querySelectorAll('.rpm-tab-btn');
  const tabPanes = document.querySelectorAll('.rpm-tab-pane');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabKey = btn.getAttribute('data-tab') || btn.getAttribute('data-target');
      tabBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      tabPanes.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      const targetPane = document.getElementById(`pane-${tabKey}`) || document.getElementById(tabKey);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  // Hero Quick-Jump Pills
  document.querySelectorAll('.hero-vpill').forEach(pill => {
    pill.addEventListener('click', () => {
      const tabTarget = pill.getAttribute('data-target-tab') || pill.getAttribute('data-tab');
      const matchingBtn = document.querySelector(`.rpm-tab-btn[data-tab="${tabTarget}"]`) ||
                          document.querySelector(`.rpm-tab-btn[data-target="${tabTarget}"]`);
      if (matchingBtn) {
        matchingBtn.click();
      }
    });
  });
}

/* Device Category Filter Handler */
function initDeviceFilters() {
  const filterBtns = document.querySelectorAll('.device-filter-btn');
  const deviceCards = document.querySelectorAll('.device-ecosystem-grid .device-card');

  if (!filterBtns.length || !deviceCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      deviceCards.forEach(card => {
        const type = card.getAttribute('data-device-type');
        if (filter === 'all' || type === filter) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.25s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* 1. Sticky Navigation, Dynamic Active ScrollSpy & Mobile Menu */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const mobileToggle = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-menu .nav-link');

  // Sticky header background transition
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Dynamic ScrollSpy: highlight whichever section is currently in view
  const sections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && sections.length) {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            } else {
              link.classList.remove('active');
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(sec => observer.observe(sec));
  }

  // Click handler for instant active state update
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('is-open');
      mobileToggle.setAttribute('aria-expanded', isOpen);
    });

    document.querySelectorAll('.nav-link, .mobile-login-link, .mobile-pilot-link').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth <= 1023) {
          navMenu.classList.remove('is-open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
      });
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth > 1023) {
        navMenu.classList.remove('is-open');
        mobileToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* 2. YouTube Video Embed & Click-to-Play */
function initVideoPlayer() {
  const videoOverlay = document.getElementById('video-poster-overlay');
  const videoIframe = document.getElementById('youtube-video-frame');
  const playBtn = document.getElementById('video-play-btn');

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

  if (playBtn) {
    playBtn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playVideo();
      }
    });
  }
}

/* 3. Interactive RPM Product Demo: Multichannel Patient Experience ⇄ Clinician Triage */
function initPostOpInteractiveDemo() {
  const pillChronic = document.getElementById('pill-chronic');
  const pillPostop = document.getElementById('pill-postop');
  const pillAdherence = document.getElementById('pill-adherence');
  const scenarioPills = [pillChronic, pillPostop, pillAdherence].filter(Boolean);

  const chatArea = document.getElementById('live-chat-area');
  const phoneStatus = document.getElementById('phone-status-text');

  // Triage Card Elements
  const triageBanner = document.getElementById('triage-status-banner');
  const triageLabel = document.getElementById('triage-status-label');
  const triageIndicator = document.getElementById('triage-status-indicator');
  const triagePatient = document.getElementById('triage-patient-name');
  const triageTimeline = document.getElementById('triage-timeline');
  const triagePain = document.getElementById('triage-pain-score');
  const triageMobility = document.getElementById('triage-mobility');
  const triageVitals = document.getElementById('triage-vitals');
  const triageActionTitle = document.getElementById('triage-action-title');
  const triageActionText = document.getElementById('triage-action-text');

  if (!chatArea) return;

  const scenarios = {
    'chronic': {
      messages: [
        { sender: 'bot', text: 'Good morning, Mr. David Chen. Morning cellular BP reading recorded: 158/98 mmHg. This is elevated above your 135/85 target. Are you experiencing any headaches or blurred vision?' },
        { sender: 'patient', text: 'Mild headache since waking up. Forgot to take my Amlodipine dose yesterday evening.' },
        { sender: 'bot', text: '⚠️ Alert logged. Please take your prescribed morning dose now and rest quietly. Dr. Rao’s cardiology nurse coordinator has been alerted for medication titration review.', isAlert: true }
      ],
      triage: {
        bannerClass: 'observation',
        label: 'STATUS: CHRONIC HYPERTENSION — MEDICATION TITRATION',
        indicator: '▲ Titration Review Queued',
        patient: 'David Chen • Age 62 • Essential Hypertension & Dyslipidemia',
        timeline: 'Week 8 Chronic Care Cohort',
        pain: 'Mild cephalalgia (Headache) noted',
        mobility: 'Ambulatory • No chest discomfort or shortness of breath',
        vitals: 'BP: 158/98 mmHg (3-day rolling avg: 148/94) • HR: 82 bpm',
        actionTitle: 'Cardiology Coordinator Action:',
        actionText: 'Outreach queued. Review adherence log and confirm morning dose. Schedule virtual titration review if evening BP remains >140/90.'
      }
    },
    'postop': {
      messages: [
        { sender: 'bot', text: 'Good morning, Mrs. Vance! 🌅 It is Post-Op Day 4 for your Total Knee Replacement. How is your surgical incision looking today, and what is your current pain level from 0 to 10?' },
        { sender: 'patient', text: 'Incision is clean and dry with no redness. Pain is around 2/10 after gentle physiotherapy.' },
        { sender: 'bot', text: '✅ Excellent recovery milestone! Pain score 2/10 and mobility are on track. Dr. Mitchell’s surgical team has been updated. Structured SBAR summary synced to hospital EHR.', isData: true }
      ],
      triage: {
        bannerClass: 'on-track',
        label: 'STATUS: SURGICAL RECOVERY — ON TRACK',
        indicator: '● Milestone Met',
        patient: 'Eleanor Vance • Total Knee Arthroplasty (TKA)',
        timeline: 'Post-Op Day 4 (POD 4)',
        pain: '2 / 10 (Controlled with oral analgesia)',
        mobility: 'Incision clean & dry • Physiotherapy exercises completed',
        vitals: 'Temp: 98.4°F (Afebrile) • HR: 74 bpm • SpO2: 99%',
        actionTitle: 'Surgical Team Protocol:',
        actionText: 'No intervention required. 30-day readmission risk: LOW. Next automated recovery check-in scheduled for tomorrow at 09:00 AM.'
      }
    },
    'adherence': {
      messages: [
        { sender: 'bot', text: 'Hello, Mrs. Sarah Jenkins. 💊 Reminder: Evening Metformin (500mg) & Atorvastatin (20mg). Smart pill box has not registered an opening. Have you taken your medication?' },
        { sender: 'patient', text: 'Just took it right now! Also noticed I only have 3 days of Metformin strips left.' },
        { sender: 'bot', text: '✅ Dose confirmed and logged! We have initiated your 30-day Metformin auto-refill request with Apollo Pharmacy. Delivery estimated by tomorrow afternoon.', isData: true }
      ],
      triage: {
        bannerClass: 'on-track',
        label: 'STATUS: MEDICATION ADHERENCE — DOSE CONFIRMED & REFILL QUEUED',
        indicator: '● Refill Automated',
        patient: 'Sarah Jenkins • Type 2 Diabetes & Cardiovascular Risk',
        timeline: 'Month 4 Adherence Program',
        pain: 'Nil • Patient feeling energetic',
        mobility: 'Normal active routine',
        vitals: 'CGM Time-In-Range: 86% • Fasting Glucose: 112 mg/dL',
        actionTitle: 'Care Coordinator Summary:',
        actionText: '96% monthly adherence compliance. Auto-refill order #PC-9842 transmitted to pharmacy partner. No nurse callback needed.'
      }
    }
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

  const applyTriageState = (triageData) => {
    if (!triageBanner) return;
    triageBanner.className = `triage-status-banner ${triageData.bannerClass}`;
    if (triageLabel) triageLabel.textContent = triageData.label;
    if (triageIndicator) triageIndicator.textContent = triageData.indicator;
    if (triagePatient) triagePatient.textContent = triageData.patient;
    if (triageTimeline) triageTimeline.textContent = triageData.timeline;
    if (triagePain) triagePain.textContent = triageData.pain;
    if (triageMobility) triageMobility.textContent = triageData.mobility;
    if (triageVitals) triageVitals.textContent = triageData.vitals;
    if (triageActionTitle) triageActionTitle.textContent = triageData.actionTitle;
    if (triageActionText) triageActionText.textContent = triageData.actionText;
  };

  const renderScenario = (key) => {
    clearPending();
    chatArea.innerHTML = '';
    const scenario = scenarios[key] || scenarios['chronic'];

    // Update Right Side (Triage Card) immediately
    applyTriageState(scenario.triage);

    // Update Left Side (WhatsApp Chat Simulation) with staggered typing
    scenario.messages.forEach((msg, index) => {
      const delay = index === 0 ? 100 : (index * 850);

      const tid = setTimeout(() => {
        if (msg.sender === 'bot' && phoneStatus) {
          phoneStatus.textContent = 'typing...';
          phoneStatus.style.color = '#1B6A7D';
        }

        setTimeout(() => {
          if (phoneStatus) {
            phoneStatus.textContent = 'Official Clinical Bot';
            phoneStatus.style.color = '#8696A0';
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
        }, msg.sender === 'bot' && index > 0 ? 350 : 0);

      }, delay);

      timeoutIds.push(tid);
    });
  };

  scenarioPills.forEach(pill => {
    pill.addEventListener('click', () => {
      scenarioPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const scenarioKey = pill.getAttribute('data-scenario');
      renderScenario(scenarioKey);
    });
  });

  // Initial render with 'chronic'
  renderScenario('chronic');
}

/* 4. Frequently Asked Questions (FAQ) Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => {
          i.classList.remove('active');
          const btn = i.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        });
        if (!isActive) {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });
}

/* 5. B2B Consultation / Demo Booking Form */
function initDemoForm() {
  const form = document.getElementById('b2b-demo-form');
  const formSuccess = document.getElementById('form-success-message');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Scheduling Demonstration...</span>';
        submitBtn.disabled = true;
      }

      setTimeout(() => {
        form.style.display = 'none';
        if (formSuccess) {
          formSuccess.style.display = 'block';
        }
      }, 700);
    });
  }
}

/* 6. Hero Interactive WhatsApp Buttons & Single-Line SBAR Triage Simulation */
function initHeroInteractive() {
  const btnOk = document.getElementById('hero-wa-tap-ok');
  const btnSymptom = document.getElementById('hero-wa-tap-symptom');
  const sbarText = document.getElementById('hero-sbar-text');
  const news2Badge = document.querySelector('.cockpit-bottom-triage .badge-status-news2');

  if (!btnOk || !btnSymptom || !sbarText) return;

  btnOk.addEventListener('click', () => {
    btnOk.classList.add('active');
    btnSymptom.classList.remove('active');
    sbarText.innerHTML = '<strong>Auto-Drafted SBAR:</strong> BP 128/82 mmHg within JNC-8 target. Adherence 100% (7/7). Zero red-flags. Synced to EHR.';
    if (news2Badge) {
      news2Badge.textContent = 'NEWS2 Score: 0 (Normal)';
      news2Badge.style.color = '#065F46';
      news2Badge.style.backgroundColor = '#D1FAE5';
      news2Badge.style.borderColor = '#A7F3D0';
    }
  });

  btnSymptom.addEventListener('click', () => {
    btnSymptom.classList.add('active');
    btnOk.classList.remove('active');
    sbarText.innerHTML = '<strong>Auto-Drafted SBAR:</strong> SBP surge >160 mmHg reported with mild cephalalgia. Escalation timer: 15m. Outreach call queued.';
    if (news2Badge) {
      news2Badge.textContent = 'NEWS2 Score: 3 (Watch Alert)';
      news2Badge.style.color = '#92400E';
      news2Badge.style.backgroundColor = '#FEF3C7';
      news2Badge.style.borderColor = '#FDE68A';
    }
  });
}

/* 7. Clinical Whitepaper Modal Handler */
function initWhitepaperModal() {
  const openBtn = document.getElementById('open-whitepaper-btn');
  const modal = document.getElementById('whitepaper-modal');
  const closeBtn = document.getElementById('close-whitepaper-btn');
  const backdrop = document.getElementById('whitepaper-modal-backdrop');
  const form = document.getElementById('whitepaper-form');
  const successMsg = document.getElementById('whitepaper-success');
  const proceedBtn = document.getElementById('wp-proceed-demo');

  if (!modal) return;

  const openModal = (e) => {
    if (e) e.preventDefault();
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeModal();
    }
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.innerHTML = '<span>Authorizing Download...</span>';
        submitBtn.disabled = true;
      }
      setTimeout(() => {
        form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'flex';
      }, 600);
    });
  }

  if (proceedBtn) {
    proceedBtn.addEventListener('click', () => {
      closeModal();
    });
  }
}

