document.addEventListener('DOMContentLoaded', () => {
  try {
    // ─── 0. Inventario ─────────────────────────────────────────────────────────
    const inventory = {
      'Vela Wiskera':    { stock: 0, prep: 7 },
      'Set MAKEUP': { stock: 3, prep: 2 },
      'Joyas de acero':{ stock: 1, prep: 3 },
      'Set Aromatico':{ stock: 1, prep: 1 },
      // …añade aquí tus otros productos usando su data-id como clave
    };

    // ─── 1. Configuración inicial ─────────────────────────────────────────────
    const waNumber    = '5493764734036';
    const nav         = document.querySelector('.nav');
    const links       = nav ? Array.from(nav.querySelectorAll('a')) : [];
    const cards       = Array.from(document.querySelectorAll('.product-card'));
    const menuToggle  = document.querySelector('.menu-toggle');
    const revealEls   = Array.from(document.querySelectorAll('.reveal'));

    // Modal
    const modal        = document.getElementById('order-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalClose   = document.getElementById('modal-close');
    const modalCancel  = document.getElementById('modal-cancel');
    const modalConfirm = document.getElementById('modal-confirm');
    let currentWaUrl   = '';

    // ─── 2. Inyectar stock dinámico ────────────────────────────────────────────
    cards.forEach(card => {
      const id      = card.dataset.id;
      const info    = inventory[id] || { stock: 0, prep: 0 };
      const { stock, prep } = info;
      card.dataset.stock = stock;
      card.dataset.prep  = prep;

      // Crear o actualizar etiqueta <p class="stock">
      let pStock = card.querySelector('.stock');
      if (!pStock) {
        pStock = document.createElement('p');
        pStock.className = 'stock';
        card.insertBefore(pStock, card.querySelector('.order-btn'));
      }
      pStock.textContent = stock > 0
        ? `Stock: ${stock} unidad(es)`
        : 'Agotado. Puedes solicitarlo con tiempo de espera';
    });

    // ─── 3. Filtrar productos por categoría ────────────────────────────────────
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const cat = link.dataset.category;
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        cards.forEach(card => {
          const show = cat === 'all' || card.dataset.category === cat;
          card.style.display = show ? 'flex' : 'none';
        });
        if (nav && nav.classList.contains('open')) {
          nav.classList.remove('open');
        }
      });
    });

    // ─── 4. Toggle menú hamburguesa ───────────────────────────────────────────
    if (menuToggle && nav) {
      menuToggle.addEventListener('click', () => {
        nav.classList.toggle('open');
      });
    }

    // ─── 5. Scroll-reveal ──────────────────────────────────────────────────────
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1 });
      revealEls.forEach(el => observer.observe(el));
    } else {
      revealEls.forEach(el => el.classList.add('active'));
    }

    // ─── 6. Slider automático de imágenes ──────────────────────────────────────
    cards.forEach(card => {
      const imgs = Array.from(card.querySelectorAll('.product-images img'));
      if (!imgs.length) return;
      let idx = 0;
      imgs[idx].classList.add('active');
      setInterval(() => {
        imgs[idx].classList.remove('active');
        idx = (idx + 1) % imgs.length;
        imgs[idx].classList.add('active');
      }, 5000);
    });

    // ─── 7. Botón “Ordenar” → Modal y WhatsApp ────────────────────────────────
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('.order-btn');
      if (!btn) return;
      e.preventDefault();

      const card  = btn.closest('.product-card');
      const name  = card.dataset.name;
      const price = card.dataset.price;
      const stock = parseInt(card.dataset.stock, 10);
      const prep  = parseInt(card.dataset.prep, 10);

      let messageHTML, waText;

      if (stock > 0) {
        messageHTML = `
          Pedido:<br>
          <strong>${name}</strong><br>
          Precio: $${price}<br>
          Stock disponible: ${stock} unidad(es).
        `;
        waText = encodeURIComponent(
          `Hola, quisiera pedir "${name}" a $${price}. Se encuentra disponible?`
        );
      } else {
        messageHTML = `
          <span style="color: #c00;">Producto agotado</span><br>
          <strong>${name}</strong><br>
          Tiempo de preparación: ${prep} día(s).<br>
          ¿Deseas encargarlo de todas formas?
        `;
        waText = encodeURIComponent(
          `Hola, quisiera encargar "${name}".`
        );
      }

      currentWaUrl = `https://wa.me/${waNumber}?text=${waText}`;
      modalMessage.innerHTML = messageHTML;
      modal.style.display = 'flex';
    });

    // ─── 8. Handlers del modal ─────────────────────────────────────────────────
    modalClose.addEventListener('click',   () => modal.style.display = 'none');
    modalCancel.addEventListener('click',  () => modal.style.display = 'none');
    modalConfirm.addEventListener('click', () => {
      window.open(currentWaUrl, '_blank');
      modal.style.display = 'none';
    });

  } catch (err) {
    console.error('💥 Error en script.js:', err);
  }
});
