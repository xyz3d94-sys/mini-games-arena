/* Real-Time Multiplayer Engine with Multi-Transport Architecture
   Transports: Multi-Broker Paho MQTT (EMQX + HiveMQ + Mosquitto with Parallel Redundancy)
   + WebRTC PeerJS + BroadcastChannel + localStorage StorageEvent Fallback */
const Multiplayer = {
  myId: null,
  opponentId: null,
  connectedPeerId: null,
  discoveredPeers: new Map(),
  peer: null,
  activeConn: null,

  // Multi-broker pool configuration for 100% reliable message delivery
  brokerConfigs: [
    { name: 'EMQX', host: 'broker.emqx.io', port: 8084, path: '/mqtt', ssl: true },
    { name: 'HiveMQ', host: 'broker.hivemq.com', port: 8884, path: '/mqtt', ssl: true },
    { name: 'Mosquitto', host: 'test.mosquitto.org', port: 8081, path: '/mqtt', ssl: true }
  ],
  mqttClients: new Map(),
  pendingOutbox: [],

  mqttConnected: false,
  isOnline: false,
  currentGameKey: null,
  pendingInvite: null,
  currentRoom: null,
  broadcastChan: null,
  radarInterval: null,
  radarTimer: 10,
  inviteTimeout: null,
  recentMsgIds: new Set(),

  init() {
    try {
      this.normalizePaho();
      this.initPlayerId();
      this.initConnectedPeer();
      this.initBroadcastChannel();
      this.initStorageListener();
      this.initMqtt();
      this.initPeer();

      window.addEventListener('online', () => {
        this.reconnectAllMqtt();
        this.updateOnlineStatus();
      });
      window.addEventListener('offline', () => {
        this.updateOnlineStatus();
        this.disconnectCurrentPeer(true);
      });
    } catch (e) {
      console.error("Multiplayer init error:", e);
    }
  },

  t() {
    return (typeof I18N !== 'undefined' && typeof App !== 'undefined') ? (I18N[App.lang] || I18N.uz) : {};
  },

  normalizePaho() {
    try {
      const p = (typeof Paho !== 'undefined' ? Paho : (typeof window !== 'undefined' && window.Paho ? window.Paho : null));
      if (p) {
        if (!p.MQTT) {
          p.MQTT = {
            Client: p.Client,
            Message: p.Message
          };
        } else {
          if (!p.Client && p.MQTT.Client) p.Client = p.MQTT.Client;
          if (!p.Message && p.MQTT.Message) p.Message = p.MQTT.Message;
        }
      }
    } catch (e) {}
  },

  getPahoClientClass() {
    this.normalizePaho();
    const p = (typeof Paho !== 'undefined' ? Paho : (typeof window !== 'undefined' && window.Paho ? window.Paho : null));
    if (!p) return null;
    return p.Client || (p.MQTT && p.MQTT.Client) || null;
  },

  getPahoMessageClass() {
    this.normalizePaho();
    const p = (typeof Paho !== 'undefined' ? Paho : (typeof window !== 'undefined' && window.Paho ? window.Paho : null));
    if (!p) return null;
    return p.Message || (p.MQTT && p.MQTT.Message) || null;
  },

  initPlayerId() {
    let saved = localStorage.getItem('mini_games_player_id');
    if (!saved || saved.length < 3 || saved.length > 8) {
      saved = Math.floor(1000 + Math.random() * 9000).toString();
      localStorage.setItem('mini_games_player_id', saved);
    }
    this.myId = String(saved).replace(/[^0-9]/g, '');
    this.updatePlayerIdUI();
  },

  copyMyId() {
    AudioEngine.tap();
    const cleanId = String(this.myId).replace(/[^0-9]/g, '');
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(cleanId).catch(() => {});
      }
    } catch (e) {}
    const t = this.t();
    App.showToast(`${t.copied || 'ID nusxalandi!'}: #${cleanId}`);
  },

  regenerateMyId() {
    AudioEngine.tap();
    const newId = Math.floor(1000 + Math.random() * 9000).toString();
    this.setNewId(newId);
    App.showToast(`Yangi ID: #${this.myId}`);
  },

  editMyId() {
    AudioEngine.tap();
    const cur = this.myId;
    const input = prompt("O'zingizga qulay ID kiriting (masalan: 7777 yoki 4892):", cur);
    if (!input) return;
    const clean = input.trim().replace(/[^0-9]/g, '');
    if (clean.length < 3 || clean.length > 8) {
      App.showToast("ID kamida 3 ta, ko'pi bilan 8 ta raqam bo'lishi kerak!");
      return;
    }
    this.setNewId(clean);
    App.showToast(`ID #${this.myId} o'rnatildi!`);
  },

  setNewId(cleanId) {
    this.myId = cleanId;
    localStorage.setItem('mini_games_player_id', cleanId);
    this.updatePlayerIdUI();
    this.subscribeAllTopics();
    this.initPeer();
  },

  pasteTargetId() {
    AudioEngine.tap();
    const input = document.getElementById('mp-target-id-input');
    if (!input) return;
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        navigator.clipboard.readText().then(text => {
          if (text) {
            const clean = text.replace(/[^0-9]/g, '').trim();
            if (clean) {
              input.value = clean;
              App.showToast(`ID #${clean} qo'yildi!`);
            }
          }
        }).catch(() => {
          this.promptManualId(input);
        });
      } else {
        this.promptManualId(input);
      }
    } catch (e) {
      this.promptManualId(input);
    }
  },

  promptManualId(input) {
    const manual = prompt("Raqib ID raqamini kiriting:");
    if (manual) {
      const clean = manual.replace(/[^0-9]/g, '').trim();
      if (clean) input.value = clean;
    }
  },

  initConnectedPeer() {
    try {
      const saved = localStorage.getItem('mg_connected_peer');
      if (saved && saved.length >= 3) {
        this.connectedPeerId = String(saved).replace(/[^0-9]/g, '');
      }
    } catch (e) {}
    this.updateConnectedPeerUI();
  },

  setConnectedPeer(peerId) {
    const clean = String(peerId || '').replace(/[^0-9]/g, '');
    if (!clean || clean === String(this.myId).replace(/[^0-9]/g, '')) return;
    this.connectedPeerId = clean;
    try {
      localStorage.setItem('mg_connected_peer', this.connectedPeerId);
    } catch (e) {}
    this.updateConnectedPeerUI();
  },

  disconnectCurrentPeer(isSilent = false) {
    if (!isSilent) AudioEngine.tap();
    const t = this.t();
    const oldPeer = this.connectedPeerId;
    this.connectedPeerId = null;
    try {
      localStorage.removeItem('mg_connected_peer');
    } catch (e) {}
    this.updateConnectedPeerUI();
    if (oldPeer && !isSilent) {
      this.dispatchMessage(oldPeer, {
        type: 'peer_disconnected',
        fromId: this.myId
      });
      App.showToast(t.mpDisconnectSuccess || "Bog'lanish uzildi");
    }
  },

  updateConnectedPeerUI() {
    const bar = document.getElementById('connected-peer-bar');
    const txt = document.getElementById('lbl-connected-with');
    const btn = document.getElementById('btn-disconnect-peer');
    const t = this.t();

    if (!bar) return;

    if (this.connectedPeerId) {
      bar.style.display = 'flex';
      if (txt) {
        const tmpl = t.mpConnectedWith || "Siz #{id} bilan bog'langansiz";
        txt.innerHTML = tmpl.replace('{id}', `<b style="color:#38bdf8; font-size:14px;">#${this.connectedPeerId}</b>`);
      }
      if (btn) {
        btn.textContent = t.mpDisconnect || "❌ Uzish";
      }
    } else {
      bar.style.display = 'none';
    }
  },

  updatePlayerIdUI() {
    const el = document.getElementById('my-player-id-val');
    if (el && this.myId) el.textContent = '#' + this.myId;
  },

  updateOnlineStatus() {
    const dot = document.getElementById('my-online-dot');
    this.mqttConnected = this.isAnyMqttConnected();
    this.isOnline = this.mqttConnected;
    if (dot) {
      dot.className = this.isOnline ? 'online-dot' : 'online-dot offline';
      dot.title = this.isOnline ? "Onlayn (Serverga ulangan)" : "Ulanmoqda...";
    }
  },

  isAnyMqttConnected() {
    for (const [, entry] of this.mqttClients.entries()) {
      if (entry && entry.connected) return true;
    }
    return false;
  },

  isDuplicate(msgId) {
    if (!msgId) return false;
    if (this.recentMsgIds.has(msgId)) return true;
    this.recentMsgIds.add(msgId);
    if (this.recentMsgIds.size > 300) {
      const first = this.recentMsgIds.values().next().value;
      this.recentMsgIds.delete(first);
    }
    return false;
  },

  initMqtt() {
    const ClientClass = this.getPahoClientClass();
    if (!ClientClass) return;
    this.brokerConfigs.forEach(cfg => {
      this.connectBroker(cfg);
    });
  },

  connectBroker(cfg) {
    const ClientClass = this.getPahoClientClass();
    if (!ClientClass) return;

    const existing = this.mqttClients.get(cfg.name);
    if (existing && existing.connected) return;
    if (existing && existing.reconnectTimer) {
      clearTimeout(existing.reconnectTimer);
      existing.reconnectTimer = null;
    }

    try {
      const cleanId = String(this.myId || Math.floor(1000 + Math.random() * 9000)).replace(/[^0-9]/g, '');
      const clientId = 'mga_' + cleanId + '_' + cfg.name.toLowerCase() + '_' + Math.floor(Math.random() * 1000000);
      const client = new ClientClass(cfg.host, cfg.port, cfg.path, clientId);

      const entry = {
        name: cfg.name,
        cfg: cfg,
        client: client,
        connected: false,
        reconnectTimer: null,
        attempts: (existing ? existing.attempts + 1 : 1)
      };
      this.mqttClients.set(cfg.name, entry);

      client.onConnectionLost = (resp) => {
        entry.connected = false;
        this.updateOnlineStatus();
        this.scheduleReconnect(cfg);
      };

      client.onMessageArrived = (message) => {
        try {
          const payload = JSON.parse(message.payloadString);
          this.handleIncomingMessage(payload, 'mqtt-' + cfg.name);
        } catch (err) {}
      };

      client.connect({
        useSSL: cfg.ssl,
        timeout: 6,
        keepAliveInterval: 25,
        cleanSession: true,
        onSuccess: () => {
          entry.connected = true;
          entry.attempts = 0;
          this.updateOnlineStatus();
          this.subscribeClientToTopics(client);
          this.drainPendingOutbox();
        },
        onFailure: (err) => {
          entry.connected = false;
          this.updateOnlineStatus();
          this.scheduleReconnect(cfg);
        }
      });
    } catch (e) {
      this.scheduleReconnect(cfg);
    }
  },

  scheduleReconnect(cfg) {
    const entry = this.mqttClients.get(cfg.name);
    const delay = Math.min(2500 * (entry ? entry.attempts : 1), 12000);
    if (entry && entry.reconnectTimer) clearTimeout(entry.reconnectTimer);
    const timer = setTimeout(() => {
      this.connectBroker(cfg);
    }, delay);
    if (entry) entry.reconnectTimer = timer;
  },

  reconnectAllMqtt() {
    this.brokerConfigs.forEach(cfg => {
      const entry = this.mqttClients.get(cfg.name);
      if (!entry || !entry.connected) {
        this.connectBroker(cfg);
      }
    });
  },

  subscribeClientToTopics(client) {
    if (!client || !client.isConnected || !client.isConnected()) return;
    try {
      const cleanId = String(this.myId).replace(/[^0-9]/g, '');
      if (cleanId) {
        client.subscribe('mgarena/v2/p/' + cleanId, { qos: 1 });
        client.subscribe('mgarena/v2/user/' + cleanId, { qos: 1 });
      }
      client.subscribe('mgarena/v2/lobby', { qos: 0 });
      if (this.currentRoom) {
        client.subscribe('mgarena/v2/room/' + this.currentRoom, { qos: 1 });
      }
    } catch (e) {}
  },

  subscribeAllTopics() {
    this.mqttClients.forEach(entry => {
      if (entry && entry.connected && entry.client) {
        this.subscribeClientToTopics(entry.client);
      }
    });
  },

  subscribeAll(topic) {
    if (!topic) return;
    this.mqttClients.forEach(entry => {
      if (entry && entry.connected && entry.client && entry.client.isConnected && entry.client.isConnected()) {
        try {
          entry.client.subscribe(topic, { qos: 1 });
        } catch (e) {}
      }
    });
  },

  publishMqtt(topic, payload) {
    const MessageClass = this.getPahoMessageClass();
    if (!MessageClass) return 0;
    const jsonStr = (typeof payload === 'string') ? payload : JSON.stringify(payload);
    let sentCount = 0;

    this.mqttClients.forEach((entry) => {
      if (entry && entry.connected && entry.client && entry.client.isConnected && entry.client.isConnected()) {
        try {
          const msg = new MessageClass(jsonStr);
          msg.destinationName = topic;
          msg.qos = 1;
          entry.client.send(msg);
          sentCount++;
        } catch (e) {}
      }
    });
    return sentCount;
  },

  drainPendingOutbox() {
    if (this.pendingOutbox.length === 0) return;
    const queue = [...this.pendingOutbox];
    this.pendingOutbox = [];
    queue.forEach(item => {
      this.dispatchMessage(item.targetId, item.payload);
    });
  },

  initBroadcastChannel() {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        this.broadcastChan = new BroadcastChannel('mg_arena_channel');
        this.broadcastChan.onmessage = (e) => {
          if (e && e.data) this.handleIncomingMessage(e.data, 'broadcast');
        };
      }
    } catch (e) {}
  },

  initStorageListener() {
    window.addEventListener('storage', (e) => {
      if (e.key === 'mg_cross_msg' && e.newValue) {
        try {
          const envelope = JSON.parse(e.newValue);
          if (envelope && envelope.payload) {
            this.handleIncomingMessage(envelope.payload, 'storage');
          }
        } catch (err) {}
      }
    });
  },

  initPeer() {
    if (typeof Peer === 'undefined') return;
    try {
      const cleanId = String(this.myId).replace(/[^0-9]/g, '');
      const fullPeerId = 'mg-arena-' + cleanId;
      if (this.peer && !this.peer.destroyed) {
        try { this.peer.destroy(); } catch (e) {}
      }
      this.peer = new Peer(fullPeerId, {
        debug: 0,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        }
      });

      this.peer.on('open', () => {
        this.isOnline = true;
        this.updateOnlineStatus();
      });

      this.peer.on('connection', (conn) => {
        this.setupIncomingConnection(conn);
      });

      this.peer.on('error', () => {});
    } catch (e) {}
  },

  setupIncomingConnection(conn) {
    if (!conn) return;
    this.activeConn = conn;
    conn.on('data', (data) => {
      this.handleIncomingMessage(data, 'webrtc');
    });
    conn.on('close', () => {
      if (this.activeConn === conn) this.activeConn = null;
    });
    conn.on('error', () => {
      if (this.activeConn === conn) this.activeConn = null;
    });
  },

  broadcastLocal(payload) {
    if (this.broadcastChan) {
      try { this.broadcastChan.postMessage(payload); } catch (e) {}
    }
    try {
      localStorage.setItem('mg_cross_msg', JSON.stringify({ ts: Date.now(), payload }));
    } catch (e) {}
  },

  dispatchMessage(targetId, payload) {
    if (!payload) return;
    if (!payload.msgId) {
      payload.msgId = this.myId + '_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
    }

    const cleanTarget = targetId ? String(targetId).replace(/[^0-9]/g, '').trim() : null;

    if (cleanTarget) {
      this.publishMqtt('mgarena/v2/p/' + cleanTarget, payload);
      this.publishMqtt('mgarena/v2/user/' + cleanTarget, payload);
    }
    if (this.currentRoom) {
      this.publishMqtt('mgarena/v2/room/' + this.currentRoom, payload);
    }
    if (this.activeConn && this.activeConn.open) {
      try { this.activeConn.send(payload); } catch (e) {}
    }
    this.broadcastLocal(payload);

    if (!this.isAnyMqttConnected()) {
      if (this.pendingOutbox.length < 20) {
        this.pendingOutbox.push({ targetId: cleanTarget, payload: payload });
      }
    }
  },

  handleIncomingMessage(data, source) {
    if (!data || typeof data !== 'object') return;

    if (data.msgId && this.isDuplicate(data.msgId)) {
      return;
    }

    const myCleanId = String(this.myId || '').replace(/[^0-9]/g, '').trim();
    const targetCleanId = String(data.targetId || '').replace(/[^0-9]/g, '').trim();
    const fromCleanId = String(data.fromId || '').replace(/[^0-9]/g, '').trim();

    if (targetCleanId && myCleanId && targetCleanId !== myCleanId) {
      return;
    }

    if (fromCleanId && myCleanId && fromCleanId === myCleanId) {
      return;
    }

    if (data.type === 'invite') {
      this.opponentId = fromCleanId;
      this.pendingInvite = {
        fromId: this.opponentId,
        gameKey: data.gameKey,
        gameTitle: data.gameTitle || "O'yin",
        roomKey: data.roomKey
      };
      this.showIncomingModal(this.pendingInvite.fromId, this.pendingInvite.gameTitle);
    } else if (data.type === 'cancel_invite') {
      const incomingModal = document.getElementById('incoming-invite-modal');
      if (incomingModal && incomingModal.classList.contains('active')) {
        incomingModal.classList.remove('active');
        App.showToast(`ID #${fromCleanId} taklifni bekor qildi`);
      }
      this.pendingInvite = null;
    } else if (data.type === 'accept') {
      if (this.inviteTimeout) {
        clearTimeout(this.inviteTimeout);
        this.inviteTimeout = null;
      }
      this.opponentId = fromCleanId;
      this.currentGameKey = data.gameKey;
      this.currentRoom = data.roomKey;
      this.saveRecentRival(this.opponentId, this.currentGameKey);
      this.setConnectedPeer(this.opponentId);
      this.subscribeAll('mgarena/v2/room/' + this.currentRoom);

      AudioEngine.matchStart();
      App.closeModal();
      this.closeChallengeModal();
      const t = this.t();
      App.showToast(`ID #${this.opponentId} ${t.mpOppFound || "bilan bog'landi!"}`);
      App.goView(data.gameKey);
      this.notifyGameStarted(data.gameKey, true);
    } else if (data.type === 'peer_disconnected') {
      if (String(this.connectedPeerId).replace(/[^0-9]/g, '') === fromCleanId) {
        this.connectedPeerId = null;
        try { localStorage.removeItem('mg_connected_peer'); } catch (e) {}
        this.updateConnectedPeerUI();
        App.showToast(`ID #${fromCleanId} bog'lanishni bekor qildi`);
      }
    } else if (data.type === 'online_discovery_ping') {
      if (fromCleanId !== myCleanId) {
        this.addDiscoveredPeer(fromCleanId);
        const pong = {
          type: 'online_discovery_pong',
          fromId: this.myId,
          targetId: fromCleanId
        };
        this.publishMqtt('mgarena/v2/lobby', pong);
        this.broadcastLocal(pong);
      }
    } else if (data.type === 'online_discovery_pong') {
      if (targetCleanId === myCleanId && fromCleanId !== myCleanId) {
        this.addDiscoveredPeer(fromCleanId);
      }
    } else if (data.type === 'decline') {
      if (this.inviteTimeout) {
        clearTimeout(this.inviteTimeout);
        this.inviteTimeout = null;
      }
      AudioEngine.error();
      App.closeModal();
      const t = this.t();
      App.showModal('⚠️', t.opponent || "Raqib", t.mpOppDeclined || "Raqib taklifni rad etdi.");
    } else if (data.type === 'game_move') {
      this.dispatchGameMove(data);
    } else if (data.type === 'radar_ping') {
      if (fromCleanId !== myCleanId) {
        this.addDiscoveredPeer(fromCleanId);
      }
      if (fromCleanId !== myCleanId && this.radarInterval && data.gameKey === this.currentGameKey) {
        this.stopRadarSearch();
        this.opponentId = fromCleanId;
        const roomKey = 'mga_room_' + Math.min(Number(myCleanId) || 0, Number(fromCleanId) || 0) + '_' + Math.max(Number(myCleanId) || 0, Number(fromCleanId) || 0) + '_' + Date.now();
        this.currentRoom = roomKey;
        this.subscribeAll('mgarena/v2/room/' + this.currentRoom);

        const matchOffer = {
          type: 'dota_match_found',
          fromId: this.myId,
          targetId: this.opponentId,
          gameKey: data.gameKey,
          roomKey: roomKey,
          gameTitle: data.gameTitle || 'Arena'
        };
        this.dispatchMessage(this.opponentId, matchOffer);
        setTimeout(() => this.dispatchMessage(this.opponentId, matchOffer), 300);

        this.showDotaMatchFound(this.opponentId, data.gameKey, true);
      }
    } else if (data.type === 'dota_match_found' && targetCleanId === myCleanId) {
      this.stopRadarSearch();
      this.opponentId = fromCleanId;
      this.currentRoom = data.roomKey;
      this.currentGameKey = data.gameKey;
      this.subscribeAll('mgarena/v2/room/' + this.currentRoom);
      this.showDotaMatchFound(this.opponentId, data.gameKey, false);
    } else if (data.type === 'dota_accept') {
      this.oppAcceptedMatch = true;
      this.updateDotaAcceptState();
    } else if (data.type === 'dota_decline') {
      this.closeDotaMatch();
      AudioEngine.error();
      App.showToast("Raqib o'yinni rad etdi yoki vaqti tugadi");
    }
  },

  showIncomingModal(fromId, gameTitle) {
    const t = this.t();
    App.closeModal();
    this.closeChallengeModal();

    const dotaModal = document.getElementById('dota-match-modal');
    if (dotaModal) dotaModal.classList.remove('active');

    const desc = `<b>#${fromId}</b> ${t.mpIncomingDesc || "sizni o'yinga taklif qilmoqda:"} <br><span style="color:#38bdf8; font-size:18px; font-weight:800; display:block; margin-top:8px;">${gameTitle}</span>`;
    const descEl = document.getElementById('m-incoming-desc');
    if (descEl) descEl.innerHTML = desc;

    const titleEl = document.getElementById('m-incoming-title');
    if (titleEl) titleEl.textContent = t.mpIncomingTitle || "O'yin Taklifi!";

    const acceptBtn = document.getElementById('btn-incoming-accept');
    if (acceptBtn) acceptBtn.textContent = t.mpAccept || "Qabul Qilish";

    const declineBtn = document.getElementById('btn-incoming-decline');
    if (declineBtn) declineBtn.textContent = t.mpDecline || "Rad Etish";

    const modal = document.getElementById('incoming-invite-modal');
    if (modal) modal.classList.add('active');

    AudioEngine.inviteAlert();
  },

  acceptIncoming() {
    AudioEngine.matchStart();
    const modal = document.getElementById('incoming-invite-modal');
    if (modal) modal.classList.remove('active');

    if (this.pendingInvite) {
      const invite = this.pendingInvite;
      this.opponentId = invite.fromId;
      this.currentGameKey = invite.gameKey;
      const myClean = String(this.myId).replace(/[^0-9]/g, '');
      const oppClean = String(invite.fromId).replace(/[^0-9]/g, '');
      const roomKey = invite.roomKey || ('mga_room_' + Math.min(Number(myClean) || 0, Number(oppClean) || 0) + '_' + Math.max(Number(myClean) || 0, Number(oppClean) || 0) + '_' + Date.now());
      this.currentRoom = roomKey;

      this.saveRecentRival(invite.fromId, invite.gameKey);
      this.setConnectedPeer(invite.fromId);
      this.subscribeAll('mgarena/v2/room/' + this.currentRoom);

      const resp = {
        type: 'accept',
        fromId: this.myId,
        targetId: invite.fromId,
        gameKey: invite.gameKey,
        roomKey: roomKey
      };

      this.dispatchMessage(invite.fromId, resp);
      setTimeout(() => this.dispatchMessage(invite.fromId, resp), 250);

      App.closeModal();
      this.closeChallengeModal();
      const t = this.t();
      App.showToast(`ID #${invite.fromId} ${t.mpOppFound || "bilan bog'landi!"}`);
      App.goView(invite.gameKey);
      this.notifyGameStarted(invite.gameKey, false);
      this.pendingInvite = null;
    }
  },

  declineIncoming() {
    AudioEngine.tap();
    const modal = document.getElementById('incoming-invite-modal');
    if (modal) modal.classList.remove('active');

    if (this.pendingInvite) {
      const resp = {
        type: 'decline',
        fromId: this.myId,
        targetId: this.pendingInvite.fromId
      };
      this.dispatchMessage(this.pendingInvite.fromId, resp);
      this.pendingInvite = null;
    }
  },

  cancelInvite() {
    if (this.inviteTimeout) {
      clearTimeout(this.inviteTimeout);
      this.inviteTimeout = null;
    }
    if (this.opponentId) {
      this.dispatchMessage(this.opponentId, {
        type: 'cancel_invite',
        fromId: this.myId,
        targetId: this.opponentId
      });
    }
    this.opponentId = null;
    this.currentRoom = null;
    App.closeModal();
  },

  openChallengeModal(gameKey, gameTitle) {
    AudioEngine.tap();
    this.currentGameKey = gameKey;
    const title = gameTitle || this.getGameName(gameKey);
    const titleEl = document.getElementById('mp-modal-game-title');
    if (titleEl) titleEl.textContent = title;

    if (this.connectedPeerId) {
      this.sendInviteTo(this.connectedPeerId, gameKey, title);
      return;
    }

    const inputEl = document.getElementById('mp-target-id-input');
    if (inputEl) inputEl.value = '';
    const modal = document.getElementById('mp-challenge-modal');
    if (modal) modal.classList.add('active');
    this.setMpTab('id');
    this.updateUIStrings();
  },

  closeChallengeModal() {
    AudioEngine.tap();
    this.stopRadarSearch();
    if (this.inviteTimeout) {
      clearTimeout(this.inviteTimeout);
      this.inviteTimeout = null;
    }
    const modal = document.getElementById('mp-challenge-modal');
    if (modal) modal.classList.remove('active');
  },

  setMpTab(tab) {
    AudioEngine.tap();
    this.stopRadarSearch();
    const tabId = document.getElementById('mp-tab-id');
    const tabRadar = document.getElementById('mp-tab-radar');
    const tabRecent = document.getElementById('mp-tab-recent');
    const bodyId = document.getElementById('mp-body-id');
    const bodyRadar = document.getElementById('mp-body-radar');
    const bodyRecent = document.getElementById('mp-body-recent');

    if (tabId) tabId.classList.toggle('active', tab === 'id');
    if (tabRadar) tabRadar.classList.toggle('active', tab === 'radar');
    if (tabRecent) tabRecent.classList.toggle('active', tab === 'recent');

    if (bodyId) bodyId.style.display = (tab === 'id') ? 'block' : 'none';
    if (bodyRadar) bodyRadar.style.display = (tab === 'radar') ? 'block' : 'none';
    if (bodyRecent) {
      bodyRecent.style.display = (tab === 'recent') ? 'block' : 'none';
      if (tab === 'recent') this.renderRecentRivals();
    }
  },

  saveRecentRival(rivalId, gameKey) {
    const cleanRival = String(rivalId || '').replace(/[^0-9]/g, '');
    const cleanMy = String(this.myId || '').replace(/[^0-9]/g, '');
    if (!cleanRival || cleanRival === cleanMy) return;
    try {
      let list = JSON.parse(localStorage.getItem('mg_recent_rivals') || '[]');
      list = list.filter(item => String(item.id).replace(/[^0-9]/g, '') !== cleanRival);
      list.unshift({
        id: cleanRival,
        gameKey: gameKey || this.currentGameKey,
        time: Date.now()
      });
      if (list.length > 15) list = list.slice(0, 15);
      localStorage.setItem('mg_recent_rivals', JSON.stringify(list));
    } catch (e) {}
  },

  renderRecentRivals() {
    const listEl = document.getElementById('mp-recent-list');
    if (!listEl) return;
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('mg_recent_rivals') || '[]');
    } catch (e) { list = []; }

    if (list.length === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:13px;">Hali bog'langan o'yinchilar yo'q.<br>Biror kim bilan ID yoki Radar orqali o'ynang!</div>`;
      return;
    }

    listEl.innerHTML = list.map(item => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--glass-bg); padding:10px 15px; border-radius:12px; margin-bottom:10px;">
        <div style="display:flex; align-items:center; gap:10px;">
          <div style="font-size:24px;">👤</div>
          <div>
            <div style="font-weight:800; font-size:16px; color:#fff;">#${item.id}</div>
          </div>
        </div>
        <button class="btn-action btn-green" style="width:auto; padding:8px 18px; font-size:13px; font-weight:800; border-radius:10px; margin:0; cursor:pointer;" onclick="Multiplayer.inviteRecentRival('${item.id}')">${this.t().mpBtnInvite || 'Chaqiriq'}</button>
      </div>
    `).join('');
  },

  inviteRecentRival(targetId) {
    const targetInput = document.getElementById('mp-target-id-input');
    if (targetInput) targetInput.value = targetId;
    this.sendInviteById();
  },

  dotaTimer: null,
  dotaTimeLeft: 10,
  iAcceptedMatch: false,
  oppAcceptedMatch: false,
  isDotaHost: false,

  showDotaMatchFound(oppId, gameKey, isHost) {
    this.opponentId = String(oppId).replace(/[^0-9]/g, '');
    this.currentGameKey = gameKey;
    this.isDotaHost = isHost;
    this.iAcceptedMatch = false;
    this.oppAcceptedMatch = false;
    this.dotaTimeLeft = 10;

    AudioEngine.dotaMatchFound();

    const modal = document.getElementById('dota-match-modal');
    if (modal) modal.classList.add('active');

    const descEl = document.getElementById('dota-match-desc');
    const timerFill = document.getElementById('dota-timer-fill');
    const acceptBtn = document.getElementById('dota-accept-btn');
    const statusText = document.getElementById('dota-ready-status');

    const t = this.t();
    const titleEl = document.getElementById('dota-match-title');
    if (titleEl) titleEl.textContent = t.mpMatchFound || "O'YIN TOPILDI!";
    const declineBtn = document.getElementById('dota-decline-btn');
    if (declineBtn) declineBtn.textContent = t.mpDecline || "Rad etish";

    if (descEl) descEl.textContent = `${t.mpOppFound || "Raqib topildi"} (#${this.opponentId})!`;
    if (acceptBtn) {
      acceptBtn.disabled = false;
      acceptBtn.textContent = "⚔️ " + (t.mpAccept || "QABUL QILISH");
      acceptBtn.style.background = "linear-gradient(135deg, #10b981, #059669)";
    }
    if (statusText) statusText.textContent = `${t.mpReady || "Tayyor"}: 0/2`;

    if (this.dotaTimer) clearInterval(this.dotaTimer);
    this.dotaTimer = setInterval(() => {
      this.dotaTimeLeft--;
      const pct = Math.max(0, (this.dotaTimeLeft / 10) * 100);
      if (timerFill) timerFill.style.width = pct + '%';

      if (this.dotaTimeLeft <= 0) {
        clearInterval(this.dotaTimer);
        this.dotaTimer = null;
        if (!this.iAcceptedMatch) {
          this.declineDotaMatch();
        } else if (!this.oppAcceptedMatch) {
          this.closeDotaMatch();
          AudioEngine.error();
          App.showToast("Raqib o'yinni o'z vaqtida qabul qilmadi!");
        }
      }
    }, 1000);
  },

  acceptDotaMatch() {
    AudioEngine.matchStart();
    this.iAcceptedMatch = true;
    const acceptBtn = document.getElementById('dota-accept-btn');
    const t = this.t();
    if (acceptBtn) {
      acceptBtn.disabled = true;
      acceptBtn.textContent = t.mpYouReady || "✓ SIZ TAYYORSIZ";
      acceptBtn.style.background = "#047857";
    }

    const payload = {
      type: 'dota_accept',
      fromId: this.myId,
      targetId: this.opponentId,
      gameKey: this.currentGameKey,
      roomKey: this.currentRoom
    };
    this.dispatchMessage(this.opponentId, payload);

    this.updateDotaAcceptState();
  },

  declineDotaMatch() {
    AudioEngine.tap();
    const payload = {
      type: 'dota_decline',
      fromId: this.myId,
      targetId: this.opponentId,
      gameKey: this.currentGameKey,
      roomKey: this.currentRoom
    };
    this.dispatchMessage(this.opponentId, payload);
    this.closeDotaMatch();
  },

  closeDotaMatch() {
    if (this.dotaTimer) {
      clearInterval(this.dotaTimer);
      this.dotaTimer = null;
    }
    const modal = document.getElementById('dota-match-modal');
    if (modal) modal.classList.remove('active');
  },

  updateDotaAcceptState() {
    const statusText = document.getElementById('dota-ready-status');
    const t = this.t();
    let readyCount = 0;
    if (this.iAcceptedMatch) readyCount++;
    if (this.oppAcceptedMatch) readyCount++;

    if (statusText) statusText.textContent = `${t.mpReady || "Tayyor"}: ${readyCount}/2`;

    if (readyCount === 2) {
      this.closeDotaMatch();
      this.saveRecentRival(this.opponentId, this.currentGameKey);
      App.closeModal();
      this.closeChallengeModal();
      AudioEngine.matchStart();
      if (typeof Confetti !== 'undefined') Confetti.fire(60);
      App.showToast(`ID #${this.opponentId} bilan jang boshlandi!`);
      App.goView(this.currentGameKey);
      this.notifyGameStarted(this.currentGameKey, this.isDotaHost);
    }
  },

  sendInviteById() {
    AudioEngine.tap();
    const t = this.t();
    const targetInput = document.getElementById('mp-target-id-input');
    const rawVal = targetInput ? targetInput.value : '';
    const target = rawVal.replace(/[^0-9]/g, '').trim();

    if (!target) {
      App.showToast(t.mpEnterIdErr || "Iltimos, raqib ID raqamini kiriting!");
      if (targetInput) targetInput.focus();
      return;
    }

    const myCleanId = String(this.myId).replace(/[^0-9]/g, '').trim();
    if (target === myCleanId) {
      App.showToast(t.mpSameIdErr || "O'zingizga taklif yubora olmaysiz!");
      return;
    }

    if (!this.isAnyMqttConnected()) {
      this.reconnectAllMqtt();
    }

    const gameTitleEl = document.getElementById('mp-modal-game-title');
    const gameTitle = gameTitleEl ? gameTitleEl.textContent : this.getGameName(this.currentGameKey);

    this.sendInviteTo(target, this.currentGameKey, gameTitle);
  },

  sendInviteTo(targetId, gameKey = this.currentGameKey, gameTitle = null) {
    AudioEngine.tap();
    const t = this.t();
    const target = String(targetId).replace(/[^0-9]/g, '').trim();
    if (!target) return;

    const myCleanId = String(this.myId).replace(/[^0-9]/g, '').trim();
    if (target === myCleanId) {
      App.showToast(t.mpSameIdErr || "O'zingizga taklif yubora olmaysiz!");
      return;
    }

    this.opponentId = target;
    this.currentGameKey = gameKey;
    const roomKey = 'mga_room_' + Math.min(Number(myCleanId) || 0, Number(target) || 0) + '_' + Math.max(Number(myCleanId) || 0, Number(target) || 0) + '_' + Date.now();
    this.currentRoom = roomKey;

    this.subscribeAll('mgarena/v2/room/' + this.currentRoom);

    const title = gameTitle || this.getGameName(gameKey) || "O'yin";

    const payload = {
      type: 'invite',
      fromId: myCleanId,
      targetId: target,
      gameKey: this.currentGameKey,
      gameTitle: title,
      roomKey: roomKey
    };

    this.closeChallengeModal();

    App.showModal(
      '⏳',
      t.mpInviteSent || "Taklif yuborildi",
      `#${target} ${t.mpWaitingOpp || "Javob kutilmoqda..."}<br><span style="color:#38bdf8; font-weight:800; font-size:16px; display:block; margin-top:6px;">${title}</span>`,
      () => {
        this.cancelInvite();
      },
      t.cancel || "Bekor Qilish"
    );

    this.dispatchMessage(target, payload);
    setTimeout(() => this.dispatchMessage(target, payload), 600);
    setTimeout(() => this.dispatchMessage(target, payload), 1500);

    if (this.inviteTimeout) clearTimeout(this.inviteTimeout);

    this.inviteTimeout = setTimeout(() => {
      const modal = document.getElementById('generic-modal');
      if (modal && modal.classList.contains('active')) {
        App.showModal(
          '⚠️',
          `#${target} ${t.mpRadarNotFound || "Javob bermadi"}`,
          t.mpRadarNotFoundDesc || "Raqib hozir javob bera olmadi yoki tarmoqqa ulanmagan.",
          () => { App.closeModal(); },
          "OK"
        );
      }
    }, 16000);
  },

  getGameName(key) {
    const t = this.t();
    const map = {
      chess: t.mChessTitle || 'Shaxmat',
      battleship: t.mBattleshipTitle || 'Dengiz Jangi (10x10)',
      battleship5: 'Dengiz Jangi (5x5)',
      maze: t.mMazeTitle || 'Sehrli Labirint',
      ttt: t.mTTTTitle || 'Tic-Tac-Toe (3x3)',
      ttt5: 'Tic-Tac-Toe (5x5)',
      math: t.mMathTitle || 'Tezkor Matematika',
      guess: t.mGuessTitle || 'Xazina Son',
      rps: t.mRPSTitle || 'Tosh-Qaychi-Qog\'oz',
      matches: t.mMatchesTitle || 'Gugurt Tenglamalari',
      pole: t.mPoleTitle || 'Mo\'jizalar Maydoni'
    };
    return map[key] || 'Arena';
  },

  startRadarSearch() {
    AudioEngine.tap();
    const t = this.t();
    const btn = document.getElementById('btn-radar-act');
    const listEl = document.getElementById('mp-online-list');

    this.discoveredPeers.clear();
    if (listEl) {
      listEl.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">📡 ${t.mpRadarSearching || "Onlayn o'yinchilar qidirilmoqda..."}</div>`;
    }

    this.radarTimer = 10;
    if (btn) {
      btn.disabled = true;
      btn.style.opacity = '0.7';
      btn.textContent = `🛰️ ${t.mpRadarSearching || "Qidirilmoqda"} (${this.radarTimer}s)`;
    }

    const pingPayload = {
      type: 'online_discovery_ping',
      fromId: this.myId
    };

    this.publishMqtt('mgarena/v2/lobby', pingPayload);
    this.broadcastLocal(pingPayload);

    if (this.radarInterval) clearInterval(this.radarInterval);

    this.radarInterval = setInterval(() => {
      this.radarTimer--;
      if (this.radarTimer > 0) {
        if (btn) btn.textContent = `🛰️ ${t.mpRadarSearching || "Qidirilmoqda"} (${this.radarTimer}s)`;
        this.publishMqtt('mgarena/v2/lobby', pingPayload);
        this.broadcastLocal(pingPayload);
      } else {
        this.stopRadarSearch();
        if (this.discoveredPeers.size === 0) {
          if (listEl) {
            listEl.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">${t.mpRadarNotFoundDesc || "Hozircha faol onlayn o'yinchilar topilmadi."}</div>`;
          }
        }
      }
    }, 1000);
  },

  addDiscoveredPeer(peerId) {
    const clean = String(peerId || '').replace(/[^0-9]/g, '');
    const cleanMy = String(this.myId || '').replace(/[^0-9]/g, '');
    if (!clean || clean === cleanMy) return;
    this.discoveredPeers.set(clean, Date.now());
    this.renderDiscoveredPeers();
  },

  renderDiscoveredPeers() {
    const listEl = document.getElementById('mp-online-list');
    if (!listEl) return;
    const t = this.t();

    if (this.discoveredPeers.size === 0) {
      listEl.innerHTML = `<div style="text-align:center; padding:15px; color:var(--text-muted); font-size:13px;">📡 ${t.mpRadarSearching || "Qidirilmoqda..."}</div>`;
      return;
    }

    const entries = Array.from(this.discoveredPeers.keys());
    listEl.innerHTML = entries.map(peerId => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:rgba(255,255,255,0.06); padding:10px 14px; border-radius:12px; margin-bottom:8px; border:1px solid rgba(56,189,248,0.25);">
        <div style="display:flex; align-items:center; gap:8px;">
          <span style="font-size:16px;">🟢</span>
          <div>
            <div style="font-weight:800; font-size:15px; color:#fff;">#${peerId}</div>
            <div style="font-size:11px; color:#10b981; font-weight:700;">ONLAYN</div>
          </div>
        </div>
        <button class="btn-action btn-green" style="width:auto; padding:6px 14px; font-size:12px; font-weight:800; border-radius:8px; margin:0;" onclick="Multiplayer.sendInviteTo('${peerId}')">
          ${t.mpBtnInvite || "Chaqiriq"}
        </button>
      </div>
    `).join('');
  },

  stopRadarSearch() {
    if (this.radarInterval) {
      clearInterval(this.radarInterval);
      this.radarInterval = null;
    }
    const btn = document.getElementById('btn-radar-act');
    if (btn) {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.textContent = this.t().mpRadarSearch || "O'yinchi Qidirish";
    }
  },

  sendGameMove(arg1, arg2) {
    const data = (arg2 !== undefined) ? arg2 : arg1;
    const gKey = (typeof arg1 === 'string' && arg2 !== undefined) ? arg1 : this.currentGameKey;
    const payload = {
      type: 'game_move',
      fromId: this.myId,
      targetId: this.opponentId,
      gameKey: gKey,
      roomKey: this.currentRoom,
      data: data
    };
    this.dispatchMessage(this.opponentId, payload);
  },

  dispatchGameMove(msg) {
    if (!msg || !msg.gameKey) return;
    if (msg.gameKey === 'ttt' && typeof TTT !== 'undefined') TTT.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'ttt5' && typeof TTT5 !== 'undefined') TTT5.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'battleship' && typeof Battleship !== 'undefined') Battleship.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'battleship5' && typeof Battleship5 !== 'undefined') Battleship5.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'chess' && typeof ChessGame !== 'undefined') ChessGame.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'maze' && typeof MazeGame !== 'undefined') MazeGame.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'rps' && typeof RPS !== 'undefined') RPS.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'math' && typeof MathGame !== 'undefined' && MathGame.handleRemoteMove) MathGame.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'guess' && typeof GuessNew !== 'undefined' && GuessNew.handleRemoteMove) GuessNew.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'matches' && typeof MatchesGame !== 'undefined' && MatchesGame.handleRemoteMove) MatchesGame.handleRemoteMove(msg.data);
    else if (msg.gameKey === 'pole' && typeof PoleGame !== 'undefined' && PoleGame.handleRemoteMove) PoleGame.handleRemoteMove(msg.data);
  },

  notifyGameStarted(gameKey, isHost) {
    this.isHost = isHost;
    this.currentGameKey = gameKey;
    if (gameKey === 'ttt' && typeof TTT !== 'undefined') TTT.startMultiplayer(isHost);
    else if (gameKey === 'ttt5' && typeof TTT5 !== 'undefined') TTT5.startMultiplayer(isHost);
    else if (gameKey === 'battleship' && typeof Battleship !== 'undefined') Battleship.startMultiplayer(isHost);
    else if (gameKey === 'battleship5' && typeof Battleship5 !== 'undefined') Battleship5.startMultiplayer(isHost);
    else if (gameKey === 'chess' && typeof ChessGame !== 'undefined') ChessGame.startMultiplayer(isHost);
    else if (gameKey === 'maze' && typeof MazeGame !== 'undefined') MazeGame.startMultiplayer(isHost);
    else if (gameKey === 'rps' && typeof RPS !== 'undefined') RPS.startMultiplayer(isHost);
    else if (gameKey === 'math' && typeof MathGame !== 'undefined') MathGame.startMultiplayer(isHost);
    else if (gameKey === 'guess' && typeof GuessNew !== 'undefined') GuessNew.startMultiplayer(isHost);
    else if (gameKey === 'matches' && typeof MatchesGame !== 'undefined') MatchesGame.startMultiplayer(isHost);
    else if (gameKey === 'pole' && typeof PoleGame !== 'undefined') PoleGame.startMultiplayer(isHost);
  },

  updateUIStrings() {
    const t = this.t();
    const setTxt = (id, txt) => {
      const el = document.getElementById(id);
      if (el && txt) el.textContent = txt;
    };

    setTxt('mp-modal-main-title', t.mpTitle || "Raqib Bilan O'ynash");
    setTxt('mp-tab-id', t.mpTabId || "🆔 ID orqali");
    setTxt('mp-tab-radar', t.mpTabRadar || "🔍 Onlayn qidirish");
    setTxt('mp-tab-recent', t.mpTabRecent || "👥 Do'stlar");
    setTxt('mp-id-desc-text', t.mpIdDesc || "Do'stingizning 4 xonali ID raqamini kiriting va chaqiruv yuboring:");
    setTxt('btn-send-invite-txt', t.mpSendInvite || "Taklif Yuborish");
    setTxt('mp-radar-desc-text', t.mpRadarDesc || "Hozir onlayn bo'lgan barcha o'yinchilarni qidiring:");
    setTxt('btn-radar-act', t.mpRadarSearch || "O'yinchi Qidirish");
    setTxt('btn-mp-cancel', t.mpCancel || "Bekor Qilish");
    setTxt('m-incoming-title', t.mpIncomingTitle || "🔔 O'yin Taklifi!");
    setTxt('btn-incoming-accept', t.mpAccept || "Qabul Qilish");
    setTxt('btn-incoming-decline', t.mpDecline || "Rad Etish");

    setTxt('dota-match-title', t.mpMatchFound || "O'YIN TOPILDI!");
    setTxt('dota-accept-btn', "⚔️ " + (t.mpAccept || "QABUL QILISH"));
    setTxt('dota-decline-btn', t.mpDecline || "Rad etish");

    const input = document.getElementById('mp-target-id-input');
    if (input) {
      input.placeholder = (t.mpInputPlaceholder || "Raqib ID raqami (masalan: 4892)");
    }
  }
};