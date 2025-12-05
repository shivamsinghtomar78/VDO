import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useCallback } from 'react'

const toastStore = {
  listeners: [],
  toasts: [],
  
  subscribe: (listener) => {
    toastStore.listeners.push(listener)
    return () => {
      toastStore.listeners = toastStore.listeners.filter(l => l !== listener)
    }
  },
  
  notify: (message, type = 'info', duration = 4000) => {
    const id = Math.random()
    const toast = { id, message, type }
    toastStore.toasts.push(toast)
    toastStore.listeners.forEach(l => l([...toastStore.toasts]))
    
    if (duration > 0) {
      setTimeout(() => {
        toastStore.toasts = toastStore.toasts.filter(t => t.id !== id)
        toastStore.listeners.forEach(l => l([...toastStore.toasts]))
      }, duration)
    }
    
    return id
  }
}

export function useToast() {
  const [toasts, setToasts] = useState([])
  
  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])
  
  return {
    success: (msg) => toastStore.notify(msg, 'success'),
    error: (msg) => toastStore.notify(msg, 'error'),
    info: (msg) => toastStore.notify(msg, 'info'),
    warning: (msg) => toastStore.notify(msg, 'warning'),
  }
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])
  
  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none space-y-3">
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            className={`p-4 rounded-lg text-white pointer-events-auto max-w-sm ${
              toast.type === 'success' ? 'bg-emerald-600' :
              toast.type === 'error' ? 'bg-red-600' :
              toast.type === 'warning' ? 'bg-yellow-600' :
              'bg-blue-600'
            }`}
          >
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
