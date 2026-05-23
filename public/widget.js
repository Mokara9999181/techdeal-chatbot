(function () {
  // Styles injizieren
  const style = document.createElement('style')
  style.textContent = `
    #techdeal-bubble {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: #7c3aed;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 4px 16px rgba(124,58,237,0.4);
      z-index: 9999;
      transition: transform 0.2s;
    }
    #techdeal-bubble:hover { transform: scale(1.1); }
    #techdeal-iframe {
      position: fixed;
      bottom: 96px;
      right: 24px;
      width: 400px;
      height: 600px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.16);
      z-index: 9998;
      display: none;
      transition: opacity 0.2s;
    }
    @media (max-width: 480px) {
      #techdeal-iframe {
        width: 100vw;
        height: 100vh;
        bottom: 0;
        right: 0;
        border-radius: 0;
      }
    }
  `
  document.head.appendChild(style)

  // Bubble erstellen
  const bubble = document.createElement('div')
  bubble.id = 'techdeal-bubble'
  bubble.innerHTML = '🤖'
  document.body.appendChild(bubble)

  // iframe erstellen
  const iframe = document.createElement('iframe')
  iframe.id = 'techdeal-iframe'
  iframe.src = 'https://techdeal-chatbot-production.up.railway.app'
  document.body.appendChild(iframe)

  // Toggle
  let open = false
  bubble.addEventListener('click', () => {
    open = !open
    iframe.style.display = open ? 'block' : 'none'
    bubble.innerHTML = open ? '✕' : '🤖'
  })
})()