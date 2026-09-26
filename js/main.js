/**
 * PattaCare — Post-Operative Recovery & Continuous Clinical Visibility Engine
 * Handles:
 * 1. Mobile Menu & Sticky Navigation
 * 2. YouTube Video Embed, Click-to-Play & Protocol Fallbacks
 * 3. Interactive Post-Operative Recovery Demo (Synchronized WhatsApp Simulation ⇄ Care Team Triage)
 * 4. Care Team Capacity & Workload Estimator
 * 5. FAQ Accordion
 * 6. Surgical Consultation / Demo Booking Form Handling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initVideoPlayer();
  initPostOpInteractiveDemo();
  initCapacityEstimator();
  initFaqAccordion();
  initDemoForm();
});

/* 1. Sticky Navigation & Mobile Menu */
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
}

/* 3. Interactive Post-Op Product Demo: Patient Check-In ⇄ Surgical Care Team Triage */
function initPostOpInteractiveDemo() {
  const pillOnTrack = document.getElementById('pill-on-track');
  const pillObservation = document.getElementById('pill-observation');
  const pillReview = document.getElementById('pill-review');
  const scenarioPills = [pillOnTrack, pillObservation, pillReview].filter(Boolean);

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
    'on-track': {
      messages: [
        { sender: 'bot', text: 'Good morning, Mrs. Vance! 🌅 It is Post-Op Day 3 for your Knee Replacement. How is your surgical incision looking today, and what is your current pain level from 0 to 10?' },
        { sender: 'patient', text: 'Incision is clean and dry with no redness. Pain is around 2/10 after my morning walk with the walker.' },
        { sender: 'bot', text: '✅ Great recovery progress! Your pain is well managed and mobility is on track. Dr. Mitchell’s surgical team has been updated. Keep up your gentle exercises!', isData: true }
      ],
      triage: {
        bannerClass: 'on-track',
        label: 'STATUS: ON TRACK — ROUTINE RECOVERY',
        indicator: '● Stable',
        patient: 'Eleanor Vance • Total Knee Arthroplasty (TKA)',
        timeline: 'Post-Op Day 3 (POD 3)',
        pain: '2 / 10 (Within expected baseline)',
        mobility: 'Incision clean & dry • Ambulatory with walker',
        vitals: 'BP: 124/80 mmHg • Temp: 98.4°F (Afebrile)',
        actionTitle: 'Recommended Clinical Step:',
        actionText: 'No intervention required. Patient is meeting all clinical recovery milestones. Next automated check-in scheduled for tomorrow at 09:00 AM.'
      }
    },
    'observation': {
      messages: [
        { sender: 'bot', text: 'Good morning, Mr. David Chen. It is Post-Op Day 5 following your laparoscopic hernia repair. Are you experiencing any new swelling, warmth, or change in pain?' },
        { sender: 'patient', text: 'Notice slight swelling around the lower incision this morning. Pain went up from 2 to 4.' },
        { sender: 'bot', text: 'Thank you for noting this, Mr. Chen. We have logged the mild swelling and pain shift (4/10). Nurse Sarah has been alerted for observation. Please elevate and ice the area for 20 mins. We will check back this afternoon.', isAlert: true }
      ],
      triage: {
        bannerClass: 'observation',
        label: 'STATUS: FLAGGED FOR OBSERVATION',
        indicator: '▲ Observation Queued',
        patient: 'David Chen • Laparoscopic Inguinal Hernia Repair',
        timeline: 'Post-Op Day 5 (POD 5)',
        pain: '4 / 10 (Mild elevation from baseline 2/10)',
        mobility: 'Mild localized swelling noted • Ambulation intact',
        vitals: 'BP: 130/84 mmHg • Temp: 98.8°F (Normal)',
        actionTitle: 'Recommended Clinical Step:',
        actionText: 'Care coordinator review recommended. Send follow-up wound check prompt via WhatsApp at 14:00. No immediate in-person clinic visit indicated.'
      }
    },
    'review': {
      messages: [
        { sender: 'bot', text: 'Hello, Sarah Jenkins. It is Post-Op Day 6 following your spinal decompression. How are your symptoms feeling today?' },
        { sender: 'patient', text: 'Having sharp pain 7/10 since yesterday evening and feeling slightly feverish. Temperature is 100.8°F.' },
        { sender: 'bot', text: '⚠️ Priority Clinical Alert: Your temperature (100.8°F) and pain score (7/10) have been escalated directly to Dr. Aris’s surgical triage coordinator. Nurse Mark will call you within 15 minutes to evaluate next steps.', isAlert: true }
      ],
      triage: {
        bannerClass: 'review-needed',
        label: 'STATUS: CARE-TEAM REVIEW RECOMMENDED',
        indicator: '● Immediate Review Recommended',
        patient: 'Sarah Jenkins • Lumbar Microdiscectomy (Spine)',
        timeline: 'Post-Op Day 6 (POD 6)',
        pain: '7 / 10 (Abrupt pain escalation)',
        mobility: 'Localized discomfort • Patient reports chills',
        vitals: 'BP: 142/90 mmHg • Temp: 100.8°F (Low-grade pyrexia)',
        actionTitle: 'Recommended Clinical Step:',
        actionText: 'Prioritized clinical callback recommended. Surgical coordinator triage call queued. Review incision photo or coordinate same-day clinic evaluation.'
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
    const scenario = scenarios[key] || scenarios['on-track'];

    // Update Right Side (Triage Card) immediately
    applyTriageState(scenario.triage);

    // Update Left Side (WhatsApp Chat Simulation) with staggered typing
    scenario.messages.forEach((msg, index) => {
      const delay = index === 0 ? 100 : (index * 850);

      const tid = setTimeout(() => {
        if (msg.sender === 'bot' && phoneStatus) {
          phoneStatus.textContent = 'typing...';
          phoneStatus.style.color = '#14B8A6';
        }

        setTimeout(() => {
          if (phoneStatus) {
            phoneStatus.textContent = 'Official Clinical Recovery Bot';
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

  // Initial render with 'on-track'
  renderScenario('on-track');
}

/* 4. Care Team Capacity & Workload Estimator */
function initCapacityEstimator() {
  const patientSlider = document.getElementById('capacity-patient-slider');
  const patientDisplay = document.getElementById('capacity-patient-display');
  const hoursStreamlinedDisplay = document.getElementById('capacity-hours-streamlined');
  const completionRateDisplay = document.getElementById('capacity-completion-rate');
  const complicationsFlaggedDisplay = document.getElementById('capacity-complications-flagged');

  if (!patientSlider || !hoursStreamlinedDisplay) return;

  const updateCapacityMath = () => {
    const patients = parseInt(patientSlider.value, 10);
    if (patientDisplay) {
      patientDisplay.textContent = `${patients.toLocaleString()} Patients`;
    }

    // Mathematical modeling for post-operative recovery:
    // ~1.2 hours saved per patient/month in routine phone tag, voicemails, and manual status intake
    const hoursStreamlined = Math.round(patients * 1.2);
    // Typical WhatsApp recovery completion rate is ~91%
    const completionRate = '91% Adherence';
    // ~12% of surgical cohort has early symptom deviation flagged for observation/review
    const earlyAlerts = Math.round(patients * 0.12);

    hoursStreamlinedDisplay.textContent = `${hoursStreamlined.toLocaleString()} Hours`;
    if (completionRateDisplay) {
      completionRateDisplay.textContent = completionRate;
    }
    if (complicationsFlaggedDisplay) {
      complicationsFlaggedDisplay.textContent = `~${earlyAlerts.toLocaleString()} Patients / mo`;
    }
  };

  patientSlider.addEventListener('input', updateCapacityMath);
  updateCapacityMath();
}

/* 5. Frequently Asked Questions (FAQ) Accordion */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

/* 6. B2B Consultation / Demo Booking Form */
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
