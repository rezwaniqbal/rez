/*
  Culture Fair III B Trainer (static)
  - Practice: mixed and specific types
  - Rule Learning Mode: interactive lessons
  - Exam Mode: timed, score tracking
  - Immediate feedback + ELI10 explanations with simple animations
*/

;(function(){
  'use strict'

  // ---------- Utilities ----------
  const $ = (sel, root=document) => root.querySelector(sel)
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel))

  function setActiveView(viewId){
    $$('.view').forEach(v=>v.classList.remove('active'))
    $(`#${viewId}`).classList.add('active')
    $$('.nav-btn').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.nav === viewId.replace('-view',''))))
  }

  // Simple seeded RNG for reproducibility
  let rngSeed = Date.now() % 2147483647
  function srand(seed){ rngSeed = seed || Date.now() % 2147483647 }
  function rand(){ return (rngSeed = (rngSeed * 48271) % 2147483647) / 2147483647 }
  function randInt(min, max){ return Math.floor(rand() * (max - min + 1)) + min }
  function choice(arr){ return arr[Math.floor(rand()*arr.length)] }
  function shuffle(arr){
    const a = arr.slice()
    for(let i=a.length-1;i>0;i--){ const j = Math.floor(rand()*(i+1)); [a[i],a[j]] = [a[j],a[i]] }
    return a
  }

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)) }

  // Colors limited palette for shapes
  const COLORS = ['#f43f5e','#fb923c','#f59e0b','#22c55e','#06b6d4','#3b82f6','#8b5cf6','#ec4899']

  // ---------- SVG Helpers ----------
  function createSvg(width, height){
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`)
    svg.setAttribute('class','svg-board')
    return svg
  }
  function makeGroup(){ return document.createElementNS('http://www.w3.org/2000/svg','g') }
  function makeRect(x,y,w,h,opts={}){
    const el = document.createElementNS('http://www.w3.org/2000/svg','rect')
    el.setAttribute('x',x); el.setAttribute('y',y); el.setAttribute('width',w); el.setAttribute('height',h)
    el.setAttribute('rx', opts.rx ?? 10)
    el.setAttribute('fill', opts.fill ?? 'none')
    if(opts.stroke){ el.setAttribute('stroke',opts.stroke); el.setAttribute('stroke-width', opts.strokeWidth ?? 2) }
    if(opts.opacity){ el.setAttribute('opacity', opts.opacity) }
    return el
  }
  function makeCircle(cx,cy,r,opts={}){
    const el = document.createElementNS('http://www.w3.org/2000/svg','circle')
    el.setAttribute('cx',cx); el.setAttribute('cy',cy); el.setAttribute('r',r)
    el.setAttribute('fill', opts.fill ?? 'none')
    if(opts.stroke){ el.setAttribute('stroke',opts.stroke); el.setAttribute('stroke-width', opts.strokeWidth ?? 2) }
    if(opts.opacity){ el.setAttribute('opacity', opts.opacity) }
    return el
  }
  function makePolygon(points,opts={}){
    const el = document.createElementNS('http://www.w3.org/2000/svg','polygon')
    el.setAttribute('points', points.map(p=>p.join(',')).join(' '))
    el.setAttribute('fill', opts.fill ?? 'none')
    if(opts.stroke){ el.setAttribute('stroke',opts.stroke); el.setAttribute('stroke-width', opts.strokeWidth ?? 2) }
    if(opts.opacity){ el.setAttribute('opacity', opts.opacity) }
    return el
  }
  function makePath(d,opts={}){
    const el = document.createElementNS('http://www.w3.org/2000/svg','path')
    el.setAttribute('d',d)
    el.setAttribute('fill', opts.fill ?? 'none')
    if(opts.stroke){ el.setAttribute('stroke',opts.stroke); el.setAttribute('stroke-width', opts.strokeWidth ?? 2) }
    if(opts.opacity){ el.setAttribute('opacity', opts.opacity) }
    if(opts.transform){ el.setAttribute('transform', opts.transform) }
    return el
  }
  function rotate(el, deg, cx, cy){ el.setAttribute('transform', `rotate(${deg} ${cx} ${cy})`) }
  function translate(el, dx, dy){ el.setAttribute('transform', `translate(${dx} ${dy})`) }

  function drawShape(kind, cx, cy, size, opts={}){
    const s = clamp(size, 8, 90)
    const stroke = opts.stroke ?? '#fff'
    const fill = opts.filled ? (opts.fill ?? stroke) : 'none'
    const strokeWidth = opts.strokeWidth ?? 3
    switch(kind){
      case 'square': {
        const half = s
        return makeRect(cx-half, cy-half, s*2, s*2, { fill, stroke, strokeWidth, rx: opts.rounded ? 10 : 3 })
      }
      case 'circle': return makeCircle(cx, cy, s, { fill, stroke, strokeWidth })
      case 'triangle': {
        const h = s * Math.sqrt(3)
        const points = [[cx, cy - h/2],[cx - s, cy + h/2],[cx + s, cy + h/2]]
        return makePolygon(points, { fill, stroke, strokeWidth })
      }
      case 'diamond': {
        const points = [[cx, cy - s],[cx - s, cy],[cx, cy + s],[cx + s, cy]]
        return makePolygon(points, { fill, stroke, strokeWidth })
      }
      case 'star': {
        const points = []
        const spikes = 5
        const outer = s, inner = s*0.5
        for(let i=0;i<spikes*2;i++){
          const r = i%2===0? outer: inner
          const a = (Math.PI * i)/spikes
          points.push([cx + Math.cos(a- Math.PI/2)*r, cy + Math.sin(a- Math.PI/2)*r])
        }
        return makePolygon(points, { fill, stroke, strokeWidth })
      }
      default: return makeCircle(cx, cy, s, { fill, stroke, strokeWidth })
    }
  }

  function drawGrid(svg, rows, cols, cellCb){
    const pad = 10
    const width = 420, height = 420
    svg.setAttribute('viewBox','0 0 420 420')
    const cellW = (width - pad*2) / cols
    const cellH = (height - pad*2) / rows
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        const cell = makeRect(pad + c*cellW, pad + r*cellH, cellW-8, cellH-8, { fill:'#0f1117', stroke:'#232637', rx:8 })
        const g = makeGroup()
        g.appendChild(cell)
        svg.appendChild(g)
        cellCb(g, r, c, pad + c*cellW + (cellW-8)/2, pad + r*cellH + (cellH-8)/2, Math.min(cellW, cellH)/3)
      }
    }
  }

  // ---------- Rule definitions ----------
  const RULES = [
    { id:'rotation', name:'Rotation', desc:"Shapes turn around like a clock. Each step adds some degrees.", demo: demoRotation },
    { id:'reflection', name:'Reflection', desc:"Shapes flip like in a mirror (left-right or up-down).", demo: demoReflection },
    { id:'alternation', name:'Alternation', desc:"Things take turns A, B, A, B…", demo: demoAlternation },
    { id:'progression', name:'Progression', desc:"Something grows or shrinks a little each step.", demo: demoProgression },
    { id:'addremove', name:'Add/Remove', desc:"Parts appear or disappear step by step.", demo: demoAddRemove },
    { id:'shading', name:'Shading/Color', desc:"Fill or color changes in a pattern.", demo: demoShading },
    { id:'numeric', name:'Number Logic', desc:"Numbers follow rules like +2, ×3, or alternating.", demo: demoNumeric },
  ]

  // ---------- Explanations (ELI10) ----------
  const EXPLAIN_TEXT = {
    rotation: 'The picture turns a bit each time. Like a hand on a clock, it keeps rotating by the same amount.',
    reflection: 'The picture flips like looking in a mirror. Left becomes right or top becomes bottom.',
    alternation: 'Two things take turns. First A, then B, then A, then B…',
    progression: 'Something changes a little bit each step, like getting bigger or smaller.',
    addremove: 'We add or take away one part each time.',
    shading: 'The filling or color changes in a simple pattern, like light, dark, light…',
    numeric: 'The numbers follow a rule like add 2, or times 2, or swapping between two rules.'
  }

  // ---------- Question Generators ----------
  // Each returns: { type, prompt, render(boardEl), options: [renderOption(el, idx)], correctIndex, explanation, explainAnim(container) }

  const SHAPES = ['square','circle','triangle','diamond','star']

  function genMatrixQuestion(){
    // 3x3 matrix: use a simple rule across rows and columns
    // Rule candidates: rotation, add/remove element count, shading alternation, shape progression, reflection on last column
    const baseShape = choice(SHAPES)
    const rule = choice(['rotation','addremove','shading','alternation','progression','reflection'])

    // parameters
    const angleStep = [30,45,60,90][randInt(0,3)]
    const countStart = randInt(1,3)
    const countStep = choice([1,1,1,2])
    const sizeStart = randInt(14,22)
    const sizeStep = randInt(3,8)

    const filledStart = rand() > 0.5
    const colorA = choice(COLORS), colorB = choice(COLORS.filter(c=>c!==colorA))

    const missing = randInt(0,8)

    const gridData = []
    for(let r=0;r<3;r++){
      for(let c=0;c<3;c++){
        const idx = r*3+c
        if(rule==='rotation'){
          gridData.push({ shape: baseShape, size: 20, filled: true, color: colorA, rot: angleStep*(r+c) })
        } else if(rule==='addremove'){
          gridData.push({ shape: baseShape, count: countStart + (r*3+c)*countStep, size: 10, color: colorA, filled: false })
        } else if(rule==='shading'){
          const filled = ((r+c)%2===0) ? filledStart : !filledStart
          gridData.push({ shape: baseShape, size: 20, color: filled? colorA: colorB, filled })
        } else if(rule==='alternation'){
          const useA = ((r%2)=== (c%2))
          gridData.push({ shape: useA? baseShape: choice(SHAPES.filter(s=>s!==baseShape)), size: useA? 22: 16, color: useA? colorA: colorB, filled: useA })
        } else if(rule==='progression'){
          gridData.push({ shape: baseShape, size: sizeStart + (r*3+c)*sizeStep, filled: true, color: colorA })
        } else if(rule==='reflection'){
          // Left-to-right reflection across columns
          const flip = c===2
          gridData.push({ shape: baseShape, size: 20, filled: true, color: colorA, reflect: flip && r>0 })
        }
      }
    }

    const correct = gridData[missing]

    function renderBoard(container){
      container.innerHTML = ''
      const svg = createSvg(420,420)
      container.appendChild(svg)
      drawGrid(svg, 3, 3, (g, r, c, cx, cy, baseSize)=>{
        const idx = r*3+c
        const isMissing = idx===missing
        if(isMissing){
          const cell = g.firstChild
          cell.classList.add('missing')
          return
        }
        const d = gridData[idx]
        drawCell(g, d, cx, cy, baseSize)
      })
    }

    function drawCell(g, d, cx, cy, baseSize){
      if(d.count){
        const cols = Math.ceil(Math.sqrt(d.count))
        const gap = 6
        const cellSize = clamp(baseSize*0.9 - gap, 6, 24)
        for(let i=0;i<d.count;i++){
          const rr = Math.floor(i/cols), cc = i%cols
          const x = cx - (cols-1)*(cellSize+gap)/2 + cc*(cellSize+gap)
          const y = cy - (cols-1)*(cellSize+gap)/2 + rr*(cellSize+gap)
          const s = drawShape(d.shape, x, y, cellSize/2, { stroke: d.color, fill: d.color, filled: d.filled })
          g.appendChild(s)
        }
      } else {
        const s = drawShape(d.shape, cx, cy, (d.size ?? baseSize), { stroke: d.color, fill: d.color, filled: d.filled })
        if(d.rot){ rotate(s, d.rot, cx, cy) }
        if(d.reflect){ s.setAttribute('transform','scale(-1,1) translate(' + (-cx*2) + ' 0)') }
        g.appendChild(s)
      }
    }

    function makeOptionData(){
      // Create one correct and several distractors by tweaking rule parameter
      const correctData = correct
      const options = []
      const numOptions = 6
      const correctIndex = randInt(0, numOptions-1)
      for(let i=0;i<numOptions;i++){
        if(i===correctIndex){ options.push(correctData) }
        else {
          // distractor: small param noise or wrong rule variant
          let d = JSON.parse(JSON.stringify(correctData))
          if(rule==='rotation'){ d.rot += choice([-angleStep, angleStep/2, angleStep*2]) }
          else if(rule==='addremove'){ d.count = clamp(d.count + choice([-2,-1,1,2]), 1, 12) }
          else if(rule==='shading'){ d.filled = !d.filled }
          else if(rule==='alternation'){ d.shape = choice(SHAPES.filter(s=>s!==d.shape)) }
          else if(rule==='progression'){ d.size = clamp(d.size + choice([-sizeStep, sizeStep*2, -sizeStep*2]), 8, 60) }
          else if(rule==='reflection'){ d.reflect = !d.reflect }
          options.push(d)
        }
      }
      return { options, correctIndex }
    }

    const { options, correctIndex } = makeOptionData()

    const prompt = 'Complete the 3×3 pattern by choosing the missing tile.'
    const explanation = `${EXPLAIN_TEXT[rule]}`

    function renderOptions(container, onPick){
      container.innerHTML = ''
      options.forEach((opt, idx)=>{
        const card = document.createElement('div')
        card.className = 'option'
        const badge = document.createElement('div')
        badge.className = 'badge'
        badge.textContent = String.fromCharCode(65+idx)
        card.appendChild(badge)
        const svg = createSvg(140,120)
        const cell = makeGroup()
        svg.appendChild(cell)
        const bg = makeRect(6,6,128,108,{ fill:'#0f1117', stroke:'#232637', rx:8 })
        svg.appendChild(bg)
        // draw centered content
        const g = makeGroup(); svg.appendChild(g)
        const cx = 70, cy = 60
        const baseSize = 26
        if(opt.count){
          const cols = Math.ceil(Math.sqrt(opt.count))
          const gap = 4
          const cellSize = clamp(baseSize - gap, 6, 18)
          for(let i=0;i<opt.count;i++){
            const rr = Math.floor(i/cols), cc = i%cols
            const x = cx - (cols-1)*(cellSize+gap)/2 + cc*(cellSize+gap)
            const y = cy - (cols-1)*(cellSize+gap)/2 + rr*(cellSize+gap)
            const s = drawShape(opt.shape, x, y, cellSize/2, { stroke: opt.color, fill: opt.color, filled: opt.filled })
            g.appendChild(s)
          }
        } else {
          const s = drawShape(opt.shape, cx, cy, (opt.size ?? baseSize), { stroke: opt.color, fill: opt.color, filled: opt.filled })
          if(opt.rot){ rotate(s, opt.rot, cx, cy) }
          if(opt.reflect){ s.setAttribute('transform','scale(-1,1) translate(' + (-cx*2) + ' 0)') }
          g.appendChild(s)
        }
        card.appendChild(svg)
        card.addEventListener('click', ()=> onPick(idx))
        container.appendChild(card)
      })
      return { correctIndex }
    }

    function explainAnim(container){
      container.innerHTML = ''
      const svg = createSvg(360,140)
      container.appendChild(svg)
      const cx = 90, cy = 70
      const s1 = drawShape(baseShape, cx, cy, 26, { stroke: colorA, fill: colorA, filled: true })
      svg.appendChild(s1)
      if(rule==='rotation'){
        const arrow = makePath('M 140 70 h 120', { stroke:'#888', strokeWidth:4 })
        svg.appendChild(arrow)
        const s2 = drawShape(baseShape, 280, 70, 26, { stroke: colorA, fill: colorA, filled: true })
        svg.appendChild(s2)
        let t=0
        const animate = ()=>{
          t+=2; rotate(s1, (t)%360, cx, cy); rotate(s2, (t+angleStep)%360, 280, 70); req = requestAnimationFrame(animate)
        }
        let req = requestAnimationFrame(animate)
      } else if(rule==='shading'){
        const arrow = makePath('M 140 70 h 120', { stroke:'#888', strokeWidth:4 })
        svg.appendChild(arrow)
        const s2 = drawShape(baseShape, 280, 70, 26, { stroke: colorB, fill: colorB, filled: !filledStart })
        svg.appendChild(s2)
      } else if(rule==='addremove'){
        const arrow = makePath('M 140 70 h 120', { stroke:'#888', strokeWidth:4 })
        svg.appendChild(arrow)
        for(let i=0;i<3;i++){
          const s = drawShape(baseShape, 70 + i*20, 70, 8, { stroke: colorA, fill: colorA, filled: true })
          svg.appendChild(s)
        }
        for(let i=0;i<5;i++){
          const s = drawShape(baseShape, 240 + i*14, 70, 8, { stroke: colorA, fill: colorA, filled: true })
          svg.appendChild(s)
        }
      } else if(rule==='progression'){
        for(let i=0;i<3;i++){
          const s = drawShape(baseShape, 50 + i*40, 70, 10 + i*6, { stroke: colorA, fill: colorA, filled: true })
          svg.appendChild(s)
        }
        for(let i=0;i<3;i++){
          const s = drawShape(baseShape, 210 + i*40, 70, 10 + (i+1)*6, { stroke: colorA, fill: colorA, filled: true })
          svg.appendChild(s)
        }
      } else if(rule==='alternation'){
        const b = choice(SHAPES.filter(s=>s!==baseShape))
        for(let i=0;i<4;i++){
          const kind = (i%2===0)? baseShape: b
          const s = drawShape(kind, 40 + i*40, 70, 12, { stroke: i%2===0? colorA: colorB, fill: i%2===0? colorA: colorB, filled: true })
          svg.appendChild(s)
        }
      } else if(rule==='reflection'){
        const sL = drawShape(baseShape, 120, 70, 22, { stroke: colorA, fill: colorA, filled: true })
        const mirrorAxis = makePath('M 180 10 v 120', { stroke:'#666', strokeWidth:2 })
        const sR = drawShape(baseShape, 240, 70, 22, { stroke: colorA, fill: colorA, filled: true })
        sR.setAttribute('transform','scale(-1,1) translate(-480 0)')
        svg.appendChild(sL); svg.appendChild(mirrorAxis); svg.appendChild(sR)
      } else if(rule==='numeric'){
        const text = (str, x, y) => { const t=document.createElementNS('http://www.w3.org/2000/svg','text'); t.textContent=str; t.setAttribute('x',x); t.setAttribute('y',y); t.setAttribute('fill','#fff'); t.setAttribute('font-size','22'); t.setAttribute('font-family','Inter, sans-serif'); return t }
        svg.appendChild(text('2, 4, 6, 8, ?', 40, 80))
        svg.appendChild(text('+2 each time', 40, 112))
      }
    }

    return { type:'matrix', prompt, render: renderBoard, renderOptions, correctIndex, explanation, explainAnim, rule }
  }

  function genSeriesQuestion(){
    // Sequence of 5, choose the 6th
    const rule = choice(['rotation','alternation','progression','addremove','shading'])
    const baseShape = choice(SHAPES)
    const colorA = choice(COLORS), colorB = choice(COLORS.filter(c=>c!==colorA))
    const angleStep = [30,45,60,90][randInt(0,3)]
    const sizeStart = randInt(12,22), sizeStep = randInt(3,6)

    const seq = []
    for(let i=0;i<5;i++){
      if(rule==='rotation') seq.push({ shape: baseShape, size: 20, filled: true, color: colorA, rot: i*angleStep })
      if(rule==='alternation'){ const useA = i%2===0; seq.push({ shape: useA? baseShape: choice(SHAPES.filter(s=>s!==baseShape)), size: useA? 22: 16, color: useA? colorA: colorB, filled: true }) }
      if(rule==='progression') seq.push({ shape: baseShape, size: sizeStart + i*sizeStep, filled: true, color: colorA })
      if(rule==='addremove') seq.push({ shape: baseShape, count: 1 + i, size: 10, color: colorA, filled: true })
      if(rule==='shading') seq.push({ shape: baseShape, size: 20, filled: i%2===0, color: i%2===0? colorA: colorB })
    }

    const next = (()=>{
      const i=5
      if(rule==='rotation') return { shape: baseShape, size: 20, filled: true, color: colorA, rot: i*angleStep }
      if(rule==='alternation'){ const useA = i%2===0; return { shape: useA? baseShape: choice(SHAPES.filter(s=>s!==baseShape)), size: useA? 22: 16, color: useA? colorA: colorB, filled: true } }
      if(rule==='progression') return { shape: baseShape, size: sizeStart + i*sizeStep, filled: true, color: colorA }
      if(rule==='addremove') return { shape: baseShape, count: 1 + i, size: 10, color: colorA, filled: true }
      if(rule==='shading') return { shape: baseShape, size: 20, filled: i%2===0, color: i%2===0? colorA: colorB }
    })()

    function renderBoard(container){
      container.innerHTML = ''
      const svg = createSvg(600,160)
      container.appendChild(svg)
      for(let i=0;i<5;i++){
        const x = 60 + i*100, y = 80
        const d = seq[i]
        const s = drawShape(d.shape, x, y, d.size ?? 20, { stroke: d.color, fill: d.color, filled: d.filled })
        if(d.rot){ rotate(s, d.rot, x, y) }
        if(d.count){
          const cols = Math.ceil(Math.sqrt(d.count))
          const gap = 4
          for(let k=0;k<d.count;k++){
            const rr = Math.floor(k/cols), cc = k%cols
            const sx = x - (cols-1)*(10+gap)/2 + cc*(10+gap)
            const sy = y - (cols-1)*(10+gap)/2 + rr*(10+gap)
            const ss = drawShape(d.shape, sx, sy, 5, { stroke: d.color, fill: d.color, filled: true })
            svg.appendChild(ss)
          }
        } else {
          svg.appendChild(s)
        }
      }
    }

    const { options, correctIndex } = (()=>{
      const numOptions = 6
      const idx = randInt(0,numOptions-1)
      const arr = []
      for(let i=0;i<numOptions;i++){
        if(i===idx) arr.push(next)
        else {
          let d = JSON.parse(JSON.stringify(next))
          if(rule==='rotation'){ d.rot += choice([-angleStep, angleStep/2, angleStep*2]) }
          else if(rule==='alternation'){ d.shape = choice(SHAPES.filter(s=>s!==d.shape)) }
          else if(rule==='progression'){ d.size = clamp(d.size + choice([-sizeStep, sizeStep*2]), 8, 60) }
          else if(rule==='addremove'){ d.count = clamp(d.count + choice([-2,-1,1,2]), 1, 12) }
          else if(rule==='shading'){ d.filled = !d.filled }
          arr.push(d)
        }
      }
      return { options: arr, correctIndex: idx }
    })()

    const explanation = EXPLAIN_TEXT[rule]

    function renderOptions(container, onPick){
      container.innerHTML=''
      options.forEach((opt, idx)=>{
        const card = document.createElement('div')
        card.className = 'option'
        const badge = document.createElement('div'); badge.className='badge'; badge.textContent=String.fromCharCode(65+idx); card.appendChild(badge)
        const svg = createSvg(140,120); card.appendChild(svg)
        const cx=70, cy=60
        if(opt.count){
          const cols = Math.ceil(Math.sqrt(opt.count))
          const gap = 4
          for(let k=0;k<opt.count;k++){
            const rr = Math.floor(k/cols), cc = k%cols
            const x = cx - (cols-1)*(12+gap)/2 + cc*(12+gap)
            const y = cy - (cols-1)*(12+gap)/2 + rr*(12+gap)
            svg.appendChild(drawShape(opt.shape, x, y, 6, { stroke: opt.color, fill: opt.color, filled: true }))
          }
        } else {
          const s = drawShape(opt.shape, cx, cy, opt.size ?? 20, { stroke: opt.color, fill: opt.color, filled: true })
          if(opt.rot){ rotate(s, opt.rot, cx, cy) }
          svg.appendChild(s)
        }
        card.addEventListener('click', ()=> onPick(idx))
        container.appendChild(card)
      })
      return { correctIndex }
    }

    function explainAnim(container){
      container.innerHTML=''
      const svg = createSvg(360,140); container.appendChild(svg)
      if(rule==='rotation'){
        const x=80, y=70
        const s = drawShape(baseShape, x, y, 22, { stroke: colorA, fill: colorA, filled: true }); svg.appendChild(s)
        let t=0; const animate=()=>{ t+=2; rotate(s, t, x, y); requestAnimationFrame(animate) }; requestAnimationFrame(animate)
      }
      if(rule==='alternation'){
        for(let i=0;i<6;i++){
          const useA=i%2===0
          svg.appendChild(drawShape(useA? baseShape: 'circle', 40+i*50, 70, 12, { stroke: useA? colorA: colorB, fill: useA? colorA: colorB, filled: true }))
        }
      }
      if(rule==='progression'){
        for(let i=0;i<6;i++) svg.appendChild(drawShape(baseShape, 40+i*50, 70, 8+i*3, { stroke: colorA, fill: colorA, filled: true }))
      }
      if(rule==='addremove'){
        for(let i=0;i<6;i++) svg.appendChild(drawShape(baseShape, 40+i*20, 70, 6, { stroke: colorA, fill: colorA, filled: true }))
      }
      if(rule==='shading'){
        for(let i=0;i<6;i++) svg.appendChild(drawShape(baseShape, 40+i*50, 70, 12, { stroke: i%2===0? colorA: colorB, fill: i%2===0? colorA: colorB, filled: true }))
      }
    }

    return { type:'series', prompt:'What comes next in the series?', render: renderBoard, renderOptions, correctIndex, explanation, explainAnim, rule }
  }

  function genClassificationQuestion(){
    // 5 options: pick the odd one out
    const rule = choice(['rotation','shading','progression','addremove','shape'])
    const baseShape = choice(SHAPES)
    const colorA = choice(COLORS), colorB = choice(COLORS.filter(c=>c!==colorA))

    const options = []
    let correctIndex = 0

    if(rule==='shape'){
      // 4 of same shape, 1 different
      correctIndex = randInt(0,4)
      for(let i=0;i<5;i++){
        const shape = i===correctIndex? choice(SHAPES.filter(s=>s!==baseShape)) : baseShape
        options.push({ shape, size: 22, color: colorA, filled:true })
      }
    } else if(rule==='rotation'){
      correctIndex = randInt(0,4)
      const angleStep = 90
      for(let i=0;i<5;i++){
        const rot = (i===correctIndex)? 45 : (i*angleStep)
        options.push({ shape: baseShape, size: 22, color: colorA, filled:true, rot })
      }
    } else if(rule==='shading'){
      correctIndex = randInt(0,4)
      for(let i=0;i<5;i++){
        const filled = (i===correctIndex)? false : true
        const color = (i===correctIndex)? colorB : colorA
        options.push({ shape: baseShape, size: 22, color, filled })
      }
    } else if(rule==='progression'){
      correctIndex = randInt(0,4)
      const sizeBase = 12
      for(let i=0;i<5;i++){
        const size = (i===correctIndex)? sizeBase : sizeBase + 6
        options.push({ shape: baseShape, size, color: colorA, filled:true })
      }
    } else if(rule==='addremove'){
      correctIndex = randInt(0,4)
      for(let i=0;i<5;i++){
        const count = (i===correctIndex)? 2 : 3
        options.push({ shape: baseShape, count, color: colorA, filled:true })
      }
    }

    function renderBoard(container){
      container.innerHTML = '<div class="prompt">Pick the odd one out.</div>'
    }

    function renderOptions(container, onPick){
      container.innerHTML=''
      options.forEach((opt, idx)=>{
        const card = document.createElement('div')
        card.className='option'
        const badge=document.createElement('div'); badge.className='badge'; badge.textContent=String.fromCharCode(65+idx); card.appendChild(badge)
        const svg=createSvg(140,120); card.appendChild(svg)
        const cx=70, cy=60
        if(opt.count){
          for(let i=0;i<opt.count;i++) svg.appendChild(drawShape(opt.shape, 50+i*18, 60, 8, { stroke: opt.color, fill: opt.color, filled:true }))
        } else {
          const s = drawShape(opt.shape, cx, cy, opt.size ?? 20, { stroke: opt.color, fill: opt.color, filled: opt.filled })
          if(opt.rot){ rotate(s, opt.rot, cx, cy) }
          svg.appendChild(s)
        }
        card.addEventListener('click', ()=> onPick(idx))
        container.appendChild(card)
      })
      return { correctIndex }
    }

    const explanationMap = {
      shape: 'Four are the same kind of shape. One is a different shape — that is the odd one out.',
      rotation: 'Four are turned to neat right angles. One is turned halfway (45°) — that is the odd one out.',
      shading: 'Four are filled the same way. One has different filling/color — that is the odd one out.',
      progression: 'Four are the same size. One is bigger/smaller — that is the odd one out.',
      addremove: 'Four have the same number of parts. One has a different number — that is the odd one out.'
    }

    function explainAnim(container){
      container.innerHTML=''
      const p=document.createElement('p'); p.textContent=explanationMap[rule]; container.appendChild(p)
    }

    return { type:'classification', prompt:'Pick the odd one out.', render: renderBoard, renderOptions, correctIndex, explanation: explanationMap[rule], explainAnim, rule }
  }

  function genAnalogyQuestion(){
    // A:B :: C: ?  Use simple rule on shape/color/rotation
    const rule = choice(['rotation','shading','shape'])
    const A = { shape: choice(SHAPES), color: choice(COLORS), filled:true, size:22, rot:0 }
    let B = JSON.parse(JSON.stringify(A))
    if(rule==='rotation'){ B.rot = 90 }
    if(rule==='shading'){ B.filled = !A.filled }
    if(rule==='shape'){ B.shape = choice(SHAPES.filter(s=>s!==A.shape)) }

    const C = { shape: choice(SHAPES), color: choice(COLORS), filled:true, size:22, rot:0 }
    const D = JSON.parse(JSON.stringify(C))
    if(rule==='rotation'){ D.rot = 90 }
    if(rule==='shading'){ D.filled = !C.filled }
    if(rule==='shape'){ D.shape = choice(SHAPES.filter(s=>s!==C.shape)) }

    function renderBoard(container){
      container.innerHTML=''
      const svg=createSvg(600,180); container.appendChild(svg)
      const positions=[[80,90],[200,90],[360,90],[480,90]]
      const labels=['A','B','C','?']
      ;[A,B,C].forEach((d,i)=>{
        const [x,y]=positions[i]
        svg.appendChild(drawShape(d.shape,x,y,d.size,{stroke:d.color,fill:d.color,filled:true}))
        if(d.rot){ const last=svg.lastChild; rotate(last,d.rot,x,y) }
        const t=document.createElementNS('http://www.w3.org/2000/svg','text'); t.textContent=labels[i]; t.setAttribute('x', x-6); t.setAttribute('y', 28); t.setAttribute('fill','#9aa3b2'); t.setAttribute('font-size','14'); svg.appendChild(t)
      })
      const t=document.createElementNS('http://www.w3.org/2000/svg','text'); t.textContent=labels[3]; t.setAttribute('x', 480-6); t.setAttribute('y', 28); t.setAttribute('fill','#9aa3b2'); t.setAttribute('font-size','14'); svg.appendChild(t)
      const arrow1=makePath('M 120 90 H 160', { stroke:'#666', strokeWidth:3 }); svg.appendChild(arrow1)
      const arrow2=makePath('M 400 90 H 440', { stroke:'#666', strokeWidth:3 }); svg.appendChild(arrow2)
    }

    const { options, correctIndex } = (()=>{
      const idx = randInt(0,5)
      const arr=[]
      for(let i=0;i<6;i++){
        if(i===idx) arr.push(D)
        else {
          let v = JSON.parse(JSON.stringify(D))
          if(rule==='rotation'){ v.rot = choice([0,45,180]) }
          if(rule==='shading'){ v.filled = !D.filled }
          if(rule==='shape'){ v.shape = choice(SHAPES.filter(s=>s!==D.shape)) }
          arr.push(v)
        }
      }
      return { options: arr, correctIndex: idx }
    })()

    const explanation = `A becomes B by ${rule}. So C must change the same way.`

    function renderOptions(container, onPick){
      container.innerHTML=''
      options.forEach((opt, idx)=>{
        const card=document.createElement('div'); card.className='option'
        const badge=document.createElement('div'); badge.className='badge'; badge.textContent=String.fromCharCode(65+idx); card.appendChild(badge)
        const svg=createSvg(140,120); card.appendChild(svg)
        const s=drawShape(opt.shape,70,60,22,{stroke:opt.color,fill:opt.color,filled:true})
        if(opt.rot){ rotate(s, opt.rot, 70, 60) }
        svg.appendChild(s)
        card.addEventListener('click', ()=> onPick(idx))
        container.appendChild(card)
      })
      return { correctIndex }
    }

    function explainAnim(container){
      container.innerHTML=''
      const p=document.createElement('p'); p.textContent=EXPLAIN_TEXT[rule]; container.appendChild(p)
    }

    return { type:'analogy', prompt:'A : B :: C : ?', render: renderBoard, renderOptions, correctIndex, explanation, explainAnim, rule }
  }

  function genNumberQuestion(){
    // Numeric sequences
    const rule = choice(['add','mult','alt','fib'])
    let seq=[]
    let ruleText=''
    if(rule==='add'){
      const step = choice([2,3,4,5,6])
      const start = randInt(1,12)
      for(let i=0;i<5;i++) seq.push(start + i*step)
      ruleText = `Add ${step} each time.`
    } else if(rule==='mult'){
      const mult = choice([2,3])
      const start = choice([1,2,3,4])
      for(let i=0;i<5;i++) seq.push(start * Math.pow(mult, i))
      ruleText = `Multiply by ${mult} each time.`
    } else if(rule==='alt'){
      const a = choice([+2,+3,+4]), b = choice([-1,-2,-3])
      let cur = randInt(3,12)
      for(let i=0;i<5;i++){ seq.push(cur); cur += (i%2===0? a: b) }
      ruleText = `Alternate: +${Math.abs(a)}, ${b}.`
    } else if(rule==='fib'){
      let a=1+randInt(0,3), b=1+randInt(1,4)
      for(let i=0;i<5;i++){ seq.push(a); [a,b] = [b, a+b] }
      ruleText = 'Next number is the sum of the previous two.'
    }

    const nextVal = (()=>{
      const n=seq.length
      if(rule==='add'){ const step=seq[1]-seq[0]; return seq[n-1]+step }
      if(rule==='mult'){ const m=seq[1]/seq[0]; return seq[n-1]*m }
      if(rule==='alt'){ const d1=seq[1]-seq[0], d2=seq[2]-seq[1]; const last=seq[n-1]; const step = (n%2===1? d1: d2); return last + step }
      if(rule==='fib'){ return seq[n-1] + seq[n-2] }
    })()

    const options = (()=>{
      const arr = new Set([nextVal])
      while(arr.size<6){
        const noise = choice([-6,-4,-3,-2,-1,1,2,3,4,6])
        arr.add(nextVal + noise)
      }
      return shuffle(Array.from(arr))
    })()

    const correctIndex = options.indexOf(nextVal)

    function renderBoard(container){
      container.innerHTML = ''
      const svg = createSvg(620,120); container.appendChild(svg)
      const t=(str,x,y,size=24)=>{ const el=document.createElementNS('http://www.w3.org/2000/svg','text'); el.textContent=str; el.setAttribute('x',x); el.setAttribute('y',y); el.setAttribute('fill','#fff'); el.setAttribute('font-size',String(size)); el.setAttribute('font-family','Inter, sans-serif'); return el }
      svg.appendChild(t(seq.join(', ') + ', ?', 20, 68))
    }

    function renderOptions(container, onPick){
      container.innerHTML = ''
      options.forEach((val, idx)=>{
        const card=document.createElement('div'); card.className='option'
        const badge=document.createElement('div'); badge.className='badge'; badge.textContent=String.fromCharCode(65+idx); card.appendChild(badge)
        const inner=document.createElement('div'); inner.style.fontSize='22px'; inner.style.textAlign='center'; inner.style.padding='34px 0'; inner.textContent=String(val); card.appendChild(inner)
        card.addEventListener('click',()=> onPick(idx))
        container.appendChild(card)
      })
      return { correctIndex }
    }

    function explainAnim(container){
      container.innerHTML=''
      const p=document.createElement('p'); p.textContent=`${EXPLAIN_TEXT.numeric} Here: ${ruleText}`; container.appendChild(p)
    }

    return { type:'numbers', prompt:'What number comes next?', render: renderBoard, renderOptions, correctIndex, explanation: `${EXPLAIN_TEXT.numeric} ${ruleText}`, explainAnim, rule }
  }

  function generateQuestion(type){
    if(type==='matrix') return genMatrixQuestion()
    if(type==='series') return genSeriesQuestion()
    if(type==='classification') return genClassificationQuestion()
    if(type==='analogy') return genAnalogyQuestion()
    if(type==='numbers') return genNumberQuestion()
    // mixed: bias to matrix/series
    const order = shuffle(['matrix','series','classification','analogy','numbers'])
    return generateQuestion(order[0])
  }

  // ---------- Practice Controller ----------
  const state = {
    practiceType: 'mixed',
    scoreCorrect: 0,
    scoreTotal: 0,
    theme: 'dark'
  }

  function setPracticeType(type){
    state.practiceType = type
    $$('.seg-btn').forEach(b=> b.classList.toggle('active', b.dataset.type===type))
    newPracticeQuestion()
  }

  function newPracticeQuestion(){
    const q = generateQuestion(state.practiceType)
    $('#question-prompt').textContent = q.prompt
    const board = $('#question-board')
    q.render(board)
    const optionsEl = $('#options')
    const feedback = $('#feedback')
    const explain = $('#explain-content')
    const explainAnimEl = $('#explain-anim')
    feedback.textContent=''
    explain.textContent=''
    explainAnimEl.innerHTML=''

    const { correctIndex } = q.renderOptions(optionsEl, onPick)

    function onPick(idx){
      state.scoreTotal += 1
      const cards = $$('.option', optionsEl)
      cards.forEach((c,i)=>{
        c.classList.add('disabled')
        if(i===correctIndex) c.classList.add('correct')
        if(i===idx && i!==correctIndex) c.classList.add('incorrect')
      })
      const correct = idx===correctIndex
      if(correct) state.scoreCorrect += 1
      feedback.textContent = correct? 'Correct!': 'Try again next time.'
      feedback.className = 'feedback ' + (correct? 'good':'bad')
      explain.textContent = q.explanation
      if(q.explainAnim) q.explainAnim(explainAnimEl)
      $('#score-correct').textContent = String(state.scoreCorrect)
      $('#score-total').textContent = String(state.scoreTotal)
    }
  }

  // ---------- Rule Learning Mode ----------
  function setupRules(){
    const list = $('#rule-list'); list.innerHTML=''
    RULES.forEach((r,i)=>{
      const li=document.createElement('li'); li.className='rule-item'; li.textContent=r.name; li.dataset.id=r.id
      li.addEventListener('click',()=> selectRule(r.id))
      list.appendChild(li)
    })
    selectRule(RULES[0].id)
    $('#rule-prev').addEventListener('click',()=>{ const idx=(currentRuleIndex-1+RULES.length)%RULES.length; selectRule(RULES[idx].id) })
    $('#rule-next').addEventListener('click',()=>{ const idx=(currentRuleIndex+1)%RULES.length; selectRule(RULES[idx].id) })
    $('#rule-practice').addEventListener('click',()=>{
      // jump to practice with a question that uses this rule when possible
      setActiveView('practice-view')
      const selectedRule = RULES[currentRuleIndex].id
      // generate several until rule matches, with fallback
      let q=null
      for(let i=0;i<10;i++){ q = generateQuestion('mixed'); if(q.rule===selectedRule) break }
      if(q && q.rule!==selectedRule){
        // try direct mapping to type that can produce it
        const map={ rotation:'matrix', reflection:'matrix', alternation:'series', progression:'series', addremove:'matrix', shading:'matrix', numeric:'numbers' }
        q = generateQuestion(map[selectedRule] || 'mixed')
      }
      if(q){
        $('#question-prompt').textContent = q.prompt
        q.render($('#question-board'))
        const optionsEl = $('#options')
        const feedback = $('#feedback'); feedback.textContent=''; feedback.className='feedback'
        const explain = $('#explain-content'); explain.textContent=''
        const anim = $('#explain-anim'); anim.innerHTML=''
        q.renderOptions(optionsEl, (idx)=>{
          const cards = $$('.option', optionsEl)
          cards.forEach((c,i)=>{
            c.classList.add('disabled')
            if(i===q.correctIndex) c.classList.add('correct')
            if(i===idx && i!==q.correctIndex) c.classList.add('incorrect')
          })
          const good = idx===q.correctIndex
          feedback.textContent = good? 'Correct!' : 'Incorrect.'
          feedback.className = 'feedback ' + (good? 'good':'bad')
          explain.textContent = q.explanation
          if(q.explainAnim) q.explainAnim(anim)
        })
      }
    })
  }

  let currentRuleIndex = 0
  function selectRule(ruleId){
    currentRuleIndex = RULES.findIndex(r=>r.id===ruleId)
    const rule = RULES[currentRuleIndex]
    $$('.rule-item').forEach(li=> li.classList.toggle('active', li.dataset.id===rule.id))
    $('#rule-title').textContent = rule.name
    $('#rule-desc').textContent = rule.desc
    const stage = $('#rule-stage'); stage.innerHTML=''
    rule.demo(stage)
  }

  function demoRotation(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    const s=drawShape('triangle', 140,130,30,{stroke:'#7c5cff', fill:'#7c5cff', filled:true}); svg.appendChild(s)
    let t=0; const animate=()=>{ t+=2; rotate(s,t,140,130); requestAnimationFrame(animate) }; requestAnimationFrame(animate)
    const s2=drawShape('square', 420,130,30,{stroke:'#10b981', fill:'#10b981', filled:true}); svg.appendChild(s2)
    let t2=0; const animate2=()=>{ t2+=3; rotate(s2,t2,420,130); requestAnimationFrame(animate2) }; requestAnimationFrame(animate2)
  }
  function demoReflection(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    const axis=makePath('M 280 20 V 240',{stroke:'#666', strokeWidth:2}); svg.appendChild(axis)
    const s=drawShape('diamond', 160,130,30,{stroke:'#3b82f6', fill:'#3b82f6', filled:true}); svg.appendChild(s)
    const mirror=drawShape('diamond', 400,130,30,{stroke:'#3b82f6', fill:'#3b82f6', filled:true}); mirror.setAttribute('transform','scale(-1,1) translate(-800 0)'); svg.appendChild(mirror)
  }
  function demoAlternation(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    for(let i=0;i<8;i++){
      const useA=i%2===0
      svg.appendChild(drawShape(useA? 'circle':'square', 40+i*60, 130, 16, { stroke: useA? '#06b6d4':'#f59e0b', fill: useA? '#06b6d4':'#f59e0b', filled:true }))
    }
  }
  function demoProgression(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    for(let i=0;i<8;i++) svg.appendChild(drawShape('circle', 40+i*60, 130, 8+i*4, { stroke:'#22c55e', fill:'#22c55e', filled:true }))
  }
  function demoAddRemove(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    for(let i=0;i<3;i++) svg.appendChild(drawShape('star', 120+i*30, 130, 8, { stroke:'#fb923c', fill:'#fb923c', filled:true }))
    for(let i=0;i<6;i++) svg.appendChild(drawShape('star', 340+i*20, 130, 8, { stroke:'#fb923c', fill:'#fb923c', filled:true }))
  }
  function demoShading(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    for(let i=0;i<8;i++) svg.appendChild(drawShape('square', 40+i*60, 130, 16, { stroke: i%2? '#8b5cf6':'#ec4899', fill: i%2? '#8b5cf6':'#ec4899', filled:true }))
  }
  function demoNumeric(stage){
    const svg=createSvg(560,260); stage.appendChild(svg)
    const t=(str,x,y,size=24)=>{ const el=document.createElementNS('http://www.w3.org/2000/svg','text'); el.textContent=str; el.setAttribute('x',x); el.setAttribute('y',y); el.setAttribute('fill','#fff'); el.setAttribute('font-size',String(size)); el.setAttribute('font-family','Inter, sans-serif'); return el }
    svg.appendChild(t('2, 4, 6, 8, … (+2 each time)', 40, 100))
    svg.appendChild(t('3, 6, 12, 24, … (×2 each time)', 40, 150))
  }

  // ---------- Exam Mode ----------
  const exam = {
    running: false,
    questions: [],
    answers: [],
    idx: 0,
    timerId: null,
    endsAt: 0,
  }

  function startExam(){
    const count = clamp(parseInt($('#exam-count').value||'30',10), 10, 60)
    const minutes = clamp(parseInt($('#exam-minutes').value||'12',10), 5, 60)
    const types = $$('.exam-type').filter(ch=>ch.checked).map(ch=>ch.dataset.type)
    if(types.length===0){ alert('Select at least one type'); return }

    const qs=[]
    for(let i=0;i<count;i++){
      const t = choice(types)
      qs.push(generateQuestion(t))
    }

    exam.running=true
    exam.questions=qs
    exam.answers=new Array(qs.length).fill(null)
    exam.idx=0
    exam.endsAt = Date.now() + minutes*60*1000

    $('#exam-total').textContent=String(count)
    $('#exam-current').textContent=String(1)
    $('#exam-running').classList.remove('hidden')
    $('#exam-results').classList.add('hidden')
    renderExamQuestion()
    startTimer()
  }

  function renderExamQuestion(){
    const q = exam.questions[exam.idx]
    $('#exam-prompt').textContent = q.prompt
    q.render($('#exam-board'))
    const feedback = $('#exam-feedback'); feedback.textContent=''; feedback.className='feedback'
    const explain = $('#exam-explain-content'); explain.textContent=''
    const anim = $('#exam-explain-anim'); anim.innerHTML=''

    q.renderOptions($('#exam-options'), (idx)=>{
      exam.answers[exam.idx] = idx
      const cards = $$('.option', $('#exam-options'))
      cards.forEach((c,i)=>{
        c.classList.add('disabled')
        if(i===q.correctIndex) c.classList.add('correct')
        if(i===idx && i!==q.correctIndex) c.classList.add('incorrect')
      })
      const correct = idx===q.correctIndex
      feedback.textContent = correct? 'Correct!' : 'Incorrect.'
      feedback.className = 'feedback ' + (correct? 'good':'bad')
      explain.textContent = q.explanation
      if(q.explainAnim) q.explainAnim(anim)
    })

    $('#exam-current').textContent = String(exam.idx+1)
  }

  function nextExamQuestion(){
    if(!exam.running) return
    if(exam.idx < exam.questions.length-1){
      exam.idx += 1
      renderExamQuestion()
    } else {
      endExam()
    }
  }

  function endExam(){
    exam.running=false
    stopTimer()
    $('#exam-running').classList.add('hidden')
    $('#exam-results').classList.remove('hidden')

    // Score
    let correct=0
    const breakdown = { matrix:0, series:0, classification:0, analogy:0, numbers:0, matrixTotal:0, seriesTotal:0, classificationTotal:0, analogyTotal:0, numbersTotal:0 }
    exam.questions.forEach((q,i)=>{
      const isCorrect = exam.answers[i]===q.correctIndex
      if(isCorrect) correct+=1
      breakdown[q.type] += isCorrect? 1:0
      breakdown[q.type+'Total'] += 1
    })
    $('#exam-score').textContent = `${correct} / ${exam.questions.length}`
    const timeLeftMs = Math.max(0, exam.endsAt - Date.now())
    const timeTaken = (parseInt($('#exam-minutes').value,10)*60*1000 - timeLeftMs)
    $('#exam-time-taken').textContent = formatMs(timeTaken)

    const bd = $('#exam-breakdown'); bd.innerHTML=''
    const mk = (label, got, tot)=>{ const p=document.createElement('p'); p.textContent = `${label}: ${got} / ${tot}`; return p }
    bd.appendChild(mk('Matrix', breakdown.matrix, breakdown.matrixTotal))
    bd.appendChild(mk('Series', breakdown.series, breakdown.seriesTotal))
    bd.appendChild(mk('Classification', breakdown.classification, breakdown.classificationTotal))
    bd.appendChild(mk('Analogies', breakdown.analogy, breakdown.analogyTotal))
    bd.appendChild(mk('Number Seq', breakdown.numbers, breakdown.numbersTotal))
  }

  function formatMs(ms){
    const s = Math.max(0, Math.floor(ms/1000))
    const mm = String(Math.floor(s/60)).padStart(2,'0')
    const ss = String(s%60).padStart(2,'0')
    return `${mm}:${ss}`
  }

  function startTimer(){
    stopTimer()
    function tick(){
      const left = Math.max(0, exam.endsAt - Date.now())
      $('#exam-timer').textContent = formatMs(left)
      if(left===0){ endExam(); return }
      exam.timerId = setTimeout(tick, 250)
    }
    tick()
  }
  function stopTimer(){ if(exam.timerId){ clearTimeout(exam.timerId); exam.timerId=null } }

  // ---------- Navigation ----------
  function setupNav(){
    $$('.nav-btn').forEach(btn=>{
      btn.addEventListener('click',()=> setActiveView(btn.dataset.nav+'-view'))
    })
    setActiveView('practice-view')
  }

  function setupPractice(){
    $$('.seg-btn').forEach(btn=> btn.addEventListener('click', ()=> setPracticeType(btn.dataset.type)))
    $('#btn-new').addEventListener('click', newPracticeQuestion)
    setPracticeType('mixed')
  }

  function setupExam(){
    $('#exam-start').addEventListener('click', startExam)
    $('#exam-next').addEventListener('click', nextExamQuestion)
    $('#exam-retry').addEventListener('click', ()=>{ setActiveView('exam-view'); $('#exam-running').classList.add('hidden'); $('#exam-results').classList.add('hidden') })
  }

  function setupTheme(){
    const root=document.documentElement
    $('#toggle-theme').addEventListener('click', ()=>{
      const light = root.classList.toggle('light')
      state.theme = light? 'light':'dark'
    })
  }

  // ---------- Init ----------
  function init(){
    setupNav()
    setupPractice()
    setupRules()
    setupExam()
    setupTheme()
  }

  document.addEventListener('DOMContentLoaded', init)

})()