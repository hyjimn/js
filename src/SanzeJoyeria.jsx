import React, { useState, useEffect, useRef } from 'react';
import { Upload, X, Trash2, Plus, ChevronLeft, Send, Search, Download, RefreshCw, Edit2 } from 'lucide-react';
import initialProductsData from './productos.json';
import { db, isConfigured } from './firebase';
import { ref, onValue, set } from 'firebase/database';

function SparkleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    const COLORS = ['#D8CFBC', '#FFFBF4', '#c4bba8', '#e8e0d0', '#a89e8e', '#FFFBF4', '#D8CFBC'];
    const COUNT = 75;
    const sparkles = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      size: Math.random() * 1.8 + 0.3,
      opacity: Math.random() * 0.5 + 0.05,
      targetOpacity: Math.random() * 0.55 + 0.05,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 0.20,
      vy: (Math.random() - 0.5) * 0.20,
      twinkleRate: Math.random() * 0.014 + 0.003,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.007,
    }));
    const drawStar = (x, y, size, rot) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.beginPath();
      const r1 = size * 3.8;
      const r2 = size * 0.45;
      for (let i = 0; i < 4; i++) {
        const ao = (i / 4) * Math.PI * 2;
        const ai = ao + Math.PI / 4;
        if (i === 0) ctx.moveTo(Math.cos(ao) * r1, Math.sin(ao) * r1);
        else ctx.lineTo(Math.cos(ao) * r1, Math.sin(ao) * r1);
        ctx.lineTo(Math.cos(ai) * r2, Math.sin(ai) * r2);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };
    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparkles.forEach(s => {
        const diff = s.targetOpacity - s.opacity;
        if (Math.abs(diff) < 0.008) {
          s.targetOpacity = Math.random() * 0.55 + 0.04;
        }
        s.opacity += diff * s.twinkleRate * 4;
        s.x += s.vx;
        s.y += s.vy;
        s.rotation += s.rotSpeed;
        if (s.x < -10) s.x = canvas.width + 10;
        if (s.x > canvas.width + 10) s.x = -10;
        if (s.y < -10) s.y = canvas.height + 10;
        if (s.y > canvas.height + 10) s.y = -10;
        ctx.globalAlpha = Math.max(0, Math.min(0.9, s.opacity));
        ctx.fillStyle = s.color;
        drawStar(s.x, s.y, s.size, s.rotation);
      });
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

const materialNames = {
  oro: 'Oro',
  plata: 'Plata',
  oro_laminado: 'Oro Laminado'
};

const materialSubtext = {
  oro: 'Oro Sólido 14k / 18k',
  plata: 'Plata Fina Ley .925',
  oro_laminado: 'Oro Laminado de Alta Calidad'
};

const DEFAULT_PRODUCTS = {
  oro: {
    'Anillo': [],
    'Arete': [],
    'Arracada': [],
    'Broquel': [],
    'Cadena': [],
    'Dije': [],
    'Esclava': [],
    'Huggie': [],
    'Pulso': []
  },
  plata: {
    'Anillo': [],
    'Arete': [],
    'Arracada': [],
    'Broquel': [],
    'Cadena': [],
    'Dije': [],
    'Esclava': [],
    'Huggie': [],
    'Pulso': []
  },
  oro_laminado: {
    'Anillo': [],
    'Arete': [],
    'Arracada': [],
    'Broquel': [],
    'Cadena': [],
    'Dije': [],
    'Esclava': [],
    'Huggie': [],
    'Pulso': []
  }
};

// Firebase converts JS arrays into indexed objects ({0: {...}, 1: {...}}).
// This helper converts them back into proper arrays so .length, .map, spread, etc. work.
const normalizeProducts = (data) => {
  if (!data || typeof data !== 'object') return DEFAULT_PRODUCTS;
  const normalized = {};
  for (const material of Object.keys(data)) {
    normalized[material] = {};
    if (data[material] && typeof data[material] === 'object') {
      for (const category of Object.keys(data[material])) {
        const val = data[material][category];
        if (Array.isArray(val)) {
          normalized[material][category] = val;
        } else if (val && typeof val === 'object') {
          // Firebase indexed object → convert to array
          normalized[material][category] = Object.values(val).map(item => {
            if (item && item.images && !Array.isArray(item.images)) {
              item.images = Object.values(item.images);
            }
            return item;
          });
        } else {
          normalized[material][category] = [];
        }
      }
    }
  }
  return normalized;
};

export default function SanzeCatalog() {
  const categories = {
    oro: ['Anillo', 'Arete', 'Arracada', 'Broquel', 'Cadena', 'Dije', 'Esclava', 'Huggie', 'Pulso'],
    plata: ['Anillo', 'Arete', 'Arracada', 'Broquel', 'Cadena', 'Dije', 'Esclava', 'Huggie', 'Pulso'],
    oro_laminado: ['Anillo', 'Arete', 'Arracada', 'Broquel', 'Cadena', 'Dije', 'Esclava', 'Huggie', 'Pulso']
  };

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [enlargedMedia, setEnlargedMedia] = useState(null);
  const [isAdmin, setIsAdmin] = useState(() => {
    return sessionStorage.getItem('sanze_admin_active') === 'true';
  });

  useEffect(() => {
    window.history.replaceState({ view: 'home' }, '', '');
    const handlePopState = (event) => {
      const state = event.state;
      if (state) {
        if (state.view === 'home') {
          setCurrentPage('home');
          setSelectedMaterial(null);
          setSelectedCategory(null);
          setSelectedProduct(null);
          setSearchQuery('');
        } else if (state.view === 'material') {
          setSelectedMaterial(state.material);
          setSelectedCategory(null);
          setSelectedProduct(null);
        } else if (state.view === 'category') {
          setSelectedMaterial(state.material);
          setSelectedCategory(state.category);
          setSelectedProduct(null);
        } else if (state.view === 'product') {
          setSelectedMaterial(state.material);
          setSelectedCategory(state.category);
          setSelectedProduct(state.product);
        }
      } else {
        setCurrentPage('home');
        setSelectedMaterial(null);
        setSelectedCategory(null);
        setSelectedProduct(null);
        setSearchQuery('');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const logoClicksRef = useRef(0);
  const logoClickTimeoutRef = useRef(null);
  const savingRef = useRef(false);

  const promptAdminPassword = async () => {
    const password = window.prompt("Ingrese la contraseña de administrador:");
    if (!password) return;
    
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Hash de "Abril81"
    if (hashHex === 'ebed7beef901d5f29bc6dd193ac316b8bbd19b82c7c797d87bbfa64cde9aac4d') {
      setIsAdmin(true);
      sessionStorage.setItem('sanze_admin_active', 'true');
      alert("Acceso concedido. Modo Administrador activo.");
    } else {
      alert("Contraseña incorrecta.");
    }
  };

  const handleLogoClick = () => {
    logoClicksRef.current += 1;
    if (logoClicksRef.current >= 3) {
      promptAdminPassword();
      logoClicksRef.current = 0;
      return;
    }
    clearTimeout(logoClickTimeoutRef.current);
    logoClickTimeoutRef.current = setTimeout(() => {
      logoClicksRef.current = 0;
    }, 5000);
  };

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct]);
  
  const [loading, setLoading] = useState(isConfigured);

  // Load products from localStorage or use defaults
  const [products, setProducts] = useState(() => {
    const saved = localStorage.getItem('sanze_catalog_products_v2');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing saved products", e);
      }
    }
    return initialProductsData || DEFAULT_PRODUCTS;
  });

  // Sync products from Firebase if configured
  useEffect(() => {
    if (!isConfigured || !db) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const productsRef = ref(db, 'products');
    
    const unsubscribe = onValue(productsRef, (snapshot) => {
      // Don't overwrite local state while a save is in progress
      if (savingRef.current) return;
      let data = snapshot.val();
      if (data) {
        setProducts(normalizeProducts(data));
      } else {
        // If database is empty, initialize it with local products
        setProducts(initialProductsData || DEFAULT_PRODUCTS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching products from Firebase:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save to localStorage when products change
  useEffect(() => {
    localStorage.setItem('sanze_catalog_products_v2', JSON.stringify(products));
  }, [products]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', price: '', description: '', material: '', category: '', images: [] });
  const [editUrlInput, setEditUrlInput] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    material: '',
    category: '',
    images: []
  });

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { src: event.target.result, isVideo, id: Date.now() + Math.random() }]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddImageUrl = () => {
    if (urlInput.trim()) {
      const isVideo = urlInput.trim().match(/\.(mp4|webm|ogg|mov)$/i) != null;
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { src: urlInput.trim(), isVideo, id: Date.now() + Math.random() }]
      }));
      setUrlInput('');
    }
  };

  const addProduct = () => {
    if (formData.name && formData.price && formData.material && formData.category && formData.images.length > 0) {
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        price: formData.price.startsWith('$') ? formData.price : `$${formData.price}`,
        description: formData.description,
        material: formData.material,
        category: formData.category,
        images: formData.images
      };

      // Ensure existing category data is always a proper array
      const existingItems = Array.isArray(products[formData.material]?.[formData.category])
        ? products[formData.material][formData.category]
        : (products[formData.material]?.[formData.category]
            ? Object.values(products[formData.material][formData.category])
            : []);

      const updatedProducts = {
        ...products,
        [formData.material]: {
          ...products[formData.material],
          [formData.category]: [...existingItems, newProduct]
        }
      };

      // Block the Firebase listener from overwriting our local state
      savingRef.current = true;
      setProducts(updatedProducts);

      if (isConfigured && db) {
        set(ref(db, 'products'), updatedProducts)
          .then(() => {
            // Allow listener to resume after Firebase confirms the write
            setTimeout(() => { savingRef.current = false; }, 500);
          })
          .catch(err => {
            console.error("Error saving new product to Firebase:", err);
            savingRef.current = false;
          });
      } else {
        savingRef.current = false;
      }

      setFormData({
        name: '',
        price: '',
        description: '',
        material: '',
        category: '',
        images: []
      });
      setShowAddForm(false);
    } else {
      alert("Por favor, llena todos los campos y añade al menos una imagen o video.");
    }
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const openEditForm = (product) => {
    setEditingProductId(product.id);
    setEditFormData({
      name: product.name,
      price: product.price,
      description: product.description || '',
      material: product.material,
      category: product.category,
      images: [...(product.images || [])]
    });
    setShowEditForm(true);
  };

  const updateProduct = () => {
    if (editFormData.name && editFormData.price && editFormData.material && editFormData.category && editFormData.images.length > 0) {
      const updated = {
        id: editingProductId,
        name: editFormData.name,
        price: editFormData.price.startsWith('$') ? editFormData.price : `$${editFormData.price}`,
        description: editFormData.description,
        material: editFormData.material,
        category: editFormData.category,
        images: editFormData.images
      };
      const copy = normalizeProducts(JSON.parse(JSON.stringify(products)));
      Object.keys(copy).forEach(mat => {
        if (copy[mat]) {
          Object.keys(copy[mat]).forEach(cat => {
            if (Array.isArray(copy[mat][cat])) {
              copy[mat][cat] = copy[mat][cat].filter(p => p.id !== editingProductId);
            } else {
              copy[mat][cat] = [];
            }
          });
        }
      });
      if (!copy[editFormData.material]) {
        copy[editFormData.material] = {};
      }
      if (!copy[editFormData.material][editFormData.category]) {
        copy[editFormData.material][editFormData.category] = [];
      }
      copy[editFormData.material][editFormData.category].push(updated);
      
      savingRef.current = true;
      setProducts(copy);
      setSelectedProduct(updated);
      setShowEditForm(false);

      if (isConfigured && db) {
        set(ref(db, 'products'), copy)
          .then(() => {
            setTimeout(() => { savingRef.current = false; }, 500);
          })
          .catch(err => {
            console.error("Error saving updated product to Firebase:", err);
            savingRef.current = false;
          });
      } else {
        savingRef.current = false;
      }
    } else {
      alert("Por favor, llena todos los campos y añade al menos una imagen o video.");
    }
  };

  const handleEditImageUpload = (e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const isVideo = file.type.startsWith('video/');
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditFormData(prev => ({
          ...prev,
          images: [...prev.images, { src: event.target.result, isVideo, id: Date.now() + Math.random() }]
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const handleAddEditImageUrl = () => {
    if (editUrlInput.trim()) {
      const isVideo = editUrlInput.trim().match(/\.(mp4|webm|ogg|mov)$/i) != null;
      setEditFormData(prev => ({
        ...prev,
        images: [...prev.images, { src: editUrlInput.trim(), isVideo, id: Date.now() + Math.random() }]
      }));
      setEditUrlInput('');
    }
  };

  const removeEditImage = (imageId) => {
    setEditFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const deleteProduct = (productId) => {
    const newProducts = normalizeProducts(JSON.parse(JSON.stringify(products)));
    Object.keys(newProducts).forEach(material => {
      if (newProducts[material]) {
        Object.keys(newProducts[material]).forEach(category => {
          if (Array.isArray(newProducts[material][category])) {
            newProducts[material][category] = newProducts[material][category].filter(p => p.id !== productId);
          } else {
            newProducts[material][category] = [];
          }
        });
      }
    });

    savingRef.current = true;
    setProducts(newProducts);
    setSelectedProduct(null);

    if (isConfigured && db) {
      set(ref(db, 'products'), newProducts)
        .then(() => {
          setTimeout(() => { savingRef.current = false; }, 500);
        })
        .catch(err => {
          console.error("Error deleting product from Firebase:", err);
          savingRef.current = false;
        });
    } else {
      savingRef.current = false;
    }
  };

  const goHome = () => {
    window.history.pushState({ view: 'home' }, '', '');
    setCurrentPage('home');
    setSelectedMaterial(null);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSearchQuery('');
  };

  const goToMaterial = (material) => {
    window.history.pushState({ view: 'material', material }, '', '');
    setSelectedMaterial(material);
    setSelectedCategory(null);
    setSelectedProduct(null);
  };

  const goToCategory = (category) => {
    window.history.pushState({ view: 'category', material: selectedMaterial, category }, '', '');
    setSelectedCategory(category);
    setSelectedProduct(null);
  };

  const viewProductDetail = (product) => {
    window.history.pushState({ view: 'product', material: selectedMaterial, category: selectedCategory, product }, '', '');
    setSelectedProduct(product);
  };

  // Search logic
  const getAllProducts = () => {
    const list = [];
    Object.keys(products).forEach(material => {
      if (!products[material] || typeof products[material] !== 'object') return;
      Object.keys(products[material]).forEach(category => {
        const items = products[material][category];
        const arr = Array.isArray(items) ? items : (items ? Object.values(items) : []);
        arr.forEach(p => {
          if (p && p.name) list.push(p);
        });
      });
    });
    return list;
  };

  const filteredProducts = searchQuery.trim() 
    ? getAllProducts().filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleWhatsAppContact = (product) => {
    const phoneNumber = '528661005158'; // Joyería Sanze Phone
    const matName = materialNames[product.material] || product.material;
    const message = `Hola Joyería Sanze, estoy interesado en recibir información de la pieza de catálogo:\n\n*${product.name}*\nMaterial: ${matName}\nCategoría: ${product.category}\nPrecio: ${product.price}\n\nEnlace: https://joyeriasanze.qzz.io/`;
    const encodedText = encodeURIComponent(message);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const exportCatalogJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "productos.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const resetToInitialJSON = () => {
    if (window.confirm("¿Seguro que quieres borrar tus cambios locales y volver a lo que está guardado en productos.json?")) {
      localStorage.removeItem('sanze_catalog_products_v2');
      setProducts(initialProductsData);
      
      if (isConfigured && db) {
        set(ref(db, 'products'), initialProductsData)
          .then(() => {
            window.location.reload();
          })
          .catch(err => {
            console.error("Error resetting catalog in Firebase:", err);
            window.location.reload();
          });
      } else {
        window.location.reload();
      }
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#060705',
        color: '#FFFBF4',
        fontFamily: "'Plus Jakarta Sans', sans-serif"
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          border: '3px solid rgba(216, 207, 188, 0.1)',
          borderTop: '3px solid #D8CFBC',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '1.5rem'
        }} />
        <p style={{ letterSpacing: '0.15em', fontSize: '0.85rem', color: '#9a9184', textTransform: 'uppercase' }}>Cargando Catálogo...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --bg-primary: #060705;
          --bg-secondary: #0e0f0b;
          --bg-card: #111209;
          --bg-card-hover: #181910;
          --accent: #D8CFBC;
          --accent-hover: #e6dfd0;
          --accent-glow: rgba(216, 207, 188, 0.15);
          --border: rgba(216, 207, 188, 0.12);
          --border-hover: rgba(216, 207, 188, 0.40);
          --text-main: #FFFBF4;
          --text-muted: #9a9184;
          --rounded-lg: 16px;
          --rounded-md: 12px;
          --rounded-sm: 8px;
          --transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: var(--bg-primary);
          color: var(--text-main);
          -webkit-font-smoothing: antialiased;
          background-image: 
            radial-gradient(circle at 5% 15%, rgba(86, 84, 73, 0.22) 0%, transparent 40%),
            radial-gradient(circle at 95% 85%, rgba(86, 84, 73, 0.18) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(216, 207, 188, 0.02) 0%, transparent 60%);
          font-family: 'Plus Jakarta Sans', 'Outfit', sans-serif;
        }

        /* Scrollbar Styling */
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: var(--bg-primary);
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(216, 207, 188, 0.20);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(216, 207, 188, 0.40);
        }

        /* Glassmorphism Header */
        .header {
          position: sticky;
          top: 0;
          background-color: #000000;
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-bottom: 1px solid var(--border);
          padding: 1.2rem 4rem;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          z-index: 90;
          transition: var(--transition);
        }

        .header-nav.left-nav {
          display: flex;
          gap: 2.2rem;
          justify-content: flex-start;
        }

        .header-nav.right-nav {
          display: flex;
          gap: 2.2rem;
          justify-content: flex-end;
        }

        .logo {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          cursor: pointer;
          color: var(--text-main);
          background: linear-gradient(90deg, #FFFBF4 0%, #D8CFBC 35%, #FFFBF4 60%, #e6dfd0 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerBg 4s linear infinite;
          transition: var(--transition);
          justify-self: center;
        }

        .logo:hover {
          opacity: 0.85;
        }

        .nav-link {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.05em;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-muted);
          transition: var(--transition);
          position: relative;
          padding: 0.4rem 0;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 50%;
          width: 0;
          height: 2px;
          background: var(--accent);
          transition: var(--transition);
          transform: translateX(-50%);
          border-radius: 2px;
        }

        .nav-link:hover {
          color: var(--text-main);
        }

        .nav-link:hover::after {
          width: 100%;
        }

        /* Search input styling */
        .search-bar-container {
          position: relative;
          max-width: 480px;
          width: 100%;
          margin: 0 auto;
        }

        .search-bar {
          width: 100%;
          padding: 0.8rem 1.5rem 0.8rem 3rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: var(--rounded-md);
          color: var(--text-main);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          font-weight: 400;
          transition: var(--transition);
        }

        .search-bar:focus {
          outline: none;
          border-color: var(--accent);
          box-shadow: 0 0 20px var(--accent-glow);
          background-color: var(--bg-card);
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          transition: var(--transition);
        }

        .search-bar:focus + .search-icon {
          color: var(--accent);
        }

        /* Hero Landing */
        .hero {
          position: relative;
          padding: 6rem 2rem 4rem 2rem;
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -10%;
          width: 420px;
          height: 420px;
          background: radial-gradient(circle, rgba(86, 84, 73, 0.35) 0%, transparent 70%);
          z-index: 0;
          pointer-events: none;
        }

        .hero::after {
          content: '';
          position: absolute;
          left: -10%;
          right: -10%;
          top: 0;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(216, 207, 188, 0.55), transparent);
          animation: scanline 8s linear infinite;
          z-index: 1;
          pointer-events: none;
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: 4.8rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
          background: linear-gradient(90deg, #FFFBF4 0%, #D8CFBC 35%, #FFFBF4 65%, #c4bba8 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards, shimmerBg 5s linear 0.9s infinite;
          line-height: 1;
          position: relative;
          z-index: 2;
        }

        .hero-subtitle {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1rem;
          letter-spacing: 0.15em;
          color: var(--accent);
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 3rem;
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards;
          opacity: 0;
          position: relative;
          z-index: 2;
        }

        /* Materials Grid */
        .materials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 2rem;
          max-width: 1100px;
          margin: 1rem auto 4rem auto;
          padding: 0 2rem;
          opacity: 0;
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        .material-block {
          aspect-ratio: 1.6;
          border: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(14, 15, 11, 0.90) 0%, rgba(6, 7, 5, 0.98) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          border-radius: var(--rounded-lg);
          animation: floatGem 6s ease-in-out infinite;
        }

        .material-block:nth-child(2) {
          animation-delay: -2s;
        }

        .material-block:nth-child(3) {
          animation-delay: -4s;
        }

        .material-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, var(--accent-glow) 0%, transparent 80%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .material-block::after {
          content: '';
          position: absolute;
          top: 0;
          left: -150%;
          width: 50%;
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: skewX(-25deg);
          transition: 0.75s;
        }

        .material-block:hover {
          animation: none;
          border-color: var(--border-hover);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 35px rgba(216, 207, 188, 0.18);
        }

        .material-block:hover::before {
          opacity: 1;
        }

        .material-block:hover::after {
          left: 150%;
        }

        .material-text {
          font-family: 'Outfit', sans-serif;
          font-size: 2.6rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          z-index: 2;
          background: linear-gradient(135deg, #FFFBF4 40%, #D8CFBC 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: var(--transition);
        }

        .material-block:hover .material-text {
          transform: scale(1.04);
        }

        .material-tagline {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.05em;
          color: var(--text-muted);
          margin-top: 0.5rem;
          z-index: 2;
          transition: var(--transition);
        }

        .material-block:hover .material-tagline {
          color: var(--accent);
        }

        /* Section Layouts */
        .section {
          max-width: 1100px;
          margin: 0 auto;
          padding: 3rem 2rem;
          animation: pageEntrance 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          color: var(--text-muted);
          cursor: pointer;
          transition: var(--transition);
          margin-bottom: 2rem;
          font-weight: 500;
        }

        .back-link:hover {
          color: var(--accent);
          transform: translateX(-4px);
        }

        .section-title {
          font-family: 'Outfit', sans-serif;
          font-size: 2.4rem;
          font-weight: 800;
          letter-spacing: -0.01em;
          margin-bottom: 3rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(to right, #ffffff, var(--text-muted));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* Categories Grid */
        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .category-card {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          padding: 2.2rem 1.5rem;
          cursor: pointer;
          transition: var(--transition);
          text-align: center;
          position: relative;
          overflow: hidden;
          border-radius: var(--rounded-md);
          animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        .category-card:nth-child(1) { animation-delay: 0.05s; }
        .category-card:nth-child(2) { animation-delay: 0.10s; }
        .category-card:nth-child(3) { animation-delay: 0.15s; }
        .category-card:nth-child(4) { animation-delay: 0.20s; }
        .category-card:nth-child(5) { animation-delay: 0.25s; }
        .category-card:nth-child(6) { animation-delay: 0.30s; }
        .category-card:nth-child(7) { animation-delay: 0.35s; }
        .category-card:nth-child(8) { animation-delay: 0.40s; }

        .category-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, var(--accent-glow) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
        }

        .category-card:hover {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          animation: categoryHoverGlow 2s ease-in-out infinite;
        }

        .category-card:hover::after {
          opacity: 1;
        }

        .category-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          position: relative;
          z-index: 1;
          color: var(--text-muted);
          transition: var(--transition);
        }

        .category-card:hover .category-name {
          color: var(--text-main);
        }

        /* Products Grid */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 2.5rem;
          margin: 1.5rem 0;
        }

        .product-card {
          cursor: pointer;
          animation: cardReveal 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          position: relative;
          overflow: hidden;
          border-radius: var(--rounded-md);
          border: 1px solid var(--border);
          transition: var(--transition);
        }

        .product-card:hover {
          border-color: var(--border-hover);
        }

        .product-card:nth-child(1)  { animation-delay: 0.05s; }
        .product-card:nth-child(2)  { animation-delay: 0.10s; }
        .product-card:nth-child(3)  { animation-delay: 0.15s; }
        .product-card:nth-child(4)  { animation-delay: 0.20s; }
        .product-card:nth-child(5)  { animation-delay: 0.25s; }
        .product-card:nth-child(6)  { animation-delay: 0.30s; }
        .product-card:nth-child(n+7) { animation-delay: 0.35s; }

        .product-image {
          width: 100%;
          aspect-ratio: 3/4;
          background-color: var(--bg-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: var(--transition);
          position: relative;
        }

        .product-card:hover .product-image {
          animation: glowPulse 2s ease-in-out infinite;
        }

        .product-image img, .product-image video {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-card:hover .product-image img, .product-card:hover .product-image video {
          transform: scale(1.06);
        }

        .product-placeholder {
          color: var(--text-muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        .product-info-wrap {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(to top, rgba(6, 7, 5, 0.95) 0%, rgba(6, 7, 5, 0.70) 70%, transparent 100%);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          padding: 1.5rem 1rem 1rem 1rem;
          transform: translateY(100%);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          z-index: 5;
        }

        .product-card:hover .product-info-wrap {
          transform: translateY(0);
        }

        .product-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.05rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.3;
          transition: var(--transition);
        }

        .product-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--accent);
          font-weight: 600;
        }

        .product-material-badge {
          position: absolute;
          top: 0.8rem;
          left: 0.8rem;
          background-color: rgba(6, 7, 5, 0.75);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          border: 1px solid var(--border);
          color: var(--text-main);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          padding: 0.3rem 0.6rem;
          border-radius: var(--rounded-sm);
          z-index: 4;
          pointer-events: none;
        }

        /* Luxury Detail Overlay */
        .detail-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(6, 7, 5, 0.96);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 100;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }

        .detail-header {
          position: sticky;
          top: 0;
          background-color: rgba(6, 7, 5, 0.94);
          backdrop-filter: blur(15px);
          -webkit-backdrop-filter: blur(15px);
          border-bottom: 1px solid var(--border);
          padding: 1.2rem 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 101;
        }

        .close-detail {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          font-size: 1.4rem;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid var(--border);
        }

        .close-detail:hover {
          color: var(--text-main);
          border-color: var(--accent);
          background-color: rgba(255, 255, 255, 0.05);
        }

        .detail-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .detail-images {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .detail-main-image {
          width: 100%;
          aspect-ratio: 1;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          border-radius: var(--rounded-lg);
          box-shadow: 0 15px 30px rgba(0,0,0,0.5);
        }

        .detail-main-image img, .detail-main-image video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .enlarged-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(0, 0, 0, 0.95);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-out;
          animation: fadeIn 0.3s ease-out;
        }
        .enlarged-media {
          max-width: 95vw;
          max-height: 95vh;
          object-fit: contain;
          border-radius: 8px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        }
        .enlarged-close {
          position: absolute;
          top: 2rem;
          right: 2rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: white;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
        }
        .enlarged-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .detail-thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 0.8rem;
        }

        .thumbnail {
          aspect-ratio: 1;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          cursor: pointer;
          overflow: hidden;
          border-radius: var(--rounded-sm);
          transition: var(--transition);
        }

        .thumbnail:hover, .thumbnail.active {
          border-color: var(--accent);
          box-shadow: 0 0 8px var(--accent-glow);
        }

        .thumbnail img, .thumbnail video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
        }

        .detail-name {
          font-family: 'Outfit', sans-serif;
          font-size: 2.2rem;
          font-weight: 800;
          color: var(--text-main);
          margin-bottom: 0.8rem;
          line-height: 1.2;
        }

        .detail-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.3rem;
          color: var(--accent);
          margin-bottom: 2rem;
          font-weight: 600;
        }

        .detail-description-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.8rem;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 0.5rem;
        }

        .detail-description {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          color: var(--text-main);
          margin-bottom: 2rem;
          opacity: 0.85;
          font-weight: 400;
        }

        .detail-specs {
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          padding: 1.5rem 0;
          margin-bottom: 2rem;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .spec-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 1.5rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .spec-label {
          font-size: 0.8rem;
          text-transform: uppercase;
          font-weight: 600;
          color: var(--text-muted);
        }

        .spec-value {
          font-size: 0.9rem;
          color: var(--text-main);
          font-weight: 400;
        }

        /* Action Buttons */
        .actions-block {
          display: flex;
          gap: 1rem;
        }

        .btn-whatsapp {
          flex: 1;
          background: linear-gradient(135deg, #1fa855, #158240);
          border: none;
          color: #ffffff;
          padding: 1rem 1.5rem;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.6rem;
          border-radius: var(--rounded-md);
        }

        .btn-whatsapp:hover {
          background: linear-gradient(135deg, #25d366, #1fa855);
          box-shadow: 0 8px 16px rgba(37, 211, 102, 0.2);
          transform: translateY(-2px);
        }

        .btn-delete-prod {
          background-color: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #ef4444;
          padding: 1rem;
          width: 48px;
          height: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rounded-md);
          transition: var(--transition);
        }

        .btn-delete-prod:hover {
          background-color: #ef4444;
          color: #ffffff;
          border-color: #ef4444;
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(239, 68, 68, 0.2);
        }

        .btn-edit-prod {
          background-color: rgba(216, 207, 188, 0.08);
          border: 1px solid rgba(216, 207, 188, 0.20);
          color: var(--accent);
          padding: 1rem;
          width: 48px;
          height: 48px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--rounded-md);
          transition: var(--transition);
        }

        .btn-edit-prod:hover {
          background-color: var(--accent);
          color: #11120D;
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 8px 16px rgba(216, 207, 188, 0.18);
        }

        /* Float Action Button Plus */
        .add-btn {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          width: 56px;
          height: 56px;
          background: var(--accent);
          border: none;
          color: #121215;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          z-index: 50;
          animation: btnPulse 2s infinite;
        }

        .add-btn:hover {
          animation: none;
          transform: scale(1.15) rotate(90deg);
          background-color: var(--accent-hover);
          box-shadow: 0 12px 28px rgba(0,0,0,0.5), 0 0 28px rgba(216, 207, 188, 0.40);
        }

        @keyframes btnPulse {
          0% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 0 rgba(216, 207, 188, 0.45);
          }
          70% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 14px rgba(216, 207, 188, 0);
          }
          100% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 0 rgba(216, 207, 188, 0);
          }
        }

        /* Modals & Forms */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: #000000;
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.3s ease-out;
          padding: 1.5rem;
        }

        .modal {
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          max-width: 540px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2.5rem;
          border-radius: var(--rounded-lg);
          box-shadow: 0 25px 50px rgba(0,0,0,0.5);
          animation: fadeInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .modal-title {
          font-family: 'Outfit', sans-serif;
          font-size: 1.8rem;
          font-weight: 800;
          margin-bottom: 1.8rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 0.8rem;
          color: var(--text-main);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.9rem;
          background-color: rgba(255, 255, 255, 0.02);
          border: 1px solid var(--border);
          border-radius: var(--rounded-md);
          color: var(--text-main);
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          transition: var(--transition);
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          background-color: rgba(255, 255, 255, 0.04);
          border-color: var(--accent);
          box-shadow: 0 0 10px var(--accent-glow);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .url-input-wrap {
          display: flex;
          gap: 0.8rem;
          margin-bottom: 0.8rem;
        }

        .btn-add-url {
          background-color: rgba(216, 207, 188, 0.1);
          border: 1px solid var(--border);
          color: var(--accent);
          padding: 0 1.2rem;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          font-weight: 600;
          border-radius: var(--rounded-md);
          transition: var(--transition);
        }

        .btn-add-url:hover {
          background-color: var(--accent);
          color: #11120D;
          border-color: var(--accent);
        }

        .upload-divider {
          text-align: center;
          margin: 1rem 0;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          position: relative;
        }

        .upload-divider::before, .upload-divider::after {
          content: '';
          position: absolute;
          top: 50%;
          width: 30%;
          height: 1px;
          background-color: var(--border);
        }

        .upload-divider::before { left: 0; }
        .upload-divider::after { right: 0; }

        .upload-zone {
          border: 2px dashed var(--border);
          padding: 1.8rem;
          border-radius: var(--rounded-md);
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          background-color: rgba(255, 255, 255, 0.01);
        }

        .upload-zone:hover {
          border-color: var(--accent);
          background-color: rgba(216, 207, 188, 0.05);
        }

        .upload-zone input {
          display: none;
        }

        .image-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(70px, 1fr));
          gap: 0.8rem;
          margin-top: 1.2rem;
        }

        .preview-item {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border-radius: var(--rounded-sm);
          border: 1px solid var(--border);
        }

        .preview-item img, .preview-item video {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          inset: 0;
          background-color: rgba(10, 10, 12, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
          cursor: pointer;
        }

        .preview-item:hover .remove-image {
          opacity: 1;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .btn-modal {
          flex: 1;
          padding: 0.9rem;
          border: none;
          cursor: pointer;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          font-weight: 600;
          transition: var(--transition);
          border-radius: var(--rounded-md);
        }

        .btn-modal-save {
          background: var(--accent);
          color: #121215;
        }

        .btn-modal-save:hover {
          background-color: var(--accent-hover);
          box-shadow: 0 5px 15px var(--accent-glow);
        }

        .btn-modal-cancel {
          background-color: transparent;
          border: 1px solid var(--border);
          color: var(--text-muted);
        }

        .btn-modal-cancel:hover {
          border-color: var(--text-main);
          color: var(--text-main);
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: var(--text-muted);
          font-family: 'Plus Jakarta Sans', sans-serif;
          border: 2px dashed var(--border);
          border-radius: var(--rounded-md);
        }

        /* Footer */
        .footer {
          background-color: #060705;
          border-top: 1px solid var(--border);
          padding: 4rem 2rem 2rem 2rem;
          margin-top: 6rem;
        }

        .footer-content {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.5fr 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .footer-section h3 {
          font-family: 'Outfit', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 1.2rem;
          color: var(--text-main);
        }

        .footer-section p {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.9rem;
          line-height: 1.7;
          color: var(--text-muted);
        }

        .footer-bottom {
          text-align: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.85rem;
          color: rgba(255, 255, 255, 0.2);
          border-top: 1px solid var(--border);
          padding-top: 1.5rem;
        }

        /* Animations */
        @keyframes pageEntrance {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmerBg {
          0%   { background-position: 0% center; }
          100% { background-position: 200% center; }
        }

        @keyframes floatGem {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-9px); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 12px 24px rgba(0,0,0,0.4), 0 0 0px 0px rgba(216, 207, 188, 0.0); }
          50%       { box-shadow: 0 12px 24px rgba(0,0,0,0.4), 0 0 20px 5px rgba(216, 207, 188, 0.18); }
        }

        @keyframes scanline {
          0%   { transform: translateY(0);    opacity: 0; }
          8%   { opacity: 1; }
          92%  { opacity: 1; }
          100% { transform: translateY(700px); opacity: 0; }
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        @keyframes categoryHoverGlow {
          0%, 100% { box-shadow: 0 10px 20px rgba(0,0,0,0.35), 0 0  8px rgba(216, 207, 188, 0.08); }
          50%       { box-shadow: 0 10px 20px rgba(0,0,0,0.35), 0 0 20px rgba(216, 207, 188, 0.22); }
        }

        .admin-bar {
          background-color: var(--accent);
          color: #121215;
          padding: 0.6rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.85rem;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 600;
          z-index: 95;
          position: sticky;
          top: 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }
        .admin-bar-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .admin-bar-actions {
          display: flex;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .admin-bar {
            flex-direction: column;
            padding: 0.8rem 1rem;
            text-align: center;
            gap: 0.8rem;
          }
          .admin-bar-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        /* Responsive */
        @media (max-width: 992px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .footer-content {
            grid-template-columns: 1fr;
            gap: 2.5rem;
          }
        }

        @media (max-width: 768px) {
          .header {
            padding: 1.2rem 1.5rem;
            flex-direction: column;
            gap: 1rem;
          }

          .header-nav {
            gap: 1.5rem;
          }

          .hero-title {
            font-size: 3rem;
          }

          .materials-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .material-block {
            aspect-ratio: 1.7;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1.5rem;
          }

          .add-btn {
            bottom: 2rem;
            right: 2rem;
            width: 48px;
            height: 48px;
          }
        }
      `}</style>

      <SparkleCanvas />

      {/* Admin Bar */}
      {isAdmin && (
        <div className="admin-bar">
          <div className="admin-bar-title">
            <span>🛠️</span> MODO ADMINISTRADOR ACTIVO
          </div>
          <div className="admin-bar-actions">
            <button 
              onClick={exportCatalogJSON}
              style={{
                background: 'rgba(18, 18, 21, 0.9)',
                color: 'var(--accent)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: '600',
                transition: 'var(--transition)'
              }}
            >
              <Download size={14} /> Exportar productos.json
            </button>
            <button 
              onClick={resetToInitialJSON}
              style={{
                background: 'transparent',
                color: '#121215',
                border: '1px solid #121215',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                transition: 'var(--transition)'
              }}
            >
              <RefreshCw size={14} /> Restablecer catálogo
            </button>
            <button 
              onClick={() => {
                setIsAdmin(false);
                sessionStorage.removeItem('sanze_admin_active');
              }}
              style={{
                background: '#121215',
                color: '#ffffff',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: '700',
                transition: 'var(--transition)'
              }}
            >
              Salir
            </button>
          </div>
        </div>
      )}

      {/* Main Luxury Header */}
      <header className="header">
        <nav className="header-nav left-nav">
          <div className="nav-link" onClick={() => goToMaterial('oro')}>Oro</div>
          <div className="nav-link" onClick={() => goToMaterial('plata')}>Plata</div>
        </nav>
        <div className="logo" onClick={() => { goHome(); handleLogoClick(); }} style={{ background: "none", display: "flex", justifyContent: "center", userSelect: "none", WebkitUserSelect: "none" }}><img src="/logo.png" alt="Joyería Sanze" style={{ height: "60px", objectFit: "contain", pointerEvents: "none" }} /></div>
        <nav className="header-nav right-nav">
          <div className="nav-link" onClick={() => goToMaterial('oro_laminado')}>Oro Laminado</div>
          <div className="nav-link" onClick={goHome}>Colección</div>
          {isAdmin && (
            <div className="nav-link" onClick={() => { setIsAdmin(false); sessionStorage.removeItem('sanze_admin_active'); }} style={{ color: '#ef4444' }}>Salir Admin</div>
          )}
        </nav>
      </header>

      {/* Float Add Piece Modal */}
      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Añadir Nueva Pieza</h2>

            <div className="form-group">
              <label className="form-label">Nombre de la Pieza</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Aretes Colgantes de Rubí"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio</label>
              <input
                type="text"
                className="form-input"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="Ej: $3,500"
              />
            </div>

            <div className="form-group text-grid">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Material</label>
                  <select
                    className="form-select"
                    value={formData.material}
                    onChange={e => setFormData({...formData, material: e.target.value})}
                  >
                    <option value="">Seleccione</option>
                    <option value="oro">Oro</option>
                    <option value="plata">Plata</option>
                    <option value="oro_laminado">Oro Laminado</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Categoría</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    disabled={!formData.material}
                  >
                    <option value="">Seleccione</option>
                    {formData.material && categories[formData.material].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe la pieza (dimensiones, tipo de corte, quilates, etc.)..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Añadir Imagen (Enlace / URL)</label>
              <div className="url-input-wrap">
                <input
                  type="text"
                  className="form-input"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="Pegue la URL de la imagen aquí..."
                />
                <button type="button" className="btn-add-url" onClick={handleAddImageUrl}>
                  Añadir
                </button>
              </div>

              <div className="upload-divider">O subir archivo local</div>

              <div className="upload-zone">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', flexDirection: 'column', color: 'rgba(245, 241, 237, 0.5)' }}>
                  <Upload size={24} color="#D8CFBC" />
                  <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>EXAMINAR ARCHIVOS</span>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleImageUpload} />
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="image-preview">
                  {formData.images.map((img) => (
                    <div key={img.id} className="preview-item">
                      {img.isVideo ? <video src={img.src} muted /> : <img src={img.src} alt="preview" />}
                      <div className="remove-image" onClick={() => removeImage(img.id)}>
                        <X size={18} color="#f5f1ed" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn-modal btn-modal-save" onClick={addProduct}>Guardar Pieza</button>
              <button className="btn-modal btn-modal-cancel" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditForm && (
        <div className="modal-overlay" onClick={() => setShowEditForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Editar Pieza</h2>

            <div className="form-group">
              <label className="form-label">Nombre de la Pieza</label>
              <input type="text" className="form-input" value={editFormData.name}
                onChange={e => setEditFormData({...editFormData, name: e.target.value})}
                placeholder="Ej: Aretes Colgantes de Rubí" />
            </div>

            <div className="form-group">
              <label className="form-label">Precio</label>
              <input type="text" className="form-input" value={editFormData.price}
                onChange={e => setEditFormData({...editFormData, price: e.target.value})}
                placeholder="Ej: $3,500" />
            </div>

            <div className="form-group">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="form-label">Material</label>
                  <select className="form-select" value={editFormData.material}
                    onChange={e => setEditFormData({...editFormData, material: e.target.value})}>
                    <option value="">Seleccione</option>
                    <option value="oro">Oro</option>
                    <option value="plata">Plata</option>
                    <option value="oro_laminado">Oro Laminado</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Categoría</label>
                  <select className="form-select" value={editFormData.category}
                    onChange={e => setEditFormData({...editFormData, category: e.target.value})}
                    disabled={!editFormData.material}>
                    <option value="">Seleccione</option>
                    {editFormData.material && categories[editFormData.material].map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea className="form-textarea" value={editFormData.description}
                onChange={e => setEditFormData({...editFormData, description: e.target.value})}
                placeholder="Describe la pieza..." />
            </div>

            <div className="form-group">
              <label className="form-label">Imágenes actuales</label>
              {editFormData.images.length > 0 && (
                <div className="image-preview">
                  {editFormData.images.map((img) => (
                    <div key={img.id} className="preview-item">
                      {img.isVideo ? <video src={img.src} muted /> : <img src={img.src} alt="preview" />}
                      <div className="remove-image" onClick={() => removeEditImage(img.id)}>
                        <X size={18} color="#FFFBF4" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="form-label" style={{ marginTop: '1rem' }}>Añadir nueva imagen (URL)</label>
              <div className="url-input-wrap">
                <input type="text" className="form-input" value={editUrlInput}
                  onChange={e => setEditUrlInput(e.target.value)}
                  placeholder="Pegue la URL de la imagen aquí..." />
                <button type="button" className="btn-add-url" onClick={handleAddEditImageUrl}>Añadir</button>
              </div>

              <div className="upload-divider">O subir archivo local</div>

              <div className="upload-zone">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', flexDirection: 'column', color: 'rgba(255, 251, 244, 0.5)' }}>
                  <Upload size={24} color="#D8CFBC" />
                  <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>EXAMINAR ARCHIVOS</span>
                  <input type="file" multiple accept="image/*,video/*" onChange={handleEditImageUpload} />
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button className="btn-modal btn-modal-save" onClick={updateProduct}>Guardar Cambios</button>
              <button className="btn-modal btn-modal-cancel" onClick={() => setShowEditForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {/* Luxury Product Detail Modal */}
      {selectedProduct && (
        <div className="detail-overlay">
          <div className="detail-header">
            <div className="back-link" onClick={() => setSelectedProduct(null)}>
              <ChevronLeft size={16} /> Atrás al catálogo
            </div>
            <button className="close-detail" onClick={() => setSelectedProduct(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-images">
                {selectedProduct.images.length > 0 ? (
                  <>
                    <div className="detail-main-image" onClick={() => setEnlargedMedia(selectedProduct.images[activeImageIndex] || selectedProduct.images[0])} style={{ cursor: 'zoom-in' }}>
                      {(selectedProduct.images[activeImageIndex]?.isVideo || selectedProduct.images[0].isVideo) ? (
                        <video src={selectedProduct.images[activeImageIndex]?.src || selectedProduct.images[0].src} controls autoPlay loop muted style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                      ) : (
                        <img src={selectedProduct.images[activeImageIndex]?.src || selectedProduct.images[0].src} alt={selectedProduct.name} />
                      )}
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="detail-thumbnails">
                        {selectedProduct.images.map((img, idx) => (
                          <div 
                            key={idx} 
                            className={`thumbnail ${idx === activeImageIndex ? 'active' : ''}`}
                            onClick={() => setActiveImageIndex(idx)}
                          >
                            {img.isVideo ? <video src={img.src} muted /> : <img src={img.src} alt={`thumb-${idx}`} />}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="detail-main-image">
                    <span className="product-placeholder">Sin Imagen</span>
                  </div>
                )}
              </div>

              <div className="detail-info">
                <h1 className="detail-name">{selectedProduct.name}</h1>
                <p className="detail-price">{selectedProduct.price}</p>
                
                <h3 className="detail-description-title">Descripción</h3>
                <p className="detail-description">
                  {selectedProduct.description || 'Esta exclusiva pieza no cuenta con descripción detallada en este momento.'}
                </p>

                <div className="detail-specs">
                  <div className="spec-row">
                    <span className="spec-label">Material</span>
                    <span className="spec-value">{materialSubtext[selectedProduct.material] || selectedProduct.material}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Categoría</span>
                    <span className="spec-value">{selectedProduct.category}</span>
                  </div>
                </div>

                <div className="actions-block">
                  <button className="btn-whatsapp" onClick={() => handleWhatsAppContact(selectedProduct)}>
                    <Send size={16} /> Preguntar por WhatsApp
                  </button>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn-edit-prod"
                        onClick={() => openEditForm(selectedProduct)}
                        title="Editar producto"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-delete-prod"
                        onClick={() => deleteProduct(selectedProduct.id)}
                        title="Eliminar producto"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {enlargedMedia && (
        <div className="enlarged-overlay" onClick={() => setEnlargedMedia(null)}>
          <button className="enlarged-close" onClick={() => setEnlargedMedia(null)}><X size={24} /></button>
          {enlargedMedia.isVideo ? (
            <video src={enlargedMedia.src} controls autoPlay loop className="enlarged-media" onClick={e => e.stopPropagation()} />
          ) : (
            <img src={enlargedMedia.src} alt="Enlarged" className="enlarged-media" onClick={e => e.stopPropagation()} />
          )}
        </div>
      )}

      {/* Main Catalog Screens */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        {currentPage === 'home' && !selectedMaterial && (
          <>
            <section className="hero">
              <h1 className="hero-title">Sanze</h1>
              <p className="hero-subtitle">Oro, Plata & Oro Laminado</p>
              
              {/* Elegant search bar on home */}
              <div className="search-bar-container">
                <Search className="search-icon" size={18} />
                <input 
                  type="text" 
                  className="search-bar" 
                  placeholder="Buscar arracadas, cadenas, dijes..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </section>

            {searchQuery.trim() ? (
              <div className="section">
                <h2 className="section-title">Resultados de búsqueda ({filteredProducts.length})</h2>
                {filteredProducts.length > 0 ? (
                  <div className="products-grid">
                    {filteredProducts.map((product) => (
                      <div
                        key={product.id}
                        className="product-card"
                        onClick={() => viewProductDetail(product)}
                      >
                        <div className="product-image">
                          <span className="product-material-badge">{materialNames[product.material] || product.material}</span>
                          {product.images && product.images.length > 0 ? (
                            product.images[0].isVideo ? (
                              <video src={product.images[0].src} muted loop playsInline style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                              <img src={product.images[0].src} alt={product.name} />
                            )
                          ) : (
                            <span className="product-placeholder">Sin imagen</span>
                          )}
                        </div>
                        <div className="product-info-wrap">
                          <h3 className="product-name">{product.name}</h3>
                          <p className="product-price">{product.price}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No encontramos ninguna pieza con "{searchQuery}".</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="materials-grid">
                  <div className="material-block" onClick={() => goToMaterial('oro')}>
                    <div className="material-text">Oro</div>
                  </div>
                  <div className="material-block" onClick={() => goToMaterial('plata')}>
                    <div className="material-text">Plata</div>
                  </div>
                  <div className="material-block" onClick={() => goToMaterial('oro_laminado')}>
                    <div className="material-text">Oro Laminado</div>
                  </div>
                </div>

                <section className="section" style={{ textAlign: 'center', paddingBottom: '8rem' }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontStyle: 'italic', lineHeight: '1.8', color: 'rgba(255, 251, 244, 0.70)', maxWidth: '700px', margin: '0 auto', fontWeight: 300 }}>
                    "Joyas exclusivas diseñadas para reflejar tu elegancia natural y trascender el tiempo."
                  </p>
                </section>
              </>
            )}
          </>
        )}

        {selectedMaterial && !selectedCategory && (
          <div className="section">
            <div className="back-link" onClick={() => goToMaterial(null)}>← Volver al inicio</div>
            <h1 className="section-title">Colección de {materialNames[selectedMaterial]}</h1>

            <div className="categories-grid">
              {categories[selectedMaterial].map((category) => (
                <div
                  key={category}
                  className="category-card"
                  onClick={() => goToCategory(category)}
                >
                  <p className="category-name">{category}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedCategory && (() => {
          const materialData = products?.[selectedMaterial];
          const rawItems = materialData?.[selectedCategory];
          const categoryItems = Array.isArray(rawItems) ? rawItems : (rawItems && typeof rawItems === 'object' ? Object.values(rawItems) : []);
          return (
            <div className="section">
              <div className="back-link" onClick={() => goToCategory(null)}>← Volver a {materialNames[selectedMaterial]}</div>
              <h1 className="section-title">{selectedCategory}</h1>

              {categoryItems.length > 0 ? (
                <div className="products-grid">
                  {categoryItems.map((product) => (
                    <div
                      key={product.id}
                      className="product-card"
                      onClick={() => viewProductDetail(product)}
                    >
                      <div className="product-image">
                        <span className="product-material-badge">{materialNames[product.material] || product.material}</span>
                        {product.images && (Array.isArray(product.images) ? product.images : Object.values(product.images)).length > 0 ? (
                          (Array.isArray(product.images) ? product.images : Object.values(product.images))[0].isVideo ? (
                            <video src={(Array.isArray(product.images) ? product.images : Object.values(product.images))[0].src} muted loop playsInline style={{ pointerEvents: 'none', width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <img src={(Array.isArray(product.images) ? product.images : Object.values(product.images))[0].src} alt={product.name} />
                          )
                        ) : (
                          <span className="product-placeholder">Sin Imagen</span>
                        )}
                      </div>
                      <div className="product-info-wrap">
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-price">{product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <p>No hay piezas registradas en esta categoría aún.</p>
                </div>
              )}
            </div>
          );
        })()}
      </main>

      <footer className="footer" style={{ position: 'relative', zIndex: 1 }}>
        <div className="footer-content">
          <div className="footer-section">
            <h3>Joyería Sanze</h3>

            <p>&copy; {new Date().getFullYear()} Joyería Sanze. Todos los derechos reservados.</p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Teléfono: +52 866 100 51 58<br />Dirección: Monclova, Coahuila</p>
          </div>
          <div className="footer-section">
            <h3>Síguenos</h3>
            <p>Instagram: @sanze.joyeria<br />Facebook: Sanze Joyería</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>Desarrollado a medida • Monclova, Coahuila</p>
        </div>
      </footer>

      {/* Float Action Plus Button */}
      {isAdmin && (
        <button className="add-btn" onClick={() => setShowAddForm(true)} title="Añadir nueva pieza">
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}
