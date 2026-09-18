'use client'
import * as React from 'react'

export type CartItem = {
  id: string
  slug: string
  name: string
  price: number
  image: string | null
  quantity: number
  stock: number
  sku: string
  detail?: string
}

type CartState = {
  items: CartItem[]
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  remove: (id: string) => void
  setQty: (id: string, qty: number) => void
  clear: () => void
  count: number
  subtotal: number
  hydrated: boolean
}

const CartContext = React.createContext<CartState | null>(null)
const KEY = 'gat-cart-v1'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [hydrated, setHydrated] = React.useState(false)
  const currentItems = React.useRef<CartItem[]>([])

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY)
      if (raw) {
        currentItems.current = JSON.parse(raw)
        setItems(currentItems.current)
      }
    } catch {}
    setHydrated(true)
  }, [])
  const updateItems = (next: CartItem[]) => {
    currentItems.current = next
    try { localStorage.setItem(KEY, JSON.stringify(next)) } catch {}
    setItems(next)
  }

  const add: CartState['add'] = (item, qty = 1) => {
    const prev = currentItems.current
    const existing = prev.find((i) => i.id === item.id)
    updateItems(existing
      ? prev.map((i) => (i.id === item.id ? { ...i, quantity: Math.min(item.stock, i.quantity + qty), stock: item.stock, price: item.price } : i))
      : [...prev, { ...item, quantity: Math.min(item.stock, qty) }])
  }
  const remove = (id: string) => updateItems(currentItems.current.filter((i) => i.id !== id))
  const setQty = (id: string, qty: number) => updateItems(currentItems.current.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(i.stock, qty)) } : i)))
  const clear = () => updateItems([])
  const count = items.reduce((a, i) => a + i.quantity, 0)
  const subtotal = items.reduce((a, i) => a + i.quantity * i.price, 0)

  return <CartContext.Provider value={{ items, add, remove, setQty, clear, count, subtotal, hydrated }}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = React.useContext(CartContext)
  if (!ctx) throw new Error('useCart fora do CartProvider')
  return ctx
}
