// app.js - logic sederhana tanpa server, menyimpan data di localStorage
(() => {
  const sampleProducts = [
    {id:1, name:'Kopi Robusta Gayo', price:85000, category:'Makanan', desc:'Kopi pilihan dari Gayo, aroma kuat, cocok untuk espresso.', image:''},
    {id:2, name:'Tas Anyaman Lokal', price:120000, category:'Fashion', desc:'Tas anyaman tangan dari pengrajin lokal, ramah lingkungan.', image:''},
    {id:3, name:'Lampu Meja Kayu', price:175000, category:'Elektronik', desc:'Lampu meja dengan bahan kayu jati, desain minimalis.', image:''},
  ];

  function getProducts() {
    const raw = localStorage.getItem('tn_products');
    if (!raw) {
      localStorage.setItem('tn_products', JSON.stringify(sampleProducts));
      return sampleProducts;
    }
    try { return JSON.parse(raw); } catch(e) { return sampleProducts; }
  }
  function saveProducts(list) {
    localStorage.setItem('tn_products', JSON.stringify(list));
  }

  // Render featured on index
  function renderFeatured() {
    const featured = document.getElementById('featured');
    if (!featured) return;
    const products = getProducts().slice(0,4);
    featured.innerHTML = products.map(p => cardHtml(p)).join('');
    attachCardButtons();
  }

  function renderList() {
    const listEl = document.getElementById('product-list');
    if (!listEl) return;
    const products = getProducts();
    listEl.innerHTML = products.map(p => '<div class="col-md-4">'+cardHtml(p)+'</div>').join('');
    attachCardButtons();
  }

  function cardHtml(p) {
    const img = p.image || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><rect width="100%" height="100%" fill="#dee2e6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6c757d" font-size="20">'+p.name+'</text></svg>');
    return `<div class="card h-100">
      <img src="${img}" class="card-img-top" alt="${p.name}">
      <div class="card-body d-flex flex-column">
        <h5 class="card-title">${p.name}</h5>
        <p class="card-text text-muted mb-1">${p.category} • Rp ${p.price.toLocaleString()}</p>
        <p class="card-text small flex-grow-1">${p.desc}</p>
        <div class="mt-2">
          <a class="btn btn-sm btn-primary me-2 view-btn" data-id="${p.id}">Lihat</a>
          <button class="btn btn-sm btn-danger delete-btn" data-id="${p.id}">Hapus</button>
        </div>
      </div>
    </div>`;
  }
  
  function attachDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
  
        if (!confirm('Yakin ingin menghapus produk ini?')) return;
  
        const products = getProducts().filter(p => p.id !== id);
        saveProducts(products);
  
        renderList();     // render ulang daftar produk
        renderFeatured(); // render ulang featured (opsional)
      });
    });
  }

  function renderList() {
    const listEl = document.getElementById('product-list');
    if (!listEl) return;
    const products = getProducts();
    listEl.innerHTML = products.map(p => '<div class="col-md-4">'+cardHtml(p)+'</div>').join('');
    attachCardButtons();
    attachDeleteButtons(); // tambah ini
  }
  
  
  function attachCardButtons() {
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-id');
        window.location = 'product-detail.html?id=' + id;
      });
    });
  }

  // Detail page
  function renderDetail() {
    const detailEl = document.getElementById('detail');
    if (!detailEl) return;
    const params = new URLSearchParams(location.search);
    const id = parseInt(params.get('id'));
    const p = getProducts().find(x => x.id === id);
    if (!p) {
      detailEl.innerHTML = '<div class="col-12"><div class="alert alert-warning">Produk tidak ditemukan.</div></div>';
      return;
    }
    const img = p.image || 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><rect width="100%" height="100%" fill="#dee2e6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#6c757d" font-size="28">'+p.name+'</text></svg>');
    detailEl.innerHTML = `
      <div class="col-md-6">
        <img src="${img}" class="img-fluid rounded" alt="${p.name}">
      </div>
      <div class="col-md-6">
        <h2>${p.name}</h2>
        <p class="text-muted">${p.category} • Rp ${p.price.toLocaleString()}</p>
        <p>${p.desc}</p>
        <button class="btn btn-success" id="buy-now">Beli Sekarang</button>
      </div>`;
    const buy = document.getElementById('buy-now');
    buy && buy.addEventListener('click', () => alert('Terima kasih! Fitur checkout tidak tersedia pada demo ini.'));
  }

  // Register form
  function handleRegister() {
    const form = document.getElementById('register-form');
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const user = {
        fullname: fd.get('fullname'),
        email: fd.get('email'),
        username: fd.get('username'),
        phone: fd.get('phone'),
        created: new Date().toISOString()
      };
      // Simpan sederhana di localStorage
      const users = JSON.parse(localStorage.getItem('tn_users') || '[]');
      users.push(user);
      localStorage.setItem('tn_users', JSON.stringify(users));
      document.getElementById('register-result').innerHTML = '<div class="alert alert-success">Pendaftaran berhasil. Terima kasih, ' + user.fullname + '.</div>';
      form.reset();
    });
  }

  // Guestbook
  function handleGuestbook() {
    const form = document.getElementById('guestbook-form');
    if (!form) return;
    const listEl = document.getElementById('guest-list');
    function render() {
      const items = JSON.parse(localStorage.getItem('tn_guest') || '[]');
      listEl.innerHTML = items.slice().reverse().map(it => '<li class="list-group-item"><strong>'+escapeHtml(it.name)+'</strong><div class="small">'+escapeHtml(it.message)+'</div><div class="text-muted small">'+it.time+'</div></li>').join('');
    }
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const entry = { name: fd.get('name'), message: fd.get('message'), time: (new Date()).toLocaleString() };
      const items = JSON.parse(localStorage.getItem('tn_guest') || '[]');
      items.push(entry);
      localStorage.setItem('tn_guest', JSON.stringify(items));
      form.reset();
      render();
    });
    render();
  }

  // Add product
  function handleAddProduct() {
    const form = document.getElementById('add-product-form');
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      const fd = new FormData(form);
      const products = getProducts();
      const newProduct = {
        id: (Math.max(0, ...products.map(p => p.id)) + 1),
        name: fd.get('name'),
        price: Number(fd.get('price')),
        category: fd.get('category'),
        desc: fd.get('desc'),
        image: fd.get('image') || ''
      };
      products.push(newProduct);
      saveProducts(products);
      form.reset();
      renderList();
      alert('Produk berhasil ditambahkan (disimpan di browser).');
    });
  }

  // Utilities
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function(m){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]; });
  }

  // Init
  document.addEventListener('DOMContentLoaded', () => {
    renderFeatured();
    renderList();
    renderDetail();
    handleRegister();
    handleGuestbook();
    handleAddProduct();
  });
})();
