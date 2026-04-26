import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const API = "http://localhost:8080/api/products";

const CATEGORIES = ["Electronics", "Furniture", "Stationery", "Clothing", "Food", "Other"];

function StatCard({ label, value, color, icon }) {
  return (
    <div style={{
      background: "#fff",
      border: `2px solid ${color}`,
      borderRadius: 12,
      padding: "20px 24px",
      flex: 1,
      minWidth: 160,
      boxShadow: `0 2px 12px ${color}22`
    }}>
      <div style={{ fontSize: 28, marginBottom: 4 }}>{icon}</div>
      <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "monospace" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#666", marginTop: 2 }}>{label}</div>
    </div>
  );
}

const emptyForm = { name: "", description: "", category: "Electronics", price: "", quantity: "", lowStockThreshold: 10 };

export default function App() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [showLowStock, setShowLowStock] = useState(false);
  const [modal, setModal] = useState(null); // null | "add" | "edit" | "restock"
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [restockId, setRestockId] = useState(null);
  const [restockQty, setRestockQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes] = await Promise.all([
        axios.get(API),
        axios.get(`${API}/stats`)
      ]);
      setProducts(prodRes.data);
      setStats(statsRes.data);
      setError("");
    } catch (e) {
      setError("Could not connect to backend. Make sure Spring Boot is running on port 8080.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const openAdd = () => { setForm(emptyForm); setModal("add"); };
  const openEdit = (p) => {
    setForm({ name: p.name, description: p.description || "", category: p.category, price: p.price, quantity: p.quantity, lowStockThreshold: p.lowStockThreshold });
    setEditId(p.id);
    setModal("edit");
  };
  const openRestock = (p) => { setRestockId(p.id); setRestockQty(10); setModal("restock"); };

  const handleSubmit = async () => {
    if (!form.name || !form.price || !form.quantity) { setError("Name, price, and quantity are required."); return; }
    setSubmitting(true);
    try {
      if (modal === "add") {
        await axios.post(API, { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
        showToast("✅ Product added!");
      } else {
        await axios.put(`${API}/${editId}`, { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) });
        showToast("✅ Product updated!");
      }
      setModal(null);
      fetchAll();
    } catch (e) {
      setError("Failed to save product. Check all fields.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await axios.delete(`${API}/${id}`);
      showToast("🗑️ Product deleted.");
      fetchAll();
    } catch { setError("Delete failed."); }
  };

  const handleRestock = async () => {
    try {
      await axios.patch(`${API}/${restockId}/restock?quantity=${restockQty}`);
      showToast(`✅ Restocked +${restockQty} units!`);
      setModal(null);
      fetchAll();
    } catch { setError("Restock failed."); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCategory === "All" || p.category === filterCategory;
    const matchLow = !showLowStock || p.quantity <= p.lowStockThreshold;
    return matchSearch && matchCat && matchLow;
  });

  const categories = ["All", ...new Set(products.map(p => p.category))];

  return (
    <div style={{ minHeight: "100vh", background: "#f5f6fa", fontFamily: "'Segoe UI', sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1a2e", color: "#fff", padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800, letterSpacing: 1 }}>📦 InventoryMS</h1>
          <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>Spring Boot + MySQL + React</div>
        </div>
        <button onClick={openAdd} style={{ background: "#e94560", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
          + Add Product
        </button>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 16px" }}>
        {/* Error banner */}
        {error && (
          <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "12px 16px", marginBottom: 16, color: "#c0392b", fontSize: 14 }}>
            ⚠️ {error} <button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", cursor: "pointer", color: "#c0392b" }}>✕</button>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 24 }}>
          <StatCard label="Total Products" value={stats.totalProducts ?? "—"} color="#6c63ff" icon="📦" />
          <StatCard label="Inventory Value" value={stats.totalInventoryValue ? `₹${stats.totalInventoryValue.toLocaleString("en-IN", { maximumFractionDigits: 0 })}` : "—"} color="#00b894" icon="💰" />
          <StatCard label="Low Stock Alerts" value={stats.lowStockCount ?? "—"} color="#e17055" icon="⚠️" />
          <StatCard label="Categories" value={stats.categories ?? "—"} color="#0984e3" icon="🏷️" />
        </div>

        {/* Filters */}
        <div style={{ background: "#fff", borderRadius: 12, padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", boxShadow: "0 1px 6px #0001" }}>
          <input
            placeholder="🔍 Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "8px 14px", fontSize: 14, flex: 1, minWidth: 200 }}
          />
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            style={{ border: "1px solid #ddd", borderRadius: 8, padding: "8px 14px", fontSize: 14, background: "#fff" }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer" }}>
            <input type="checkbox" checked={showLowStock} onChange={e => setShowLowStock(e.target.checked)} />
            Low Stock Only
          </label>
          <button onClick={fetchAll} style={{ background: "#f0f0f0", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
            🔄 Refresh
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#888" }}>Loading products...</div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 6px #0001" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#1a1a2e", color: "#fff" }}>
                  {["ID", "Name", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 600, fontSize: 13 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: "center", padding: 40, color: "#aaa" }}>No products found.</td></tr>
                ) : filtered.map((p, i) => {
                  const isLow = p.quantity <= p.lowStockThreshold;
                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #f0f0f0", background: i % 2 === 0 ? "#fafafa" : "#fff" }}>
                      <td style={{ padding: "12px 16px", color: "#888" }}>#{p.id}</td>
                      <td style={{ padding: "12px 16px", fontWeight: 600 }}>
                        {p.name}
                        {p.description && <div style={{ fontSize: 12, color: "#999", fontWeight: 400 }}>{p.description}</div>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: "#e8f4fd", color: "#0984e3", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{p.category}</span>
                      </td>
                      <td style={{ padding: "12px 16px", fontWeight: 700 }}>₹{p.price.toLocaleString("en-IN")}</td>
                      <td style={{ padding: "12px 16px" }}>{p.quantity}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: isLow ? "#fff0f0" : "#f0fff4", color: isLow ? "#e74c3c" : "#27ae60", borderRadius: 6, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>
                          {isLow ? "⚠️ Low" : "✅ OK"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => openEdit(p)} style={{ background: "#6c63ff", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Edit</button>
                          <button onClick={() => openRestock(p)} style={{ background: "#00b894", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Restock</button>
                          <button onClick={() => handleDelete(p.id)} style={{ background: "#e74c3c", color: "#fff", border: "none", borderRadius: 6, padding: "5px 12px", cursor: "pointer", fontSize: 12 }}>Del</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {(modal === "add" || modal === "edit") && (
        <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 460, boxShadow: "0 8px 40px #0003" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 20 }}>{modal === "add" ? "Add Product" : "Edit Product"}</h2>
            {[
              { label: "Product Name *", key: "name", type: "text" },
              { label: "Description", key: "description", type: "text" },
              { label: "Price (₹) *", key: "price", type: "number" },
              { label: "Quantity *", key: "quantity", type: "number" },
              { label: "Low Stock Threshold", key: "lowStockThreshold", type: "number" }
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>{f.label}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }}
                />
              </div>
            ))}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 4 }}>Category *</label>
              <select value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))}
                style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "8px 12px", fontSize: 14 }}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, background: "#1a1a2e", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>
                {submitting ? "Saving..." : modal === "add" ? "Add Product" : "Update Product"}
              </button>
              <button onClick={() => setModal(null)} style={{ flex: 1, background: "#f0f0f0", border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", fontSize: 14 }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Restock Modal */}
      {modal === "restock" && (
        <div style={{ position: "fixed", inset: 0, background: "#0008", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: "100%", maxWidth: 360, boxShadow: "0 8px 40px #0003" }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 20 }}>🔄 Restock Product</h2>
            <label style={{ fontSize: 13, color: "#555", display: "block", marginBottom: 6 }}>Quantity to Add</label>
            <input type="number" min={1} value={restockQty} onChange={e => setRestockQty(parseInt(e.target.value))}
              style={{ width: "100%", border: "1px solid #ddd", borderRadius: 8, padding: "10px 12px", fontSize: 16, boxSizing: "border-box", marginBottom: 20 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleRestock} style={{ flex: 1, background: "#00b894", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontWeight: 700, cursor: "pointer", fontSize: 14 }}>Confirm</button>
              <button onClick={() => setModal(null)} style={{ flex: 1, background: "#f0f0f0", border: "none", borderRadius: 8, padding: "11px", cursor: "pointer", fontSize: 14 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, background: "#1a1a2e", color: "#fff", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, boxShadow: "0 4px 20px #0003", zIndex: 200 }}>
          {toast}
        </div>
      )}
    </div>
  );
}
