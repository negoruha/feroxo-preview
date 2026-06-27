/* Feroxo landing-page reliability layer.
   Keeps the approved home interactions independent from the shared page script. */
(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

  const setBodyLocked = (locked) => {
    document.body.style.overflow = locked ? 'hidden' : '';
  };

  /* Local on-site video. No homepage video interaction may navigate externally. */
  const videoModal = $('[data-modal="home-video"]');
  const videoPlayer = $('[data-home-video]');

  const openLocalVideo = async () => {
    if (!videoModal || !videoPlayer) return;
    videoModal.classList.add('is-open');
    videoModal.setAttribute('aria-hidden', 'false');
    setBodyLocked(true);

    try {
      videoPlayer.currentTime = 0;
      videoPlayer.muted = false;
      await videoPlayer.play();
    } catch (_) {
      /* Browser controls remain available when an autoplay policy blocks sound. */
      videoPlayer.controls = true;
    }
  };

  const closeLocalVideo = () => {
    if (!videoModal || !videoPlayer) return;
    videoPlayer.pause();
    videoPlayer.currentTime = 0;
    videoModal.classList.remove('is-open');
    videoModal.setAttribute('aria-hidden', 'true');
    setBodyLocked(false);
  };

  document.addEventListener('click', (event) => {
    const trigger = event.target.closest('[data-open-home-video], .built-industry__video-card');
    if (!trigger) return;

    event.preventDefault();
    event.stopPropagation();
    openLocalVideo();
  }, true);

  $$('[data-close-home-video]').forEach((button) => {
    button.addEventListener('click', closeLocalVideo);
  });

  /* The hero remains a carousel, but clicking any visual slide launches the
     local project video instead of following an outbound destination. */
  $$('[data-hero-play]').forEach((slide) => {
    slide.addEventListener('dblclick', (event) => {
      event.preventDefault();
      openLocalVideo();
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeLocalVideo();
  });

  /* Full, visible English / Czech switching for the landing page. */
  const copy = {
    en: {
      nav: ['About Us', 'Products', 'Service', 'Resources', 'Contact'],
      request: 'Make Request',
      builtTitle: 'BUILT FOR<br>INDUSTRY',
      builtText: 'From advanced welding systems to reliable diesel generators — find equipment tailored for modern industrial operations.',
      builtButton: 'See Equipment',
      newsTitle: 'LATEST NEWS &amp; ARTICLES',
      seeAll: 'See All',
      footerCompany: 'Company',
      footerLinks: ['About Us', 'Products', 'Service', 'Resources', 'Contact'],
      requestTitle: 'MAKE<br>REQUEST',
      requestText: 'Tell us about your project and we will help you select the right Feroxo equipment.',
      selected: 'Selected Equipment',
      equipmentHelp: 'Not sure what you need yet?<br>Browse our equipment catalog<br>or leave this section empty',
      browse: 'Browse Equipment',
      send: 'Send Request',
      privacy: 'By submitting this form you agree to our <a href="pages/privacy-policy.html">Privacy Policy</a>. We never share data with third parties.',
      strengths: [
        ['TRUE JAPANESE<br>MANUFACTURING', 'Not assembled — engineered'],
        ['BUILT FOR THE WORST —<br>PERFORMS LIKE THE BEST', 'Spill containment. No shelter required'],
        ['PRECISE ARC WITH INSTANT<br>PROCESS RESPONSE', 'Advanced IGBT inverter — CC, CV, TIG, Droop, Gouging'],
        ['ONE ENGINE WITH DUAL<br>WELDING POWER', 'Real Dual — 2 independent posts + 12 kVA AC simultaneously'],
        ['UP TO 5× LOWER FUEL<br>CONSUMPTION', 'ROI from fuel savings in 3–12 months'],
        ['QUIET PERFORMANCE FOR DAY &amp;<br>NIGHT OPERATION', '92 dB(A) LWA — certified EU 2000/14/ES'],
        ['STAGE V READY FOR EU<br>DEPLOYMENT', 'Kubota D902 — certified Stage V across the whole EU'],
        ['3-YEAR WARRANTY WITH<br>CZECH SERVICE SUPPORT', 'Fast support. Spare parts. European service coverage']
      ]
    },
    cz: {
      nav: ['O nás', 'Produkty', 'Servis', 'Zdroje', 'Kontakt'],
      request: 'Odeslat poptávku',
      builtTitle: 'VYTVOŘENO PRO<br>PRŮMYSL',
      builtText: 'Od pokročilých svařovacích systémů po spolehlivé dieselové generátory — najděte zařízení pro moderní průmyslový provoz.',
      builtButton: 'Zobrazit vybavení',
      newsTitle: 'NEJNOVĚJŠÍ ZPRÁVY A ČLÁNKY',
      seeAll: 'Zobrazit vše',
      footerCompany: 'Společnost',
      footerLinks: ['O nás', 'Produkty', 'Servis', 'Zdroje', 'Kontakt'],
      requestTitle: 'ODESLAT<br>POPTÁVKU',
      requestText: 'Napište nám krátkou poptávku a pomůžeme vám vybrat správné vybavení Feroxo.',
      selected: 'Vybrané vybavení',
      equipmentHelp: 'Nejste si jistí, co potřebujete?<br>Projděte si náš katalog vybavení<br>nebo tuto část nechte prázdnou',
      browse: 'Procházet vybavení',
      send: 'Odeslat poptávku',
      privacy: 'Odesláním formuláře souhlasíte s <a href="pages/privacy-policy.html">ochranou soukromí</a>. Vaše údaje nikdy nesdílíme s třetími stranami.',
      strengths: [
        ['PRAVÁ JAPONSKÁ<br>VÝROBA', 'Ne pouze sestaveno — precizně navrženo'],
        ['PRO NEJTĚŽŠÍ PODMÍNKY —<br>NEJLEPŠÍ VÝKON', 'Ochrana proti úniku. Není potřeba přístřešek'],
        ['PŘESNÝ OBLOUK S RYCHLOU<br>ODEZVOU PROCESU', 'Pokročilý IGBT invertor — CC, CV, TIG, Droop, Gouging'],
        ['JEDEN MOTOR, DVA<br>SVAŘOVACÍ VÝSTUPY', 'Real Dual — 2 nezávislá stanoviště + 12 kVA AC'],
        ['AŽ 5× NIŽŠÍ SPOTŘEBA<br>PALIVA', 'Návratnost díky úsporám paliva za 3–12 měsíců'],
        ['TICHÝ PROVOZ VE DNE<br>I V NOCI', '92 dB(A) LWA — certifikováno podle EU 2000/14/ES'],
        ['STAGE V PRO NASAZENÍ<br>V EU', 'Kubota D902 — certifikace Stage V v celé EU'],
        ['3 ROKY ZÁRUKY S<br>ČESKOU SERVISNÍ PODPOROU', 'Rychlá pomoc. Náhradní díly. Evropské pokrytí']
      ]
    }
  };

  const setText = (selector, value, html = false) => {
    const node = $(selector);
    if (!node || value == null) return;
    if (html) node.innerHTML = value;
    else node.textContent = value;
  };

  const renderLanguage = (language) => {
    const lang = language === 'cz' ? 'cz' : 'en';
    const text = copy[lang];
    document.documentElement.lang = lang === 'cz' ? 'cs' : 'en';
    document.documentElement.dataset.language = lang;
    try { localStorage.setItem('feroxo-language', lang); } catch (_) {}

    $$('.site-nav__link').forEach((node, index) => {
      if (text.nav[index]) node.textContent = text.nav[index];
    });
    setText('.home-page .request-button', text.request);
    setText('.home-page .built-industry__content h2', text.builtTitle, true);
    setText('.home-page .built-industry__content p', text.builtText);
    setText('.home-page .built-industry__button', text.builtButton);
    setText('.home-page .latest-news__heading h2', text.newsTitle, true);
    setText('.home-page .latest-news__heading a', text.seeAll);

    const cards = $$('.home-page [data-strength-card]');
    cards.forEach((card, index) => {
      const current = text.strengths[index];
      if (!current) return;
      const [title, eyebrow] = current;
      const h2 = $('.strength-card__content h2', card);
      const label = $('.strength-card__eyebrow', card);
      if (h2) h2.innerHTML = title;
      if (label) label.textContent = eyebrow;
    });

    const footerFirstColumn = $$('.home-page .site-footer__column')[0];
    if (footerFirstColumn) {
      const heading = $('h3', footerFirstColumn);
      if (heading) heading.textContent = text.footerCompany;
      $$('a', footerFirstColumn).forEach((node, index) => {
        if (text.footerLinks[index]) node.textContent = text.footerLinks[index];
      });
    }

    setText('.home-page .request-modal__intro h2', text.requestTitle, true);
    setText('.home-page .request-modal__intro p', text.requestText);
    setText('.home-page .request-form__equipment > span', text.selected);
    setText('.home-page .request-form__equipment em', text.equipmentHelp, true);
    setText('.home-page .request-form__equipment a', text.browse);
    setText('.home-page .request-form__bottom > button', text.send);
    setText('.home-page .request-form__privacy span', text.privacy, true);

    const placeholders = {
      'input[name="name"]': lang === 'cz' ? 'Jméno a příjmení' : 'Full Name',
      'input[name="company"]': lang === 'cz' ? 'Název společnosti' : 'Company Name',
      'input[name="email"]': lang === 'cz' ? 'E-mail' : 'Email',
      'input[name="phone"]': lang === 'cz' ? 'Telefon' : 'Phone Number',
      'textarea[name="message"]': lang === 'cz' ? 'Podrobnosti projektu' : 'Project Details'
    };
    Object.entries(placeholders).forEach(([selector, value]) => {
      const field = $('.home-page .request-modal ' + selector);
      if (field) field.setAttribute('placeholder', value);
    });

    $$('[data-lang-option]').forEach((button) => {
      button.classList.toggle('is-active', button.dataset.langOption === lang);
    });
  };

  document.addEventListener('click', (event) => {
    const option = event.target.closest('[data-lang-option]');
    if (!option) return;
    event.preventDefault();
    const requested = option.dataset.langOption;
    /* Wait one task so the shared script can finish its own lightweight pass. */
    window.setTimeout(() => renderLanguage(requested), 0);
  }, true);

  let initialLanguage = 'en';
  try { initialLanguage = localStorage.getItem('feroxo-language') || 'en'; } catch (_) {}
  renderLanguage(initialLanguage);
})();
