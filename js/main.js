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
  initDeviceDrawer();
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

/* 8. Connected Medical Devices — Side-Drawer Specs Handler */
function initDeviceDrawer() {
  const overlay = document.getElementById('device-drawer-overlay');
  const backdrop = document.getElementById('device-drawer-backdrop');
  const closeBtn = document.getElementById('drawer-close-btn');
  const drawerIcon = document.getElementById('drawer-device-icon');
  const drawerTag = document.getElementById('drawer-category-tag');
  const drawerTitle = document.getElementById('drawer-device-title');
  const drawerContent = document.getElementById('drawer-device-content');
  const requestSampleBtn = document.getElementById('drawer-request-sample');
  const triggers = document.querySelectorAll('.device-drawer-trigger');

  if (!overlay || !drawerContent) return;

  const deviceSpecsData = {
    mat: {
      name: 'Contactless Bed Mat',
      icon: '🛏️',
      category: 'Contactless Radar / BCG',
      summary: 'Passive ballistocardiography (BCG) sensor placed under standard hospital or home mattresses. Continuously streams micro-vibrations to derive continuous heart rate, respiratory rate, and bed occupancy with zero patient compliance burden.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Continuous Telemetry', val: 'Heart Rate (35–180 bpm) & Respiration (6–40 rpm)' },
            { label: 'Clinical Accuracy', val: 'Dozee BCG clinical standard (±2 bpm)' },
            { label: 'Target Cohorts', val: 'Inpatient Step-Down, Post-Op Surgical, Early Deterioration' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Transmission Mode', val: 'Cellular IoT Gateway (4G / LTE-M) + Wi-Fi fallback' },
            { label: 'HL7 FHIR R4', val: 'Observation (LOINC 8867-4 Heart Rate, 9279-1 Resp Rate)' },
            { label: 'Ingestion Latency', val: 'Sub-minute continuous sync to Epic / Cerner' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Power Supply', val: 'AC power adapter + 4-hour internal battery backup' },
            { label: 'Mattress Tolerance', val: 'Compatible with spring, foam, & latex up to 14" thickness' },
            { label: 'Patient Effort', val: 'Zero: completely passive, wire-free, wear-free' },
            { label: 'Certifications', val: 'CDSCO Class B, CE Mark, ISO 13485' }
          ]
        }
      ]
    },
    bp: {
      name: 'Cellular 4G BP Cuff',
      icon: '🩺',
      category: 'Cellular (4G / LTE-M)',
      summary: 'Hospital-grade automated digital blood pressure monitor with integrated multi-IMSI cellular modem. Transmits systolic, diastolic, and pulse rate readings instantly upon cuff deflation with zero patient configuration.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Measurement Range', val: 'Sys: 60–260 mmHg, Dia: 40–199 mmHg, Pulse: 40–180 bpm' },
            { label: 'Clinical Accuracy', val: 'Pressure: ±3 mmHg, Pulse: ±5% of reading (AAMI/ESH)' },
            { label: 'Clinical Algorithms', val: 'Irregular Heartbeat Detection (IHB) & MAP calculation' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Transmission Mode', val: 'Direct cellular Cat-M1/NB-IoT (No Bluetooth / Wi-Fi needed)' },
            { label: 'HL7 FHIR R4', val: 'Observation (LOINC 85354-9 Blood pressure panel with MAP)' },
            { label: 'Offline Buffer', val: 'Stores up to 120 readings if network is temporarily unreachable' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Power Supply', val: '4x AA Alkaline batteries (~12 months at 2 checks/day)' },
            { label: 'Cuff Sizes', val: 'Standard (22–42 cm) and Extra-Large (32–52 cm) bariatric' },
            { label: 'Carrier Redundancy', val: 'Pre-activated eSIM with global roaming failover' },
            { label: 'Certifications', val: 'FDA 510(k) Cleared, CE Class IIa, CDSCO Registered' }
          ]
        }
      ]
    },
    glucose: {
      name: 'Continuous CGM & Glucometer',
      icon: '🩸',
      category: 'Cloud API & BLE',
      summary: 'Bi-directional ingestion gateway supporting leading Continuous Glucose Monitors (Dexcom G7, Abbott FreeStyle Libre) alongside direct cellular strip-based glucometers for comprehensive glycemic surveillance.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Continuous Metrics', val: 'Time-in-Range (70–180 mg/dL), GMI, Glycemic Variability' },
            { label: 'Sensor Precision', val: 'MARD: 8.2% across hypoglycemia and hyperglycemia tiers' },
            { label: 'Clinical Triggers', val: 'Automated urgent low (<54 mg/dL) & acute surge (>250 mg/dL)' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Ingestion Architecture', val: 'Dexcom & Abbott Official Cloud APIs + Cellular Strip SDK' },
            { label: 'HL7 FHIR R4', val: 'Observation (LOINC 15074-8 Glucose in blood)' },
            { label: 'Update Cadence', val: 'Every 5 minutes for CGM; instant on cellular strip test' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Sensor Wear Duration', val: '10 to 14 days per water-resistant CGM sensor' },
            { label: 'Strip Auto-Resupply', val: 'Automated fulfillment webhook triggered when strips <15' },
            { label: 'Certifications', val: 'FDA 510(k), CE Class IIb, CDSCO Class C' }
          ]
        }
      ]
    },
    pulse: {
      name: 'Connected Pulse Oximeter',
      icon: '🫁',
      category: 'Bluetooth Low Energy',
      summary: 'Clinical fingertip pulse oximeter and peak flow sensor designed for rapid spot checks in post-surgical recovery, COPD, and respiratory failure cohorts.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Parameters', val: 'Oxygen Saturation (SpO2 %), Pulse Rate (bpm), Perfusion Index (PI)' },
            { label: 'Accuracy Range', val: 'SpO2: 70%–100% (±2%), Pulse: 30–250 bpm (±2 bpm)' },
            { label: 'Motion Tolerance', val: 'Low-perfusion & motion artifact suppression algorithms' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Transmission Mode', val: 'Bluetooth 5.2 Low Energy / Instant companion bridge' },
            { label: 'HL7 FHIR R4', val: 'Observation (LOINC 2708-6 Oxygen Saturation, 8867-4 Heart Rate)' },
            { label: 'Transmission Time', val: 'Under 8 seconds from probe insertion to EHR chart' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Battery Life', val: '2x AAA batteries (over 1,200 spot-check sessions)' },
            { label: 'Display & Ergonomics', val: 'Dual-color OLED with plethysmograph waveform' },
            { label: 'Certifications', val: 'FDA 510(k), CE Class IIa, ISO 80601-2-61' }
          ]
        }
      ]
    },
    scale: {
      name: 'Cellular Telehealth Scale',
      icon: '⚖️',
      category: 'Cellular (4G / LTE-M)',
      summary: 'Precision direct-to-cloud body scale built specifically for congestive heart failure and bariatric post-op surveillance. Automatically flags 48-hour fluid weight surges to prevent avoidable readmissions.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Sensory Precision', val: '100g (0.2 lb) resolution with 4 strain-gauge load cells' },
            { label: 'Capacity', val: 'Up to 250 kg (550 lbs) tempered safety glass platform' },
            { label: 'Decompensation Rule', val: 'Auto-alerts care team if weight increases >2 kg in 48 hours' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Transmission Mode', val: 'Cellular Cat-M1 / LTE-M direct transmission' },
            { label: 'HL7 FHIR R4', val: 'Observation (LOINC 29463-7 Body weight, 39156-5 BMI)' },
            { label: 'Zero Setup', val: 'Pre-activated SIM, zero Wi-Fi pairing required' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Battery Life', val: '4x AA Alkaline batteries (14+ months at daily weighing)' },
            { label: 'Memory Buffer', val: 'Offline buffer for up to 60 weigh-ins' },
            { label: 'Certifications', val: 'FDA 510(k) Class II, CE Class IIa, CDSCO Class B' }
          ]
        }
      ]
    },
    dispenser: {
      name: 'Connected Smart Pill Box',
      icon: '💊',
      category: 'IoT Smart Dispenser',
      summary: 'Cellular smart medication dispenser with guided LED compartment illumination and magnetic opening detection. Bridges the medication adherence gap for complex geriatric and polypharmacy cohorts.',
      groups: [
        {
          title: 'Clinical Parameters & Precision',
          rows: [
            { label: 'Dose Tracking', val: 'Automated compartment opening timestamp logging' },
            { label: 'Nudge Hierarchy', val: '1. Chime & LED ➔ 2. WhatsApp prompt ➔ 3. Nurse outreach' },
            { label: 'Adherence Scoring', val: 'PDC (Proportion of Days Covered) calculated daily' }
          ]
        },
        {
          title: 'Ingestion & EHR Interoperability',
          rows: [
            { label: 'Transmission Mode', val: 'Cellular IoT module with real-time event webhooks' },
            { label: 'HL7 FHIR R4', val: 'MedicationAdministration & MedicationStatement' },
            { label: 'Tamper Alerts', val: 'Detects unexpected off-schedule opening and tilt events' }
          ]
        },
        {
          title: 'Hardware & Certifications',
          rows: [
            { label: 'Compartments', val: '7 or 28 customizable dosage pods with moisture sealing' },
            { label: 'Battery Life', val: 'Rechargeable Li-Ion (30 days per USB-C charge)' },
            { label: 'Refill Automation', val: 'Pharmacy auto-resupply trigger on low pill count' },
            { label: 'Certifications', val: 'FCC, CE, HIPAA/GDPR encrypted transmission' }
          ]
        }
      ]
    }
  };

  const openDrawer = (deviceId) => {
    const data = deviceSpecsData[deviceId] || deviceSpecsData.bp;
    drawerIcon.textContent = data.icon;
    drawerTag.textContent = data.category;
    drawerTitle.textContent = data.name;

    let html = `<div class="drawer-summary-box">${data.summary}</div>`;

    data.groups.forEach(group => {
      html += `
        <div class="drawer-spec-group">
          <div class="drawer-group-title">${group.title}</div>
          <div class="drawer-spec-table">
            ${group.rows.map(r => `
              <div class="drawer-spec-row">
                <span class="drawer-spec-label">${r.label}</span>
                <span class="drawer-spec-val">${r.val}</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    drawerContent.innerHTML = html;
    overlay.classList.add('active');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    overlay.classList.remove('active');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-device-id');
      openDrawer(id);
    });
  });

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeDrawer();
    }
  });

  if (requestSampleBtn) {
    requestSampleBtn.addEventListener('click', () => {
      closeDrawer();
    });
  }
}


