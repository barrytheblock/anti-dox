// ==UserScript==
// @name         Barry's Anti-Dox
// @namespace    barrytheblock
// @version      1.0.0
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_addStyle
// @run-at       document-start
// ==/UserScript==

(function () {
  'use strict';

  const K_ENTRIES = 'bad_entries_v2';
  const K_ENABLED = 'bad_enabled_v2';
  const K_HASH = 'bad_pass_v2';
  const REVEAL_MS = 4000;
  const SHORTCUT_KEY = 'KeyD'; // Check GitHub repository for more options
  const SCAN_DEBOUNCE_MS = 60;

  function getEntries() {
    return GM_getValue(K_ENTRIES, []);
  }

  function setEntries(v) {
    GM_setValue(K_ENTRIES, v);
    invalidateRegexCache();
  }

  function isEnabled() {
    return GM_getValue(K_ENABLED, true);
  }

  function setEnabled(v) {
    GM_setValue(K_ENABLED, v);
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function hash(str) {
    let h = 0;

    for (let i = 0; i < str.length; i++) {
      h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
    }

    return String(h);
  }

  function entryExists(value) {
    const normalized = value.trim().toLowerCase();

    if (!normalized) {
      return false;
    }

    return getEntries().some(
      (entry) => entry.value.trim().toLowerCase() === normalized
    );
  }

  GM_addStyle(`
    .bad-b {
      filter: blur(6px);
      border-radius: 3px;
      cursor: pointer;
      transition: filter 0.15s ease;
      padding: 0 1px;
    }

    .bad-b:hover {
      filter: blur(4px);
    }

    .bad-r {
      filter: none !important;
    }

    #bad-panel {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 70vh;
      overflow-y: auto;
      background: #1f2430;
      color: #eaeaea;
      border-radius: 10px;
      padding: 14px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
      display: none;
    }

    #bad-panel.open {
      display: block;
    }

    #bad-panel h3 {
      margin: 0 0 10px 0;
      font-size: 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    #bad-panel .row {
      display: flex;
      gap: 6px;
      margin-bottom: 8px;
      align-items: center;
    }

    #bad-panel input[type="text"],
    #bad-panel input[type="password"] {
      flex: 1;
      background: #2b3140;
      border: 1px solid #3a4152;
      color: #fff;
      border-radius: 6px;
      padding: 6px 8px;
      font-size: 12px;
      outline: none;
    }

    #bad-panel input:focus,
    #bad-gate input:focus {
      border-color: #667085;
    }

    #bad-panel .entry {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #2b3140;
      border-radius: 6px;
      padding: 6px 8px;
      margin-bottom: 6px;
      gap: 6px;
    }

    #bad-panel .entry span {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      flex: 1;
    }

    #bad-panel button {
      background: #3a4152;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 5px 8px;
      cursor: pointer;
      font-size: 12px;
    }

    #bad-panel button:hover {
      background: #4a5268;
    }

    #bad-panel .del {
      background: #3a4152;
    }

    #bad-panel .add {
      background: #2e5a3f;
      width: 100%;
      margin-top: 2px;
    }

    #bad-panel .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
      padding-bottom: 10px;
      border-bottom: 1px solid #3a4152;
    }

    #bad-panel .close {
      background: transparent;
      color: #9aa3b2;
      font-size: 16px;
      padding: 0 4px;
    }

    #bad-gate {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 280px;
      background: #1f2430;
      color: #eaeaea;
      border-radius: 10px;
      padding: 14px;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      box-shadow: 0 6px 24px rgba(0,0,0,0.4);
      display: none;
    }

    #bad-gate.open {
      display: block;
    }

    #bad-gate .gate-title {
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 10px;
    }

    #bad-gate .gate-message {
      color: #9aa3b2;
      font-size: 12px;
      line-height: 1.4;
      margin-bottom: 10px;
    }

    #bad-gate input {
      width: 100%;
      box-sizing: border-box;
      margin-bottom: 8px;
      background: #2b3140;
      border: 1px solid #3a4152;
      color: #fff;
      border-radius: 6px;
      padding: 7px 8px;
      outline: none;
    }

    #bad-gate button {
      width: 100%;
      background: #3a4152;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 7px;
      cursor: pointer;
      margin-bottom: 6px;
    }

    #bad-gate button:hover {
      background: #4a5268;
    }

    #bad-gate .forgot {
      background: transparent;
      color: #9aa3b2;
      font-size: 11px;
      margin-bottom: 0;
    }

    #bad-gate .forgot:hover {
      background: transparent;
      color: #fff;
    }

    #bad-gate .back {
      background: transparent;
      color: #9aa3b2;
      font-size: 11px;
    }

    #bad-gate .error {
      color: #e68181;
    }

    #bad-gate .success {
      color: #7bd69b;
    }
  `);

  let panel;
  let gate;

  function buildUI() {
    gate = document.createElement('div');
    gate.id = 'bad-gate';
    document.documentElement.appendChild(gate);

    panel = document.createElement('div');
    panel.id = 'bad-panel';
    document.documentElement.appendChild(panel);
  }

  function closeGate() {
    gate.classList.remove('open');
  }

  function showForgotPassword() {
    gate.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'gate-title';
    title.textContent = 'Recover Passcode';

    const message = document.createElement('div');
    message.className = 'gate-message';
    message.textContent =
      'Enter the exact value of one of your saved Anti-Dox entries to verify that you own the list.';

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'Enter one saved entry';

    const verifyBtn = document.createElement('button');
    verifyBtn.textContent = 'Verify Entry';

    const backBtn = document.createElement('button');
    backBtn.className = 'back';
    backBtn.textContent = 'Back to login';

    const verify = () => {
      const value = input.value.trim();

      if (!value) {
        input.focus();
        return;
      }

      if (entryExists(value)) {
        showNewPasscodeForm();
      } else {
        input.value = '';
        input.placeholder = 'Entry not recognized';
        message.className = 'gate-message error';
        message.textContent =
          'That does not match any saved Anti-Dox entry.';
        input.focus();
      }
    };

    verifyBtn.addEventListener('click', verify);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        verify();
      }
    });

    backBtn.addEventListener('click', () => {
      openGate();
    });

    gate.appendChild(title);
    gate.appendChild(message);
    gate.appendChild(input);
    gate.appendChild(verifyBtn);
    gate.appendChild(backBtn);

    gate.classList.add('open');

    setTimeout(() => input.focus(), 0);
  }

  function showNewPasscodeForm() {
    gate.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'gate-title';
    title.textContent = 'Create New Passcode';

    const message = document.createElement('div');
    message.className = 'gate-message success';
    message.textContent =
      'Entry verified. Create a new passcode below.';

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = 'New passcode';

    const confirmInput = document.createElement('input');
    confirmInput.type = 'password';
    confirmInput.placeholder = 'Confirm new passcode';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save New Passcode';

    const backBtn = document.createElement('button');
    backBtn.className = 'back';
    backBtn.textContent = 'Cancel';

    const save = () => {
      const value = input.value;
      const confirmValue = confirmInput.value;

      if (!value) {
        message.className = 'gate-message error';
        message.textContent = 'Please enter a new passcode.';
        input.focus();
        return;
      }

      if (value.length < 4) {
        message.className = 'gate-message error';
        message.textContent =
          'Passcode must be at least 4 characters.';
        input.focus();
        return;
      }

      if (value !== confirmValue) {
        message.className = 'gate-message error';
        message.textContent =
          'The passcodes do not match.';
        confirmInput.value = '';
        confirmInput.focus();
        return;
      }

      GM_setValue(K_HASH, hash(value));

      gate.classList.remove('open');
      openPanel();
    };

    saveBtn.addEventListener('click', save);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        confirmInput.focus();
      }
    });

    confirmInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        save();
      }
    });

    backBtn.addEventListener('click', () => {
      openGate();
    });

    gate.appendChild(title);
    gate.appendChild(message);
    gate.appendChild(input);
    gate.appendChild(confirmInput);
    gate.appendChild(saveBtn);
    gate.appendChild(backBtn);

    gate.classList.add('open');

    setTimeout(() => input.focus(), 0);
  }

  function openGate() {
    const hasHash = !!GM_getValue(K_HASH, '');

    gate.innerHTML = '';

    const title = document.createElement('div');
    title.className = 'gate-title';
    title.textContent = "Barry's Anti-Dox";

    const message = document.createElement('div');
    message.className = 'gate-message';
    message.textContent = hasHash
      ? 'Enter your passcode to open the menu.'
      : 'Create a passcode to protect your Anti-Dox settings.';

    const input = document.createElement('input');
    input.type = 'password';
    input.placeholder = hasHash
      ? 'Enter passcode'
      : 'Set a passcode';

    const btn = document.createElement('button');
    btn.textContent = hasHash
      ? 'Unlock'
      : 'Set Passcode';

    const submit = () => {
      const val = input.value;

      if (!val) {
        input.focus();
        return;
      }

      if (!hasHash) {
        if (val.length < 4) {
          message.className = 'gate-message error';
          message.textContent =
            'Passcode must be at least 4 characters.';
          return;
        }

        GM_setValue(K_HASH, hash(val));
        closeGate();
        openPanel();
        return;
      }

      if (hash(val) === GM_getValue(K_HASH, '')) {
        closeGate();
        openPanel();
      } else {
        input.value = '';
        input.placeholder = 'Wrong passcode';

        message.className = 'gate-message error';
        message.textContent =
          'Incorrect passcode. Try again.';

        input.focus();
      }
    };

    btn.addEventListener('click', submit);

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        submit();
      }
    });

    gate.appendChild(title);
    gate.appendChild(message);
    gate.appendChild(input);
    gate.appendChild(btn);

    if (hasHash) {
      const forgotBtn = document.createElement('button');
      forgotBtn.className = 'forgot';
      forgotBtn.textContent = 'Forgot password?';

      forgotBtn.addEventListener('click', () => {
        showForgotPassword();
      });

      gate.appendChild(forgotBtn);
    }

    gate.classList.add('open');

    setTimeout(() => input.focus(), 0);
  }

  function openPanel() {
    renderPanel();
    panel.classList.add('open');
  }

  function togglePanel() {
    if (panel.classList.contains('open')) {
      panel.classList.remove('open');
      return;
    }

    if (gate.classList.contains('open')) {
      gate.classList.remove('open');
      return;
    }

    openGate();
  }

  function renderPanel() {
    const entries = getEntries();
    const enabled = isEnabled();

    panel.innerHTML = '';

    const heading = document.createElement('h3');

    const title = document.createElement('span');
    title.textContent = "Barry's Anti-Dox";

    const closeBtn = document.createElement('button');
    closeBtn.className = 'close';
    closeBtn.textContent = '\u2715';

    closeBtn.addEventListener('click', () => {
      panel.classList.remove('open');
    });

    heading.appendChild(title);
    heading.appendChild(closeBtn);
    panel.appendChild(heading);

    const toggleRow = document.createElement('div');
    toggleRow.className = 'toggle-row';

    const status = document.createElement('span');
    status.textContent = enabled ? 'On' : 'Off';

    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = enabled ? 'Turn Off' : 'Turn On';

    toggleBtn.addEventListener('click', () => {
      setEnabled(!isEnabled());
      renderPanel();
      requestFullScan();
    });

    toggleRow.appendChild(status);
    toggleRow.appendChild(toggleBtn);
    panel.appendChild(toggleRow);

    entries.forEach((entry) => {
      const row = document.createElement('div');
      row.className = 'entry';

      const span = document.createElement('span');
      span.textContent = entry.value;

      const delBtn = document.createElement('button');
      delBtn.className = 'del';
      delBtn.textContent = '\u2715';

      delBtn.addEventListener('click', () => {
        setEntries(
          getEntries().filter((e) => e.id !== entry.id)
        );

        renderPanel();
        requestFullScan();
      });

      row.appendChild(span);
      row.appendChild(delBtn);
      panel.appendChild(row);
    });

    const row2 = document.createElement('div');
    row2.className = 'row';

    const valueInput = document.createElement('input');
    valueInput.type = 'text';
    valueInput.placeholder = 'Add text to blur...';

    row2.appendChild(valueInput);
    panel.appendChild(row2);

    const addBtn = document.createElement('button');
    addBtn.className = 'add';
    addBtn.textContent = '+ Add';

    addBtn.addEventListener('click', () => {
      const value = valueInput.value.trim();

      if (!value) {
        valueInput.focus();
        return;
      }

      const entries2 = getEntries();

      entries2.push({
        id: uid(),
        value
      });

      setEntries(entries2);

      renderPanel();
      requestFullScan();
    });

    valueInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addBtn.click();
      }
    });

    panel.appendChild(addBtn);
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  let cachedRegex;
  let cachedRegexBuilt = false;

  function invalidateRegexCache() {
    cachedRegexBuilt = false;
    cachedRegex = null;
  }

  function buildRegex() {
    if (cachedRegexBuilt) {
      return cachedRegex;
    }

    const values = getEntries()
      .map((e) => e.value.trim())
      .filter(Boolean)
      .sort((a, b) => b.length - a.length);

    cachedRegex =
      values.length === 0
        ? null
        : new RegExp(`(${values.map(escapeRegex).join('|')})`, 'gi');

    cachedRegexBuilt = true;

    return cachedRegex;
  }

  const SKIP_TAGS = new Set([
    'SCRIPT',
    'STYLE',
    'TEXTAREA',
    'INPUT',
    'NOSCRIPT',
    'IFRAME'
  ]);

  function shouldSkipNode(node) {
    const el = node.parentElement;

    if (!el) return true;
    if (SKIP_TAGS.has(el.tagName)) return true;
    if (el.isContentEditable) return true;
    if (el.closest('#bad-panel, #bad-gate')) return true;
    if (el.closest('.bad-b')) return true;

    return false;
  }

  function processTextNode(node, regex) {
    const text = node.nodeValue;

    regex.lastIndex = 0;

    if (!regex.test(text)) {
      return;
    }

    regex.lastIndex = 0;

    const frag = document.createDocumentFragment();

    let lastIndex = 0;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        frag.appendChild(
          document.createTextNode(
            text.slice(lastIndex, match.index)
          )
        );
      }

      const span = document.createElement('span');
      span.className = 'bad-b';
      span.textContent = match[0];

      span.addEventListener('click', (e) => {
        e.stopPropagation();
        reveal(span);
      });

      frag.appendChild(span);

      lastIndex = match.index + match[0].length;

      if (regex.lastIndex === match.index) {
        regex.lastIndex++;
      }
    }

    if (lastIndex < text.length) {
      frag.appendChild(
        document.createTextNode(text.slice(lastIndex))
      );
    }

    if (node.parentNode) {
      node.parentNode.replaceChild(frag, node);
    }
  }

  function reveal(span) {
    span.classList.add('bad-r');

    clearTimeout(span._t);

    span._t = setTimeout(() => {
      span.classList.remove('bad-r');
    }, REVEAL_MS);
  }

  function unwrapAll() {
    document.querySelectorAll('.bad-b').forEach((span) => {
      if (span.parentNode) {
        span.parentNode.replaceChild(
          document.createTextNode(span.textContent),
          span
        );
      }
    });
  }

  function scanRoot(root, regex) {
    if (!root || !root.isConnected) {
      return;
    }

    if (root.nodeType === Node.TEXT_NODE) {
      if (root.nodeValue && root.nodeValue.trim() && !shouldSkipNode(root)) {
        processTextNode(root, regex);
      }
      return;
    }

    if (root.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (root.closest && root.closest('#bad-panel, #bad-gate')) {
      return;
    }

    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode(node) {
          if (!node.nodeValue || !node.nodeValue.trim()) {
            return NodeFilter.FILTER_REJECT;
          }

          if (shouldSkipNode(node)) {
            return NodeFilter.FILTER_REJECT;
          }

          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const nodes = [];
    let n;

    while ((n = walker.nextNode())) {
      nodes.push(n);
    }

    nodes.forEach((node) => processTextNode(node, regex));
  }

  function doScan(roots) {
    if (!isEnabled()) {
      unwrapAll();
      return;
    }

    const regex = buildRegex();

    if (!regex) {
      return;
    }

    roots.forEach((root) => {
      scanRoot(root, regex);
    });
  }

  function requestFullScan() {
    if (!document.body) {
      return;
    }

    doScan([document.body]);
  }

  let pendingRoots = new Set();
  let debounceTimer = null;

  function scheduleIncrementalScan(root) {
    pendingRoots.add(root);

    if (debounceTimer) {
      return;
    }

    flushPendingScan();

    debounceTimer = setTimeout(() => {
      debounceTimer = null;

      if (pendingRoots.size) {
        flushPendingScan();
      }
    }, SCAN_DEBOUNCE_MS);
  }

  function flushPendingScan() {
    if (pendingRoots.size === 0) {
      return;
    }

    const roots = Array.from(pendingRoots);
    pendingRoots.clear();

    doScan(roots);
  }

  function startObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (
          m.target &&
          m.target.closest &&
          m.target.closest('#bad-panel, #bad-gate')
        ) {
          continue;
        }

        if (m.type === 'characterData') {
          scheduleIncrementalScan(m.target);
          continue;
        }

        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((node) => {
            if (
              node.nodeType === Node.ELEMENT_NODE ||
              node.nodeType === Node.TEXT_NODE
            ) {
              scheduleIncrementalScan(node);
            }
          });
        }
      }
    });

    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function installShortcut() {
    document.addEventListener(
      'keydown',
      (e) => {
        if (
          e.ctrlKey &&
          e.altKey &&
          !e.shiftKey &&
          e.code === SHORTCUT_KEY
        ) {
          e.preventDefault();
          e.stopPropagation();
          togglePanel();
        }
      },
      true
    );
  }

  function init() {
    if (!document.documentElement) {
      setTimeout(init, 0);
      return;
    }

    buildUI();
    installShortcut();
    startObserver();

    if (document.body) {
      requestFullScan();
    } else {
      document.addEventListener(
        'DOMContentLoaded',
        () => {
          requestFullScan();
        },
        { once: true }
      );
    }
  }

  init();
})();
