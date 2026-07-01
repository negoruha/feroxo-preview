(() => {
  document.documentElement.classList.add('js');

  const animated = document.querySelectorAll('.about-animate');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        instance.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    animated.forEach((element) => observer.observe(element));
  } else {
    animated.forEach((element) => element.classList.add('is-visible'));
  }

  const viewport = document.querySelector('[data-about-industries-viewport]');
  const track = document.querySelector('[data-about-industries-track]');
  const cards = track ? [...track.children] : [];
  const previous = document.querySelector('[data-about-industries-prev]');
  const next = document.querySelector('[data-about-industries-next]');
  let index = 0;

  const renderIndustryPosition = () => {
    if (!viewport || !track || !cards.length || window.innerWidth > 760) {
      if (track) track.style.transform = '';
      return;
    }
    const gap = 10;
    const width = viewport.clientWidth;
    track.style.transform = `translateX(-${index * (width + gap)}px)`;
  };

  previous?.addEventListener('click', () => {
    index = Math.max(0, index - 1);
    renderIndustryPosition();
  });
  next?.addEventListener('click', () => {
    index = Math.min(cards.length - 1, index + 1);
    renderIndustryPosition();
  });
  window.addEventListener('resize', renderIndustryPosition);
  renderIndustryPosition();
})();
