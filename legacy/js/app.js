/**
 * Vertex Studio — app.js
 * Vanilla JavaScript ES6+. Cada función tiene una única responsabilidad.
 */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
   * 1. Menú hamburguesa
   * ------------------------------------------------------- */
  function initNavToggle() {
    const toggle = document.getElementById('navToggle');
    const nav = document.getElementById('nav');
    if (!toggle || !nav) return;

    const closeNav = () => {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Abrir menú de navegación');
    };

    const openNav = () => {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Cerrar menú de navegación');
    };

    toggle.addEventListener('click', () => {
      nav.classList.contains('is-open') ? closeNav() : openNav();
    });

    // Cerrar al hacer click en un enlace
    nav.addEventListener('click', (event) => {
      if (event.target.closest('a')) closeNav();
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    // Cerrar al pasar a desktop
    window.matchMedia('(min-width: 900px)').addEventListener('change', (e) => {
      if (e.matches) closeNav();
    });
  }

  /* ---------------------------------------------------------
   * 2. Header con sombra al scrollear
   * ------------------------------------------------------- */
  function initStickyHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const update = () => {
      header.classList.toggle('is-scrolled', window.scrollY > 12);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ---------------------------------------------------------
   * 3. Enlace activo según la sección visible (scroll spy)
   * ------------------------------------------------------- */
  function initScrollSpy() {
    const links = Array.from(document.querySelectorAll('.nav__link[href^="#"]'));
    if (!links.length || !('IntersectionObserver' in window)) return;

    const sections = links
      .map((link) => document.querySelector(link.getAttribute('href')))
      .filter(Boolean);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach((section) => observer.observe(section));
  }

  /* ---------------------------------------------------------
   * 4. Reveal de elementos al entrar en viewport
   * ------------------------------------------------------- */
  function initReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry, index) => {
        if (!entry.isIntersecting) return;
        entry.target.style.transitionDelay = (index * 70) + 'ms';
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    items.forEach((item) => observer.observe(item));
  }

  /* ---------------------------------------------------------
   * 5. Contador animado de métricas
   * ------------------------------------------------------- */
  function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    if (!counters.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;

    const animate = (el) => {
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1200;
      const start = performance.now();

      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (progress < 1) requestAnimationFrame(tick);
      };

      requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ---------------------------------------------------------
   * 6. Filtros del portfolio
   * ------------------------------------------------------- */
  function initPortfolioFilters() {
    const buttons = document.querySelectorAll('.filters__btn');
    const projects = document.querySelectorAll('.project');
    const emptyMsg = document.getElementById('projectsEmpty');
    if (!buttons.length || !projects.length) return;

    const applyFilter = (filter) => {
      let visible = 0;

      projects.forEach((project) => {
        const match = filter === 'all' || project.dataset.category === filter;
        project.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });

      if (emptyMsg) emptyMsg.hidden = visible > 0;
    };

    buttons.forEach((button) => {
      button.addEventListener('click', () => {
        buttons.forEach((btn) => {
          const isCurrent = btn === button;
          btn.classList.toggle('is-active', isCurrent);
          btn.setAttribute('aria-pressed', String(isCurrent));
        });
        applyFilter(button.dataset.filter);
      });
    });
  }

  /* ---------------------------------------------------------
   * 7. Acordeón de FAQ (accesible)
   * ------------------------------------------------------- */
  function initAccordion() {
    const triggers = document.querySelectorAll('.accordion__trigger');
    if (!triggers.length) return;

    triggers.forEach((trigger) => {
      trigger.addEventListener('click', () => {
        const panel = document.getElementById(trigger.getAttribute('aria-controls'));
        const isOpen = trigger.getAttribute('aria-expanded') === 'true';

        // Cerrar los demás (comportamiento acordeón)
        triggers.forEach((other) => {
          if (other === trigger) return;
          other.setAttribute('aria-expanded', 'false');
          const otherPanel = document.getElementById(other.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        });

        trigger.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  /* ---------------------------------------------------------
   * 8. Validación del formulario de contacto
   * ------------------------------------------------------- */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const success = document.getElementById('formSuccess');
    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const rules = {
      nombre: (value) => {
        if (!value.trim()) return 'Escribí tu nombre.';
        if (value.trim().length < 3) return 'El nombre debe tener al menos 3 caracteres.';
        return '';
      },
      email: (value) => {
        if (!value.trim()) return 'Escribí tu email.';
        if (!EMAIL_RE.test(value.trim())) return 'Ingresá un email válido, por ejemplo ana@tunegocio.com';
        return '';
      },
      mensaje: (value) => {
        if (!value.trim()) return 'Contanos brevemente qué necesitás.';
        if (value.trim().length < 15) return 'Agregá un poco más de detalle (mínimo 15 caracteres).';
        return '';
      }
    };

    const showError = (field, message) => {
      const errorEl = document.getElementById(field.id + '-error');
      const hasError = Boolean(message);

      field.classList.toggle('is-invalid', hasError);
      field.setAttribute('aria-invalid', String(hasError));

      if (errorEl) {
        errorEl.textContent = message;
        errorEl.hidden = !hasError;
      }
    };

    const validateField = (field) => {
      const rule = rules[field.name];
      if (!rule) return true;
      const message = rule(field.value);
      showError(field, message);
      return !message;
    };

    // Validar al salir del campo
    Object.keys(rules).forEach((name) => {
      const field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', () => validateField(field));
      field.addEventListener('input', () => {
        if (field.classList.contains('is-invalid')) validateField(field);
      });
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      let firstInvalid = null;

      Object.keys(rules).forEach((name) => {
        const field = form.elements[name];
        if (!field) return;
        if (!validateField(field) && !firstInvalid) firstInvalid = field;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (success) success.hidden = true;
        return;
      }

      // Aquí iría el envío real (fetch a tu endpoint / Formspree / etc.)
      form.reset();
      if (success) {
        success.hidden = false;
        success.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' });
      }
    });
  }

  /* ---------------------------------------------------------
   * 9. Año dinámico en el footer
   * ------------------------------------------------------- */
  function initFooterYear() {
    const year = document.getElementById('year');
    if (year) year.textContent = String(new Date().getFullYear());
  }

  /* ---------------------------------------------------------
   * Bootstrap
   * ------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNavToggle();
    initStickyHeader();
    initScrollSpy();
    initReveal();
    initCounters();
    initPortfolioFilters();
    initAccordion();
    initContactForm();
    initFooterYear();
  });
})();
