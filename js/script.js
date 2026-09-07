document.addEventListener('DOMContentLoaded', () => {
  // Reveal elements on scroll using IntersectionObserver
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('in'));
  }

  // Subtle animated network background grid canvas
  const canvas = document.getElementById('grid-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = Math.min(window.innerHeight * 1.4, 1400);
    }

    function initNodes() {
      const count = Math.min(60, Math.floor((w * h) / 28000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(56,189,248,0.10)';
      ctx.fillStyle = 'rgba(139,92,246,0.55)';
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            ctx.globalAlpha = 1 - dist / 130;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }
      if (!reducedMotion) requestAnimationFrame(draw);
    }

    resize();
    initNodes();
    draw();
    window.addEventListener('resize', () => {
      resize();
      initNodes();
    });
  }

  // Command-by-command terminal typing animation
  const terminal = document.querySelector('.terminal-window');
  if (terminal) {
    const commands = [...terminal.querySelectorAll('.terminal-command')];
    const outputs = [...terminal.querySelectorAll('.terminal-output')];
    const cursor = terminal.querySelector('.terminal-cursor');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let started = false;

    const wait = (duration) => new Promise((resolve) => setTimeout(resolve, duration));

    function clearTerminal() {
      commands.forEach((command) => {
        command.textContent = '';
        command.closest('.terminal-line').style.display = 'none';
      });
      outputs.forEach((output) => {
        output.textContent = '';
        output.classList.remove('visible');
        output.style.display = 'none';
      });
      if (cursor) cursor.style.display = 'none';
    }

    async function typeTerminal() {
      if (started) return;
      started = true;

      while (true) {
        for (let i = 0; i < commands.length; i++) {
          clearTerminal();

          const command = commands[i];
          const commandLine = command.closest('.terminal-line');
          const output = outputs[i];
          commandLine.style.display = 'flex';
          output.style.display = 'block';
          commandLine.appendChild(cursor);
          if (cursor) cursor.style.display = 'inline-block';

          for (const character of command.dataset.command) {
            command.textContent += character;
            await wait(reducedMotion ? 0 : 58);
          }
          await wait(reducedMotion ? 250 : 360);
          output.textContent = `→ ${output.dataset.output}`;
          output.classList.add('visible');
          if (cursor) cursor.style.display = 'none';
          await wait(reducedMotion ? 1200 : 1500);
        }
      }
    }

    clearTerminal();
    const startTerminal = () => {
      const bounds = terminal.getBoundingClientRect();
      if (bounds.top < window.innerHeight && bounds.bottom > 0) typeTerminal();
    };

    if ('IntersectionObserver' in window) {
      const terminalObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          typeTerminal();
          window.removeEventListener('scroll', startTerminal);
          terminalObserver.disconnect();
        }
      }, { threshold: 0.35 });
      terminalObserver.observe(terminal);
      window.addEventListener('scroll', startTerminal, { passive: true });
      startTerminal();
    } else {
      typeTerminal();
    }
  }
});
