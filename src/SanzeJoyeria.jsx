import React, { useState, useEffect } from 'react';
import { Upload, X, Trash2, Plus, ChevronLeft, Send, Search, Download, RefreshCw } from 'lucide-react';
import initialProductsData from './productos.json';

const DEFAULT_PRODUCTS = {
  oro: {
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

export default function SanzeCatalog() {
  const categories = {
    oro: ['Arete', 'Arracada', 'Broquel', 'Cadena', 'Dije', 'Esclava', 'Huggie', 'Pulso'],
    plata: ['Arete', 'Arracada', 'Broquel', 'Cadena', 'Dije', 'Esclava', 'Huggie', 'Pulso']
  };

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsAdmin(params.get('admin') === 'true');
  }, []);
  
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

  // Save to localStorage when products change
  useEffect(() => {
    localStorage.setItem('sanze_catalog_products_v2', JSON.stringify(products));
  }, [products]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [urlInput, setUrlInput] = useState('');
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
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, { src: event.target.result, id: Date.now() + Math.random() }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddImageUrl = () => {
    if (urlInput.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, { src: urlInput.trim(), id: Date.now() + Math.random() }]
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

      setProducts(prev => ({
        ...prev,
        [formData.material]: {
          ...prev[formData.material],
          [formData.category]: [...prev[formData.material][formData.category], newProduct]
        }
      }));

      setFormData({
        name: '',
        price: '',
        description: '',
        material: '',
        category: '',
        images: []
      });
      setShowAddForm(false);
    }
  };

  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  const deleteProduct = (productId) => {
    setProducts(prev => {
      const newProducts = { ...prev };
      Object.keys(newProducts).forEach(material => {
        Object.keys(newProducts[material]).forEach(category => {
          newProducts[material][category] = newProducts[material][category].filter(p => p.id !== productId);
        });
      });
      return newProducts;
    });
    setSelectedProduct(null);
  };

  const goHome = () => {
    setCurrentPage('home');
    setSelectedMaterial(null);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSearchQuery('');
  };

  const goToMaterial = (material) => {
    setSelectedMaterial(material);
    setSelectedCategory(null);
    setSelectedProduct(null);
  };

  const goToCategory = (category) => {
    setSelectedCategory(category);
    setSelectedProduct(null);
  };

  const viewProductDetail = (product) => {
    setSelectedProduct(product);
  };

  // Search logic
  const getAllProducts = () => {
    const list = [];
    Object.keys(products).forEach(material => {
      Object.keys(products[material]).forEach(category => {
        products[material][category].forEach(p => {
          list.push(p);
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
    const message = `Hola Joyería Sanze, estoy interesado en recibir información de la pieza de catálogo:\n\n*${product.name}*\nMaterial: ${product.material === 'oro' ? 'Oro' : 'Plata'}\nCategoría: ${product.category}\nPrecio: ${product.price}\n\nEnlace: ${window.location.href}`;
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
      window.location.reload();
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-main)', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', 'Outfit', sans-serif", position: 'relative', overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        :root {
          --bg-primary: #1a1a1a;
          --bg-secondary: #222222;
          --bg-card: #222222;
          --bg-card-hover: #2a2a2a;
          --accent: #C2D8C4;
          --accent-hover: #d1e2d3;
          --accent-glow: rgba(194, 216, 196, 0.15);
          --border: rgba(255, 255, 255, 0.08);
          --border-hover: rgba(194, 216, 196, 0.3);
          --text-main: #f3efeb;
          --text-muted: #a4adab;
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
            radial-gradient(circle at 5% 15%, rgba(194, 216, 196, 0.04) 0%, transparent 35%),
            radial-gradient(circle at 95% 85%, rgba(194, 216, 196, 0.04) 0%, transparent 35%);
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
          background: rgba(194, 216, 196, 0.2);
          border-radius: 4px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(194, 216, 196, 0.4);
        }

        /* Glassmorphism Header */
        .header {
          position: sticky;
          top: 0;
          background-color: rgba(10, 10, 12, 0.85);
          backdrop-filter: blur(25px);
          -webkit-backdrop-filter: blur(25px);
          border-bottom: 1px solid var(--border);
          padding: 1rem 3rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 90;
          transition: var(--transition);
        }

        .logo {
          font-family: 'Outfit', sans-serif;
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          cursor: pointer;
          color: var(--text-main);
          background: linear-gradient(135deg, #ffffff 40%, var(--accent) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: var(--transition);
        }

        .logo:hover {
          opacity: 0.9;
        }

        .header-nav {
          display: flex;
          gap: 2rem;
          align-items: center;
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
        }

        .hero::before {
          content: '';
          position: absolute;
          top: -10%;
          width: 250px;
          height: 250px;
          background: radial-gradient(circle, var(--accent-glow) 0%, transparent 70%);
          z-index: -1;
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: 4.8rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
          background: linear-gradient(to bottom, #ffffff 50%, var(--text-muted) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          line-height: 1;
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
        }

        /* Materials Grid */
        .materials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 900px;
          margin: 1rem auto 4rem auto;
          padding: 0 2rem;
          opacity: 0;
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
        }

        .material-block {
          aspect-ratio: 1.6;
          border: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(24, 25, 31, 0.5) 0%, rgba(18, 19, 24, 0.8) 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
          border-radius: var(--rounded-lg);
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
          border-color: var(--border-hover);
          transform: translateY(-6px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.4), 0 0 20px var(--accent-glow);
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
          background: linear-gradient(135deg, #ffffff 40%, var(--accent) 100%);
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
        }

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
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.3);
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
          animation: fadeIn 0.5s ease-out;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          transition: var(--transition);
          position: relative;
          border-radius: var(--rounded-md);
        }

        .product-card:hover .product-image {
          border-color: var(--border-hover);
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.4);
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .product-card:hover .product-image img {
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
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          padding: 0 0.2rem;
        }

        .product-name {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text-main);
          line-height: 1.3;
          transition: var(--transition);
        }

        .product-card:hover .product-name {
          color: var(--accent);
        }

        .product-price {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--accent);
          font-weight: 600;
        }

        /* Luxury Detail Overlay */
        .detail-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(10, 10, 12, 0.92);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 100;
          overflow-y: auto;
          animation: fadeIn 0.3s ease-out;
        }

        .detail-header {
          position: sticky;
          top: 0;
          background-color: rgba(10, 10, 12, 0.85);
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

        .detail-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
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

        .thumbnail img {
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
          box-shadow: 0 12px 28px rgba(0,0,0,0.5), 0 0 25px rgba(194, 216, 196, 0.5);
        }

        @keyframes btnPulse {
          0% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 0 rgba(194, 216, 196, 0.4);
          }
          70% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 12px rgba(194, 216, 196, 0);
          }
          100% {
            box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 0 rgba(194, 216, 196, 0);
          }
        }

        /* Modals & Forms */
        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(10, 10, 12, 0.85);
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
          background-color: rgba(223, 178, 108, 0.1);
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
          color: #121215;
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
          background-color: rgba(223, 178, 108, 0.03);
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

        .preview-item img {
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
          background-color: #08080a;
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

      {/* Admin Bar */}
      {isAdmin && (
        <div style={{
          backgroundColor: 'var(--accent)',
          color: '#121215',
          padding: '0.6rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.85rem',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: '600',
          zIndex: 95,
          position: 'sticky',
          top: 0,
          borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span>🛠️</span> MODO ADMINISTRADOR ACTIVO
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
          </div>
        </div>
      )}

      {/* Main Luxury Header */}
      <header className="header">
        <div className="logo" onClick={goHome}>Joyería Sanze</div>
        <nav className="header-nav">
          <div className="nav-link" onClick={() => goToMaterial('oro')}>Oro</div>
          <div className="nav-link" onClick={() => goToMaterial('plata')}>Plata</div>
          <div className="nav-link" onClick={goHome}>Colección</div>
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
                  <Upload size={24} color="#9a8560" />
                  <span style={{ fontSize: '0.8rem', letterSpacing: '0.1em' }}>EXAMINAR ARCHIVOS</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>

              {formData.images.length > 0 && (
                <div className="image-preview">
                  {formData.images.map((img) => (
                    <div key={img.id} className="preview-item">
                      <img src={img.src} alt="preview" />
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
                    <div className="detail-main-image">
                      <img src={selectedProduct.images[0].src} alt={selectedProduct.name} />
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="detail-thumbnails">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="thumbnail active">
                            <img src={img.src} alt={`thumb-${idx}`} />
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
                    <span className="spec-value">{selectedProduct.material === 'oro' ? 'Oro Sólido' : 'Plata de Ley .925'}</span>
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
                    <button 
                      className="btn-delete-prod" 
                      onClick={() => deleteProduct(selectedProduct.id)} 
                      title="Eliminar producto"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Catalog Screens */}
      <main style={{ position: 'relative' }}>
        {currentPage === 'home' && !selectedMaterial && (
          <>
            <section className="hero">
              <h1 className="hero-title">Sanze</h1>
              <p className="hero-subtitle">Joyería Selecta en Oro & Plata</p>
              
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
                          {product.images && product.images.length > 0 ? (
                            <img src={product.images[0].src} alt={product.name} />
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
                    <div className="material-tagline">Piezas en 14k y 18k</div>
                  </div>
                  <div className="material-block" onClick={() => goToMaterial('plata')}>
                    <div className="material-text">Plata</div>
                    <div className="material-tagline">Plata Fina Ley .925</div>
                  </div>
                </div>

                <section className="section" style={{ textAlign: 'center', paddingBottom: '8rem' }}>
                  <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.5rem', fontStyle: 'italic', lineHeight: '1.8', color: 'rgba(245, 241, 237, 0.75)', maxWidth: '700px', margin: '0 auto', fontWeight: 300 }}>
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
            <h1 className="section-title">Colección de {selectedMaterial === 'oro' ? 'Oro' : 'Plata'}</h1>

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

        {selectedCategory && (
          <div className="section">
            <div className="back-link" onClick={() => goToCategory(null)}>← Volver a {selectedMaterial === 'oro' ? 'Oro' : 'Plata'}</div>
            <h1 className="section-title">{selectedCategory}</h1>

            {products[selectedMaterial][selectedCategory] && products[selectedMaterial][selectedCategory].length > 0 ? (
              <div className="products-grid">
                {products[selectedMaterial][selectedCategory].map((product) => (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => viewProductDetail(product)}
                  >
                    <div className="product-image">
                      {product.images && product.images.length > 0 ? (
                        <img src={product.images[0].src} alt={product.name} />
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
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Joyería Sanze</h3>
            <p style={{ marginBottom: '1.5rem' }}>Elegancia y distinción esculpida en metales preciosos. Diseños hechos para contar tu historia.</p>
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