import React, { useState } from 'react';
import { Upload, X } from 'lucide-react';

export default function SanzeCatalog() {
  const categories = {
    oro: ['Arracadas', 'Broquel', 'Huggie', 'Arete', 'Cadena', 'Dije', 'Pulso', 'Esclava'],
    plata: ['Arracadas', 'Broquel', 'Huggie', 'Arete', 'Cadena', 'Dije', 'Pulso', 'Esclava']
  };

  const [currentPage, setCurrentPage] = useState('home');
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState({
    oro: {
      'Arracadas': [],
      'Broquel': [],
      'Huggie': [],
      'Arete': [],
      'Cadena': [],
      'Dije': [],
      'Pulso': [],
      'Esclava': []
    },
    plata: {
      'Arracadas': [],
      'Broquel': [],
      'Huggie': [],
      'Arete': [],
      'Cadena': [],
      'Dije': [],
      'Pulso': [],
      'Esclava': []
    }
  });

  const [showAddForm, setShowAddForm] = useState(false);
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
          images: [...prev.images, { src: event.target.result, id: Date.now() }]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const addProduct = () => {
    if (formData.name && formData.price && formData.material && formData.category && formData.images.length > 0) {
      const newProduct = {
        id: Date.now(),
        name: formData.name,
        price: formData.price,
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

  return (
    <div style={{ backgroundColor: '#0b0b0b', color: '#f5f1ed', minHeight: '100vh', fontFamily: 'system-ui, -apple-system, sans-serif', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant:wght@400;500;600;700&family=Outfit:wght@300;400;500;600&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          background-color: #0b0b0b;
          background-image: 
            linear-gradient(45deg, rgba(154, 133, 96, 0.02) 25%, transparent 25%),
            linear-gradient(-45deg, rgba(154, 133, 96, 0.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(154, 133, 96, 0.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(154, 133, 96, 0.02) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          color: #f5f1ed;
        }

        .header {
          position: sticky;
          top: 0;
          background-color: rgba(11, 11, 11, 0.95);
          backdrop-filter: blur(8px);
          border-bottom: 1px solid rgba(154, 133, 96, 0.15);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 90;
        }

        .logo {
          font-family: 'Cormorant', serif;
          font-size: 1.6rem;
          font-weight: 600;
          letter-spacing: 0.15em;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }

        .logo:hover {
          opacity: 0.7;
        }

        .header-nav {
          display: flex;
          gap: 2.5rem;
          align-items: center;
        }

        .nav-link {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.1em;
          cursor: pointer;
          font-weight: 300;
          color: #f5f1ed;
          transition: all 0.3s ease;
          opacity: 0.8;
          border-bottom: 1px solid transparent;
        }

        .nav-link:hover {
          opacity: 1;
          border-bottom-color: #9a8560;
        }

        .hero {
          padding: 6rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }

        .hero-title {
          font-family: 'Cormorant', serif;
          font-size: 4rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          margin-bottom: 1rem;
          opacity: 0;
          animation: fadeInDown 0.8s ease-out forwards;
        }

        .hero-subtitle {
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          letter-spacing: 0.15em;
          color: rgba(245, 241, 237, 0.6);
          font-weight: 300;
          opacity: 0;
          animation: fadeInUp 0.8s ease-out 0.2s forwards;
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(15px);
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

        .materials-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3rem;
          max-width: 1000px;
          margin: 4rem auto;
          padding: 0 2rem;
          animation: fadeIn 0.6s ease-out 0.3s forwards;
          opacity: 0;
        }

        .material-block {
          aspect-ratio: 1;
          border: 1px solid rgba(154, 133, 96, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.5s ease;
          position: relative;
          overflow: hidden;
        }

        .material-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background-color: rgba(154, 133, 96, 0);
          transition: background-color 0.5s ease;
        }

        .material-block:hover::before {
          background-color: rgba(154, 133, 96, 0.08);
        }

        .material-block:hover {
          border-color: rgba(154, 133, 96, 0.5);
          box-shadow: inset 0 0 30px rgba(154, 133, 96, 0.1);
        }

        .material-text {
          font-family: 'Cormorant', serif;
          font-size: 2.5rem;
          font-weight: 600;
          letter-spacing: 0.12em;
          position: relative;
          z-index: 1;
          text-transform: uppercase;
        }

        .section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 2rem;
          animation: fadeIn 0.6s ease-out;
        }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          color: rgba(245, 241, 237, 0.6);
          cursor: pointer;
          transition: color 0.3s ease;
          margin-bottom: 2rem;
          text-transform: uppercase;
          font-weight: 300;
        }

        .back-link:hover {
          color: #f5f1ed;
        }

        .section-title {
          font-family: 'Cormorant', serif;
          font-size: 3rem;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
          border-bottom: 1px solid rgba(154, 133, 96, 0.2);
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .category-card {
          border: 1px solid rgba(154, 133, 96, 0.2);
          padding: 2rem;
          cursor: pointer;
          transition: all 0.4s ease;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .category-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background-color: rgba(154, 133, 96, 0);
          transition: background-color 0.4s ease;
          pointer-events: none;
        }

        .category-card:hover {
          border-color: rgba(154, 133, 96, 0.6);
          box-shadow: 0 0 30px rgba(154, 133, 96, 0.15);
        }

        .category-card:hover::after {
          background-color: rgba(154, 133, 96, 0.05);
        }

        .category-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          font-weight: 400;
          text-transform: uppercase;
          position: relative;
          z-index: 1;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 3rem;
          margin: 2rem 0;
        }

        .product-card {
          cursor: pointer;
          animation: fadeIn 0.5s ease-out;
        }

        .product-image {
          width: 100%;
          aspect-ratio: 1;
          background-color: rgba(154, 133, 96, 0.06);
          border: 1px dashed rgba(154, 133, 96, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.2rem;
          overflow: hidden;
          transition: all 0.3s ease;
          position: relative;
        }

        .product-card:hover .product-image {
          border-color: rgba(154, 133, 96, 0.4);
          background-color: rgba(154, 133, 96, 0.08);
        }

        .product-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .product-placeholder {
          color: rgba(245, 241, 237, 0.3);
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          text-align: center;
          letter-spacing: 0.08em;
        }

        .product-name {
          font-family: 'Cormorant', serif;
          font-size: 1.2rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          letter-spacing: 0.08em;
          color: rgba(245, 241, 237, 0.6);
          font-weight: 300;
        }

        .detail-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(11, 11, 11, 0.98);
          z-index: 100;
          overflow-y: auto;
          animation: fadeIn 0.4s ease-out;
        }

        .detail-header {
          position: sticky;
          top: 0;
          background-color: rgba(11, 11, 11, 0.95);
          border-bottom: 1px solid rgba(154, 133, 96, 0.1);
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          z-index: 101;
          backdrop-filter: blur(8px);
        }

        .close-detail {
          background: none;
          border: none;
          color: rgba(245, 241, 237, 0.6);
          cursor: pointer;
          font-size: 1.5rem;
          transition: color 0.3s ease;
        }

        .close-detail:hover {
          color: #f5f1ed;
        }

        .detail-content {
          max-width: 1400px;
          margin: 0 auto;
          padding: 3rem 2rem;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-bottom: 3rem;
        }

        .detail-images {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .detail-main-image {
          width: 100%;
          aspect-ratio: 1;
          background-color: rgba(154, 133, 96, 0.06);
          border: 1px solid rgba(154, 133, 96, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .detail-main-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-thumbnails {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.8rem;
        }

        .thumbnail {
          aspect-ratio: 1;
          background-color: rgba(154, 133, 96, 0.06);
          border: 1px solid rgba(154, 133, 96, 0.15);
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .thumbnail:hover {
          border-color: rgba(154, 133, 96, 0.4);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .detail-info {
          display: flex;
          flex-direction: column;
          justify-content: flex-start;
        }

        .detail-name {
          font-family: 'Cormorant', serif;
          font-size: 2.2rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }

        .detail-price {
          font-family: 'Outfit', sans-serif;
          font-size: 1.1rem;
          letter-spacing: 0.08em;
          color: rgba(245, 241, 237, 0.7);
          margin-bottom: 2rem;
          font-weight: 300;
        }

        .detail-description {
          font-family: 'Outfit', sans-serif;
          font-size: 0.95rem;
          line-height: 1.7;
          color: rgba(245, 241, 237, 0.75);
          margin-bottom: 2.5rem;
          font-weight: 300;
        }

        .detail-specs {
          border-top: 1px solid rgba(154, 133, 96, 0.15);
          border-bottom: 1px solid rgba(154, 133, 96, 0.15);
          padding: 1.5rem 0;
          margin-bottom: 2rem;
        }

        .spec-row {
          display: grid;
          grid-template-columns: 120px 1fr;
          gap: 2rem;
          margin-bottom: 1rem;
          font-family: 'Outfit', sans-serif;
        }

        .spec-label {
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-weight: 500;
          color: rgba(245, 241, 237, 0.5);
        }

        .spec-value {
          font-size: 0.9rem;
          color: rgba(245, 241, 237, 0.8);
          font-weight: 300;
        }

        .delete-btn {
          background-color: rgba(220, 53, 69, 0.15);
          border: 1px solid rgba(220, 53, 69, 0.4);
          color: #dc3545;
          padding: 0.8rem 1.5rem;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .delete-btn:hover {
          background-color: rgba(220, 53, 69, 0.25);
          border-color: rgba(220, 53, 69, 0.7);
        }

        .footer {
          background-color: #000000;
          border-top: 1px solid rgba(154, 133, 96, 0.2);
          padding: 3rem 2rem;
          margin-top: 4rem;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .footer-section h3 {
          font-family: 'Cormorant', serif;
          font-size: 0.95rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          font-weight: 600;
        }

        .footer-section p {
          font-family: 'Outfit', sans-serif;
          font-size: 0.85rem;
          line-height: 1.6;
          color: rgba(245, 241, 237, 0.6);
          font-weight: 300;
        }

        .footer-bottom {
          text-align: center;
          font-family: 'Outfit', sans-serif;
          font-size: 0.8rem;
          color: rgba(245, 241, 237, 0.4);
          border-top: 1px solid rgba(154, 133, 96, 0.1);
          padding-top: 1.5rem;
        }

        .add-btn {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          width: 50px;
          height: 50px;
          background-color: rgba(154, 133, 96, 0.2);
          border: 1px solid rgba(154, 133, 96, 0.4);
          color: #9a8560;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          transition: all 0.3s ease;
          z-index: 50;
        }

        .add-btn:hover {
          background-color: rgba(154, 133, 96, 0.35);
          border-color: rgba(154, 133, 96, 0.7);
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          background-color: rgba(11, 11, 11, 0.85);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 200;
          animation: fadeIn 0.3s ease-out;
          padding: 2rem;
        }

        .modal {
          background-color: #1a1a1a;
          border: 1px solid rgba(154, 133, 96, 0.2);
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
          animation: fadeInUp 0.3s ease-out;
        }

        .modal-title {
          font-family: 'Cormorant', serif;
          font-size: 1.8rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid rgba(154, 133, 96, 0.2);
          padding-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-bottom: 0.6rem;
          font-weight: 500;
          color: rgba(245, 241, 237, 0.7);
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          padding: 0.9rem;
          background-color: rgba(154, 133, 96, 0.05);
          border: 1px solid rgba(154, 133, 96, 0.2);
          color: #f5f1ed;
          font-family: 'Outfit', sans-serif;
          font-size: 0.9rem;
          font-weight: 300;
          transition: all 0.3s ease;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          background-color: rgba(154, 133, 96, 0.1);
          border-color: rgba(154, 133, 96, 0.4);
        }

        .form-textarea {
          resize: vertical;
          min-height: 100px;
        }

        .upload-zone {
          border: 2px dashed rgba(154, 133, 96, 0.3);
          padding: 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s ease;
          background-color: rgba(154, 133, 96, 0.02);
        }

        .upload-zone:hover {
          border-color: rgba(154, 133, 96, 0.6);
          background-color: rgba(154, 133, 96, 0.08);
        }

        .upload-zone input {
          display: none;
        }

        .image-preview {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
          gap: 0.8rem;
          margin-top: 1rem;
        }

        .preview-item {
          position: relative;
          aspect-ratio: 1;
          overflow: hidden;
          border: 1px solid rgba(154, 133, 96, 0.2);
          background-color: rgba(154, 133, 96, 0.05);
        }

        .preview-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .remove-image {
          position: absolute;
          inset: 0;
          background-color: rgba(11, 11, 11, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
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

        .btn {
          padding: 0.8rem 1.5rem;
          border: none;
          cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .btn-save {
          background-color: rgba(154, 133, 96, 0.25);
          border: 1px solid rgba(154, 133, 96, 0.4);
          color: #9a8560;
        }

        .btn-save:hover {
          background-color: rgba(154, 133, 96, 0.4);
          border-color: rgba(154, 133, 96, 0.7);
        }

        .btn-cancel {
          background-color: transparent;
          border: 1px solid rgba(154, 133, 96, 0.2);
          color: rgba(245, 241, 237, 0.6);
        }

        .btn-cancel:hover {
          border-color: rgba(154, 133, 96, 0.5);
          color: #f5f1ed;
        }

        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: rgba(245, 241, 237, 0.4);
          font-family: 'Outfit', sans-serif;
        }

        @media (max-width: 768px) {
          .detail-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .products-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 1.5rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .material-block {
            aspect-ratio: auto;
            padding: 2rem;
          }

          .materials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <header className="header">
        <div className="logo" onClick={goHome}>Sanze</div>
        <nav className="header-nav">
          <div className="nav-link" onClick={() => goToMaterial('oro')}>Oro</div>
          <div className="nav-link" onClick={() => goToMaterial('plata')}>Plata</div>
        </nav>
      </header>

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Añadir Pieza</h2>

            <div className="form-group">
              <label className="form-label">Nombre</label>
              <input
                type="text"
                className="form-input"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="Ej: Arete de perla"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Precio</label>
              <input
                type="text"
                className="form-input"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                placeholder="Ej: $450"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Material</label>
              <select
                className="form-select"
                value={formData.material}
                onChange={e => setFormData({...formData, material: e.target.value})}
              >
                <option value="">Selecciona</option>
                <option value="oro">Oro</option>
                <option value="plata">Plata</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select
                className="form-select"
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value})}
                disabled={!formData.material}
              >
                <option value="">Selecciona</option>
                {formData.material && categories[formData.material].map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Descripción</label>
              <textarea
                className="form-textarea"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Describe la pieza..."
              />
            </div>

            <div className="form-group">
              <label className="form-label">Imágenes</label>
              <div className="upload-zone">
                <label style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', flexDirection: 'column', color: 'rgba(245, 241, 237, 0.6)' }}>
                  <Upload size={20} />
                  <span>Haz clic o arrastra imágenes</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} />
                </label>
              </div>
              {formData.images.length > 0 && (
                <div className="image-preview">
                  {formData.images.map((img) => (
                    <div key={img.id} className="preview-item">
                      <img src={img.src} alt="preview" />
                      <div className="remove-image" onClick={() => removeImage(img.id)}>
                        <X size={16} color="#f5f1ed" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-actions">
              <button className="btn btn-save" onClick={addProduct}>Guardar</button>
              <button className="btn btn-cancel" onClick={() => setShowAddForm(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {selectedProduct && (
        <div className="detail-overlay">
          <div className="detail-header">
            <div className="back-link" onClick={() => setSelectedProduct(null)}>← Atrás</div>
            <button className="close-detail" onClick={() => setSelectedProduct(null)}>✕</button>
          </div>

          <div className="detail-content">
            <div className="detail-grid">
              <div className="detail-images">
                {selectedProduct.images.length > 0 && (
                  <>
                    <div className="detail-main-image">
                      <img src={selectedProduct.images[0].src} alt={selectedProduct.name} />
                    </div>
                    {selectedProduct.images.length > 1 && (
                      <div className="detail-thumbnails">
                        {selectedProduct.images.map((img, idx) => (
                          <div key={idx} className="thumbnail">
                            <img src={img.src} alt={`thumb-${idx}`} />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="detail-info">
                <h1 className="detail-name">{selectedProduct.name}</h1>
                <p className="detail-price">{selectedProduct.price}</p>
                {selectedProduct.description && <p className="detail-description">{selectedProduct.description}</p>}

                <div className="detail-specs">
                  <div className="spec-row">
                    <span className="spec-label">Material</span>
                    <span className="spec-value">{selectedProduct.material === 'oro' ? 'Oro' : 'Plata'}</span>
                  </div>
                  <div className="spec-row">
                    <span className="spec-label">Tipo</span>
                    <span className="spec-value">{selectedProduct.category}</span>
                  </div>
                </div>

                <button className="delete-btn" onClick={() => { deleteProduct(selectedProduct.id); setSelectedProduct(null); }}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <main style={{ position: 'relative' }}>
        {currentPage === 'home' && !selectedMaterial && (
          <>
            <section className="hero">
              <h1 className="hero-title">Sanze</h1>
              <p className="hero-subtitle">Joyería artesanal en oro y plata</p>
            </section>

            <div className="materials-grid">
              <div className="material-block" onClick={() => goToMaterial('oro')}>
                <div className="material-text">Oro</div>
              </div>
              <div className="material-block" onClick={() => goToMaterial('plata')}>
                <div className="material-text">Plata</div>
              </div>
            </div>

            <section className="section" style={{ textAlign: 'center', paddingTop: '5rem', paddingBottom: '5rem' }}>
              <p style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.95rem', lineHeight: '1.8', color: 'rgba(245, 241, 237, 0.7)', maxWidth: '500px', margin: '0 auto', fontWeight: 300 }}>
                Cada pieza es creada con precisión artesanal. Trabajamos con los mejores materiales para crear joyería que trasciende el tiempo.
              </p>
            </section>
          </>
        )}

        {selectedMaterial && !selectedCategory && (
          <div className="section">
            <div className="back-link" onClick={() => goToMaterial(null)}>← Atrás</div>
            <h1 className="section-title">{selectedMaterial === 'oro' ? 'Oro' : 'Plata'}</h1>

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
            <div className="back-link" onClick={() => goToCategory(null)}>← Atrás</div>
            <h1 className="section-title">{selectedCategory}</h1>

            {products[selectedMaterial][selectedCategory].length > 0 ? (
              <div className="products-grid">
                {products[selectedMaterial][selectedCategory].map((product) => (
                  <div
                    key={product.id}
                    className="product-card"
                    onClick={() => viewProductDetail(product)}
                  >
                    <div className="product-image">
                      {product.images.length > 0 ? (
                        <img src={product.images[0].src} alt={product.name} />
                      ) : (
                        <span className="product-placeholder">Insertar imagen aquí</span>
                      )}
                    </div>
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-price">{product.price}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No hay piezas en esta categoría aún.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Sanze</h3>
            <p>Joyería artesanal en oro y plata. Diseños únicos creados con dedicación y precisión.</p>
          </div>
          <div className="footer-section">
            <h3>Contacto</h3>
            <p>Email: hola@joyeriasanze.mx<br />Teléfono: +52 1 234 567 8900<br />Monclova, Coahuila</p>
          </div>
          <div className="footer-section">
            <h3>Síguenos</h3>
            <p>Instagram: @joyeriasanze<br />Pinterest: Sanze Jewelry</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Joyería Sanze. Todos los derechos reservados.</p>
        </div>
      </footer>

      <button className="add-btn" onClick={() => setShowAddForm(true)} title="Añadir pieza">
        +
      </button>
    </div>
  );
}