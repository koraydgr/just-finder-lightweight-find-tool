(function() {
    // --- Prevent multiple injections ---
    if (window.hasLoadedJustFinder) {
        window.toggleJustFinder();
        return;
    }
    window.hasLoadedJustFinder = true;

    // --- MAIN FUNCTIONS ---
    window.toggleJustFinder = function() {
        const existingRoot = document.getElementById('just-finder-root');
        if (existingRoot) {
            removeFinder();
        } else {
            createFinder();
        }
    };

    function removeFinder() {
        const root = document.getElementById('just-finder-root');
        if (root) {
            const shadow = root.shadowRoot;
            if (shadow && shadow.host.clearHighlights) {
                shadow.host.clearHighlights();
            }
            root.remove();
        }
    }

    function createFinder() {
        const root = document.createElement('div');
        root.id = 'just-finder-root';
        const shadow = root.attachShadow({ mode: 'open' });

        root.clearHighlights = () => unhighlightAll();

        shadow.innerHTML = `
        <style>
          :host { all: initial; }
          
          /* Animation Keyframes */
          @keyframes wiggle {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-20deg); }
            50% { transform: rotate(20deg); }
            75% { transform: rotate(-10deg); }
            100% { transform: rotate(0deg); }
          }

          .finder-box {
            position: fixed; top: 30px; right: 30px;
            width: 25vw; 
            min-width: 380px;
            background: #ffffff;
            border: 1px solid rgba(0,0,0,0.1);
            border-radius: 16px;
            box-shadow: 0 12px 32px rgba(0,0,0,0.15);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            z-index: 2147483647;
            display: flex; flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(10px);
          }
          
          /* HEADER */
          .header {
            background: #c0c0c0;
            padding: 6px 14px;
            display: flex; justify-content: space-between; align-items: center;
            border-bottom: 1px solid #a0a0a0;
            cursor: move; user-select: none;
          }
          .title {
            font-size: 13px; font-weight: 700; color: #222; letter-spacing: -0.3px;
            display: flex; align-items: baseline; gap: 6px;
          }
          .version { font-size: 11px; font-weight: 400; color: #555; opacity: 0.8; }
          
          .close-btn {
            cursor: pointer; width: 24px; height: 24px;
            display: flex; align-items: center; justify-content: center;
            color: #555; font-size: 16px; font-weight: bold;
            transition: color 0.2s ease;
          }
          .close-btn:hover { 
            background: transparent; color: #8A1C7C; 
            animation: wiggle 0.4s ease-in-out;
          }

          .body { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
          .top-row { display: flex; align-items: center; gap: 8px; height: 32px; }
          
          input[type="text"] {
            flex-grow: 1; padding: 0 10px; height: 100%;
            border: 1px solid #d0d0d0; border-radius: 8px;
            font-size: 13px; outline: none; color: #333;
            background: #f9f9f9; transition: all 0.2s;
          }
          input[type="text"]:focus { background: #fff; border-color: #999; }
          input[type="text"]::placeholder { color: #999; font-style: italic; }

          /* BUTTON DESIGN */
          .find-btn {
            background: #c0c0c0; 
            color: #ffffff;      
            border: none;
            padding: 0 12px;
            cursor: pointer; height: 100%;
            border-radius: 8px; 
            font-size: 12px; font-weight: 700;
            transition: all 0.2s; 
            white-space: nowrap;
            letter-spacing: 0.3px;
            text-shadow: 0 1px 1px rgba(0,0,0,0.1);
          }
          .find-btn:hover { 
            background: #a6a6a6; 
            color: #ffffff;
            transform: translateY(-1px);
            box-shadow: 0 2px 5px rgba(0,0,0,0.15);
            text-shadow: none;
          }
          .find-btn:active { transform: translateY(0); box-shadow: none; }

          /* RESULT AREA */
          .result-area {
            display: flex; align-items: center; justify-content: center;
            gap: 4px; font-size: 12px; font-weight: 700; color: #444;
            background: transparent; 
            border: 1px solid transparent; 
            border-radius: 8px;
            padding: 0; 
            min-width: 0px; 
            height: 100%;
            user-select: none;
            cursor: default;
            transition: all 0.2s ease;
            white-space: nowrap;
          }
          .result-area.active {
            background: #f0f0f0;
            border: 1px solid #eee;
            padding: 0 8px;
            min-width: 65px; 
          }
          
          .nav-arrow {
            cursor: pointer; user-select: none; width: 20px; height: 100%;
            display: none; align-items: center; justify-content: center;
            transition: color 0.2s; font-size: 14px; color: #666;
          }
          .nav-arrow:hover { background: transparent; color: #8A1C7C; }

          .footer {
            display: flex; justify-content: space-between; align-items: center;
            margin-top: 4px; padding-top: 2px;
          }
          
          /* CHECKBOX STYLING */
          .checkbox-group { display: flex; gap: 12px; align-items: center; }
          
          .custom-check {
            display: flex; align-items: center; gap: 5px;
            cursor: pointer; font-size: 11px; color: #666; font-weight: 500;
            user-select: none;
          }
          
          .custom-check input { display: none; }
          
          .checkmark-box {
            width: 12px; height: 12px;
            border: 1px solid #999; border-radius: 3px;
            background: #fff;
            display: flex; align-items: center; justify-content: center;
            transition: border-color 0.2s;
          }
          
          .tick-path {
            fill: none; stroke: #8A1C7C;
            stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round;
            stroke-dasharray: 20; stroke-dashoffset: 20;
            transition: stroke-dashoffset 0.2s ease-in-out;
          }
          
          .custom-check input:checked + .checkmark-box { border-color: #8A1C7C; }
          .custom-check input:checked + .checkmark-box .tick-path { stroke-dashoffset: 0; }

          /* BUY ME COFFEE (MINIMALIST ICON) */
          .bmc-btn {
            display: flex; align-items: center; justify-content: center;
            text-decoration: none;
            transition: transform 0.2s ease;
            cursor: pointer;
            /* Move closer to bottom right corner */
            margin-right: -4px;
            margin-bottom: -2px;
          }
          .bmc-btn:hover { 
            transform: scale(1.1);
          }
          
          .bmc-icon { 
            width: 20px; height: 20px; /* Increased size (approx 25% bigger) */
            fill: #999; transition: fill 0.2s ease; 
          }
          .bmc-btn:hover .bmc-icon { fill: #8A1C7C; }

        </style>

        <div class="finder-box" id="box">
          <div class="header" id="dragHeader">
            <span class="title">Just Finder! <span class="version">v1.0</span></span>
            <div class="close-btn" id="closeBtn">✕</div>
          </div>
          
          <div class="body">
            <div class="top-row">
              <input type="text" id="searchInput" placeholder="Type to find..." autofocus>
              <button class="find-btn" id="findBtn">Just Find!</button>
              
              <div class="result-area" id="resultArea">
                 <div class="nav-arrow" id="prevBtn">❮</div>
                 <span id="resCount"></span>
                 <div class="nav-arrow" id="nextBtn">❯</div>
              </div>
            </div>

            <div class="footer">
              <div class="checkbox-group">
                <label class="custom-check">
                  <input type="checkbox" id="caseSensitive">
                  <span class="checkmark-box">
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <path class="tick-path" d="M1 4 L3.5 6.5 L9 1" />
                    </svg>
                  </span>
                  Case
                </label>

                <label class="custom-check">
                  <input type="checkbox" id="exactMatch">
                  <span class="checkmark-box">
                    <svg width="10" height="8" viewBox="0 0 10 8">
                      <path class="tick-path" d="M1 4 L3.5 6.5 L9 1" />
                    </svg>
                  </span>
                  Exact
                </label>
              </div>
              
              <a href="https://www.buymeacoffee.com/koraydgr" target="_blank" class="bmc-btn" title="Support the Developer">
                <svg class="bmc-icon" viewBox="0 0 16 16"><path d="M2.5 1h9a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5H11v.5a2.5 2.5 0 0 1-2.5 2.5h-5A2.5 2.5 0 0 1 1 9.5V2.5A1.5 1.5 0 0 1 2.5 1zm9 1.5a.5.5 0 0 0-.5-.5h-8a.5.5 0 0 0-.5.5v7a1.5 1.5 0 0 0 1.5 1.5h5a1.5 1.5 0 0 0 1.5-1.5v-7zm1 .5v5a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5V3.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5z"/></svg>
              </a>
            </div>
          </div>
        </div>
        `;

        document.body.appendChild(root);

        // --- DOM Elements ---
        const box = shadow.getElementById('box');
        const header = shadow.getElementById('dragHeader');
        const closeBtn = shadow.getElementById('closeBtn');
        const input = shadow.getElementById('searchInput');
        const findBtn = shadow.getElementById('findBtn');
        const prevBtn = shadow.getElementById('prevBtn');
        const nextBtn = shadow.getElementById('nextBtn');
        const resCount = shadow.getElementById('resCount');
        const resultArea = shadow.getElementById('resultArea');
        const caseCheck = shadow.getElementById('caseSensitive');
        const exactCheck = shadow.getElementById('exactMatch');

        // --- Variables ---
        let matches = [];
        let currentMatchIndex = -1;

        // --- Drag & Drop ---
        let isDragging = false, offsetX, offsetY;
        header.addEventListener('mousedown', (e) => {
            if(e.target === closeBtn) return;
            isDragging = true;
            const rect = box.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            header.style.cursor = 'grabbing';
        });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            let newX = e.clientX - offsetX;
            let newY = e.clientY - offsetY;
            const w = window.innerWidth, h = window.innerHeight, rect = box.getBoundingClientRect();
            if (newX < 0) newX = 0; if (newX + rect.width > w) newX = w - rect.width;
            if (newY < 0) newY = 0; if (newY + rect.height > h) newY = h - rect.height;
            box.style.left = `${newX}px`; box.style.top = `${newY}px`; box.style.right = 'auto';
        });
        document.addEventListener('mouseup', () => { isDragging = false; header.style.cursor = 'move'; });

        // --- Close ---
        closeBtn.addEventListener('click', () => window.toggleJustFinder());

        // --- Search Logic ---
        function performSearch() {
            const query = input.value;
            unhighlightAll(); 
            matches = [];
            currentMatchIndex = -1;
            
            if (!query) {
                updateUI();
                return;
            }

            let pattern = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
            if (exactCheck.checked) {
                pattern = `\\b${pattern}\\b`;
            }

            const flags = caseCheck.checked ? 'g' : 'gi';
            const regex = new RegExp(pattern, flags);
            
            const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
            let node;
            const nodesToHighlight = [];

            while (node = walker.nextNode()) {
                if (node.parentNode.tagName === 'SCRIPT' || node.parentNode.tagName === 'STYLE' || node.parentNode.closest('#just-finder-root')) continue;
                if (regex.test(node.nodeValue)) {
                    nodesToHighlight.push(node);
                }
            }

            nodesToHighlight.forEach(node => {
                const fragment = document.createDocumentFragment();
                regex.lastIndex = 0;
                const text = node.nodeValue;
                let lastIndex = 0;
                let match;
                
                while ((match = regex.exec(text)) !== null) {
                    const before = text.substring(lastIndex, match.index);
                    if (before) fragment.appendChild(document.createTextNode(before));
                    
                    const span = document.createElement('span');
                    span.className = 'jf-highlight';
                    span.style.backgroundColor = '#ccff00'; 
                    span.style.color = 'inherit';
                    span.style.borderRadius = '2px';
                    span.textContent = match[0];
                    fragment.appendChild(span);
                    matches.push(span);
                    
                    lastIndex = regex.lastIndex;
                }
                const after = text.substring(lastIndex);
                if (after) fragment.appendChild(document.createTextNode(after));
                
                node.parentNode.replaceChild(fragment, node);
            });

            if (matches.length > 0) {
                currentMatchIndex = 0;
                highlightCurrent();
            }
            updateUI();
        }

        function updateUI() {
            const total = matches.length;
            
            // 1. Empty input -> Hide
            if (input.value === "") {
                resCount.textContent = "";
                resultArea.classList.remove('active');
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                return;
            }

            // 2. Exact 1 result -> Hide EVERYTHING
            if (total === 1) {
                resCount.textContent = "";
                resultArea.classList.remove('active');
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
                return;
            }
            
            // 3. Show Box for 0 or >1
            resultArea.classList.add('active');

            if (total === 0) {
                resCount.textContent = "No Result";
                resCount.style.color = "#999";
                resCount.style.fontStyle = "italic";
                prevBtn.style.display = 'none';
                nextBtn.style.display = 'none';
            } else {
                const current = currentMatchIndex + 1;
                resCount.textContent = `${current}/${total}`;
                resCount.style.color = "#333";
                resCount.style.fontStyle = "normal";
                prevBtn.style.display = 'flex';
                nextBtn.style.display = 'flex';
            }
        }

        function highlightCurrent() {
            matches.forEach(m => {
                m.style.backgroundColor = '#ccff00'; 
                m.style.boxShadow = 'none';
            });
            const current = matches[currentMatchIndex];
            if (current) {
                current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                current.style.backgroundColor = '#00ff00';
                current.style.boxShadow = '0 0 6px rgba(0, 255, 0, 0.6)';
            }
            updateUI();
        }

        function navigate(direction) {
            if (matches.length <= 1) return;
            if (direction === 'next') {
                currentMatchIndex++;
                if (currentMatchIndex >= matches.length) currentMatchIndex = 0;
            } else {
                currentMatchIndex--;
                if (currentMatchIndex < 0) currentMatchIndex = matches.length - 1;
            }
            highlightCurrent();
        }

        findBtn.addEventListener('click', performSearch);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (matches.length > 0) navigate('next');
                else performSearch();
            }
        });
        nextBtn.addEventListener('click', () => navigate('next'));
        prevBtn.addEventListener('click', () => navigate('prev'));
        
        setTimeout(() => input.focus(), 100);
    }

    function unhighlightAll() {
        const highlights = document.querySelectorAll('.jf-highlight');
        highlights.forEach(span => {
            const parent = span.parentNode;
            parent.replaceChild(document.createTextNode(span.textContent), span);
            parent.normalize();
        });
    }

    window.toggleJustFinder();

})();