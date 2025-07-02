'use client'
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()
export const useCart = () => useContext(CartContext)

export function CartProvider({ children }) {
  const [userId, setUserId] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userId')
    }
    return null
  })

  const [cartItems, setCartItems] = useState([])

  // userId өөрчлөгдөх үед тухайн user-ийн cart-ийг localStorage-с унших
  useEffect(() => {
    if (typeof window !== "undefined" && userId) {
      const items = JSON.parse(localStorage.getItem(`cart_${userId}`) || '[]')
      setCartItems(items)
    }
    if (typeof window !== "undefined" && !userId) {
      setCartItems([])
    }
  }, [userId])

  // cart өөрчлөгдөх бүрт localStorage-д хадгалах
  useEffect(() => {
    if (userId) {
      localStorage.setItem(`cart_${userId}`, JSON.stringify(cartItems))
    }
  }, [cartItems, userId])

  const addToCart = (product, selectedSize) => {
    setCartItems((prev) => {
      const exists = prev.find(
        (item) => item._id === product._id && item.size === (product.size || selectedSize)
      )
      if (exists) {
        return prev.map((item) =>
          item._id === product._id && item.size === (product.size || selectedSize)
            ? { ...item, quantity: item.quantity + (product.quantity || 1) }
            : item
        )
      }
      return [
        ...prev,
        {
          ...product,
          size: selectedSize,
          image: product.images?.[0] || '',
          quantity: product.quantity || 1,
        },
      ]
    })
  }

  const removeFromCart = (id, size) => {
    setCartItems((prev) =>
      prev.filter((item) => !(item._id === id && item.size === size))
    )
  }

  const clearCart = () => setCartItems([])

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        clearCart,
        userId,
        setUserId, 
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
