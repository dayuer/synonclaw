// @alpha: 产品管理页面（保留模块）
import { useState, useEffect, useCallback } from 'react'
import { getProducts, addProduct, toggleProductStatus } from '../data/mockData'
import type { Product, ProductType } from '../data/types'

interface ProductForm {
  name: string
  type: ProductType
  specs: string
  price: number
  description: string
}

const EMPTY_FORM: ProductForm = {
  name: '', type: 'desktop', specs: '', price: 0, description: '',
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [errors, setErrors] = useState<Partial<Record<keyof ProductForm, string>>>({})

  const refresh = useCallback(() => setProducts(getProducts()), [])
  useEffect(() => { refresh() }, [refresh])

  const validate = (): boolean => {
    const e: typeof errors = {}
    if (!form.name.trim()) e.name = '产品名称不能为空'
    if (form.price <= 0) e.price = '请输入有效价格'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleAdd = () => {
    if (!validate()) return
    addProduct({
      name: form.name,
      type: form.type,
      specs: form.specs,
      price: form.price,
      status: 'active',
      description: form.description,
    })
    setShowModal(false)
    setForm(EMPTY_FORM)
    refresh()
  }

  const handleToggle = (id: string) => {
    toggleProductStatus(id)
    refresh()
  }

  return (
    <div>
      <div className="admin-page-header">
        <h1 className="admin-page-header__title">产品管理</h1>
        <p className="admin-page-header__subtitle">管理 SynonClaw 硬件产品目录</p>
      </div>

      <div className="admin-table-wrapper">
        <div className="admin-table-toolbar">
          <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-small)' }}>
            {products.length} 个产品
          </span>
          <button className="admin-btn admin-btn--primary" onClick={() => { setForm(EMPTY_FORM); setErrors({}); setShowModal(true) }}>
            + 新增产品
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>产品名</th>
              <th>类型</th>
              <th>规格</th>
              <th>价格</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td style={{ fontWeight: 600 }}>{p.name}</td>
                <td>{p.type === 'desktop' ? '桌面级' : '机架式'}</td>
                <td style={{ fontSize: 'var(--text-xs)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.specs}</td>
                <td>¥{p.price.toLocaleString()}</td>
                <td>
                  <span className={`status-badge status-badge--${p.status}`}>
                    <span className="status-badge__dot" />
                    {p.status === 'active' ? '在售' : '下架'}
                  </span>
                </td>
                <td>
                  <label className="toggle-switch">
                    <input type="checkbox" checked={p.status === 'active'} onChange={() => handleToggle(p.id)} />
                    <span className="toggle-switch__slider" />
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3 className="admin-modal__title">新增产品</h3>
              <button className="admin-modal__close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="admin-modal__body">
              <div className="admin-form-group">
                <label className="admin-form-label">产品名 *</label>
                <input className={`admin-form-input ${errors.name ? 'error' : ''}`}
                  value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} placeholder="产品名称" />
                {errors.name && <p className="admin-form-error">{errors.name}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">类型</label>
                <select className="admin-form-select" value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value as ProductType }))}>
                  <option value="desktop">桌面级</option>
                  <option value="rack">机架式</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">规格</label>
                <input className="admin-form-input" value={form.specs} onChange={e => setForm(prev => ({ ...prev, specs: e.target.value }))} placeholder="硬件规格" />
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">价格 (¥) *</label>
                <input className={`admin-form-input ${errors.price ? 'error' : ''}`} type="number"
                  value={form.price} onChange={e => setForm(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))} />
                {errors.price && <p className="admin-form-error">{errors.price}</p>}
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">描述</label>
                <textarea className="admin-form-textarea" value={form.description}
                  onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} placeholder="产品描述" rows={3} />
              </div>
            </div>
            <div className="admin-modal__footer">
              <button className="admin-btn admin-btn--secondary" onClick={() => setShowModal(false)}>取消</button>
              <button className="admin-btn admin-btn--primary" onClick={handleAdd}>创建</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
