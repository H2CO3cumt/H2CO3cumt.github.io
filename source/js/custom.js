(() => {
  'use strict'

  const items = document.querySelectorAll('.reveal-item')
  if (!items.length) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(item => item.classList.add('is-visible'))
    return
  }

  document.documentElement.classList.add('motion-ready')

  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      entry.target.classList.add('is-visible')
      currentObserver.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 })

  items.forEach(item => observer.observe(item))
})()
