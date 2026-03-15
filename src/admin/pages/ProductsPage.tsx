// @alpha: 产品管理页面
import { useState, useEffect, useCallback } from 'react'
import { getProducts, addProduct, updateProduct, toggleProductStatus } from '../data/mockData'
import type { Product, ProductType, ProductStatus } from '../data/types'

interface ProductFormData {
  name: string
  type: ProductType
  specs: string
  price: string
  description: string
  status: ProductStatus
}

const EMPTY_FORM: ProductFormData = {
  name: '', type: 'desktop', specs: '', price: '', description: '', status: 'active',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<ProductFormData>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({})

  const refresh = useCallback(() => setProducts(getProducts()), [])

  useEffect(() => { refresh() }, [refresh])

  const openCreate = () => {
    setEditingId(null)
    setForm(EMPTY_FORM)
    setErrors({})
    setShowModal(true)
  }

  const openEdit = (product: Product) => {
    setEditingId(product.id)
    setForm({
      name: product.name,
      type: product.type,
      specs: product.specs,
      price: String(product.price),
      description: product.description,
      status: product.status,
    })
    setErrors({})
    setShowModal(true)
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!form.name.trim()) newErrors.name = '产品名不能为空'
    const price = Number(form.price)
    if (!form.price || isNaN(price) || price <= 0) newErrors.price = '请输入有效价格'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return

    if (editingId) {
      updateProduct(editingId, {
        name: form.name,
        type: form.type,
        specs: form.specs,
        price: Number(form.price),
        description: form.description,
        status: form.status,
      })
    } else {
      addProduct({
        name: form.name,
        type: form.type,
        specs: form.specs,
        price: Number(form.price),
        description: form.description,
        status: form.status,
      })
    }

    setShowModal(false)
    refresh()
  }

  const handleToggleStatus = (id: string) => {
    toggleProductStatus(id)
    refresh()
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">产品管理</h1>
        <p className="admin-page-header__subtitle">管理 SynonClaw 硬件产品线</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <div className="admin-table-toolbar__left">
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
              共 {products.length} 个产品
            </span>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={openCreate}>+ 新增产品</button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>类型</th>
              <th>规格</th>
              <th>价格</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr><td colSpan={6}>
                <div className="admin-empty">
                  <div className="admin-empty__icon">🖥️</div>
                  <p className="admin-empty__title">暂无产品</p>
                  <p className="admin-empty__desc">点击"新增产品"添加第一个产品</p>
                </div>
              </td></tr>
            ) : products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>
                  <span className={`status-badge ${p.type === 'desktop' ? 'status-badge--pending' : 'status-badge--shipped'}`}>
                    {p.type === 'desktop' ? '桌面级' : '机柜'}
                  </span>
                </td>
                <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.specs}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>¥{p.price.toLocaleString()}</td>
                <td>
                  <label className="admin-switch">
                    <input type="checkbox" checked={p.status === 'active'} onChange={() => handleToggleStatus(p.id)} />
                    <span className="admin-switch__slider" />
                  </label>
                </td>
                <td>
                  <div className="admin-table__actions">
                    <button className="admin-btn admin-btn--ghost admin-btn--sm" onClick={() => openEdit(p)}>编辑</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 新增/编辑模态框 */}
      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">{editingId ? '编辑产品' : '新增产品'}</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-group">
                <label className="admin-form-label">产品名称 *</label>
                <input
                  className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="例如: SynonClaw Desk Pro"
                />
                {errors.name && <p className="admin-form-error">{errors.name}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">产品类型</label>
                <select
                  className="admin-form-select"
                  value={form.type}
                  onChange={e => setForm(prev => ({ ...prev, type: e.target.value as ProductType }))}
                >
                  <option value="desktop">桌面级</option>
                  <option value="rack">机柜</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">规格参数</label>
                <input
                  className="admin-form-input"
                  value={form.specs}
                  onChange={e => setForm(prev => ({ ...prev, specs: e.target.value }))}
                  placeholder="例如: AMD Ryzen 9 / 64GB DDR5 / RTX 4090"
                />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">价格 (¥) *</label>
                <input
                  className={`admin-form-input ${errors.price ? 'error' : ''}`}
                  type="number"
                  value={form.price}
                  onChange={e => setForm(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="例如: 29999"
                />
                {errors.price && <p className="admin-form-error">{errors.price}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">产品描述</label>
                <textarea
                  className="admin-form-textarea"
                  value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="产品介绍..."
                />
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleSave}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
