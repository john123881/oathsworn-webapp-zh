/**
 * Oathsworn Multi-device Room Sync Client
 */
(function() {
    let ws = null;
    let roomCode = null;
    let isHost = false;
    let syncEnabled = false;
    let isApplyingRemoteSync = false;

    // Connect to WebSocket via current page origin /ws
    function getWsUrl() {
        const loc = window.location;
        const proto = loc.protocol === 'https:' ? 'wss:' : 'ws:';
        return `${proto}//${loc.host}/ws`;
    }

    function initWs(callback) {
        if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
            if (callback) callback();
            return;
        }

        try {
            ws = new WebSocket(getWsUrl());
        } catch (e) {
            console.error('Failed to create WebSocket:', e);
            updateStatus('連線失敗', 'error');
            return;
        }

        ws.onopen = function() {
            console.log('[Sync] WebSocket connected.');
            updateStatus('已連線', 'connected');
            if (callback) callback();
            
            // Heartbeat to prevent Cloudflare tunnel timeout
            if (window._syncPingInterval) clearInterval(window._syncPingInterval);
            window._syncPingInterval = setInterval(() => {
                if (ws && ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'ping' }));
                }
            }, 25000);
        };

        ws.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                handleMessage(data);
            } catch (e) {
                console.error('[Sync] Error parsing message:', e);
            }
        };

        ws.onclose = function() {
            if (window._syncPingInterval) clearInterval(window._syncPingInterval);
            console.log('[Sync] WebSocket disconnected.');
            updateStatus('未連線', 'disconnected');
            // Try reconnect if room is active
            if (roomCode) {
                setTimeout(() => initWs(), 3000);
            }
        };

        ws.onerror = function(err) {
            console.error('[Sync] WebSocket error:', err);
        };
    }

    function handleMessage(data) {
        if (data.type === 'created' || data.type === 'joined') {
            roomCode = data.room;
            const currentUser = window.AuthClient ? window.AuthClient.getUser() : null;
            const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin');
            isHost = isAdmin || data.isHost;
            syncEnabled = true;
            console.log('[Sync] Room connected. room:', roomCode, 'isHost:', isHost, 'state:', data.state);
            document.getElementById('sync-room-code-display').textContent = roomCode;
            document.getElementById('sync-role-badge').textContent = isHost ? '👑 隊長' : '👀 隊員';
            document.getElementById('sync-role-badge').className = isHost ? 'sync-badge host' : 'sync-badge member';
            document.getElementById('sync-room-info').classList.remove('d-none');
            document.getElementById('sync-join-box').classList.add('d-none');
            updateMemberCount(data.memberCount || 1, data.members);
            updateFloatingIndicator();

            if (!isHost && data.state) {
                applyRemoteState(data.state);
            }
        }
        else if (data.type === 'sync') {
            if (!isHost && data.state) {
                applyRemoteState(data.state);
            }
        }
        else if (data.type === 'chat') {
            appendChatMessage(data);
        }
        else if (data.type === 'member_update') {
            updateMemberCount(data.memberCount, data.members);
        }
        else if (data.type === 'host_left') {
            alert('隊長已離開房間。');
            leaveRoom();
        }
    }

    function updateMemberCount(count, members) {
        const el = document.getElementById('sync-member-count');
        if (el) el.textContent = `${count} 人在線`;

        // Update chat header member list
        const chatMembersEl = document.getElementById('chat-online-members');
        if (chatMembersEl && members && members.length > 0) {
            chatMembersEl.innerHTML = members.map(m => {
                const isAdmin = m.role === 'admin' || (m.username && m.username.toLowerCase() === 'admin');
                return `<span class="member-pill ${isAdmin ? 'admin' : ''}">${isAdmin ? '👑 ' : ''}${m.username}</span>`;
            }).join('');
        }
        
        // Update top-bar user badge with live count
        const authBtn = document.getElementById('btn-auth-float');
        const user = window.AuthClient ? window.AuthClient.getUser() : null;
        if (authBtn && user) {
            const isAdmin = user.role === 'admin' || user.username.toLowerCase() === 'admin';
            authBtn.innerHTML = `${isAdmin ? '👑 [主控隊長]' : '👀 [連線中]'} ${user.username} <span style="font-size:0.75rem;opacity:0.85;margin-left:4px;">(${count}人)</span>`;
        }
    }

    function updateStatus(text, cls) {
        const el = document.getElementById('sync-conn-status');
        if (el) {
            el.textContent = text;
            el.className = `sync-status-indicator ${cls}`;
        }
    }

    function updateFloatingIndicator() {
        // Now that login system is active, remove the stand-alone floating sync button
        const btn = document.getElementById('btn-sync-float');
        if (btn) btn.remove();
    }

    // Called whenever captain changes section or chapter
    window.broadcastGameState = function(state) {
        const currentUser = window.AuthClient ? window.AuthClient.getUser() : null;
        const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.username.toLowerCase() === 'admin');
        if (!isAdmin) return; // Only Admin broadcasts
        if (!ws || ws.readyState !== WebSocket.OPEN) return;
        if (isApplyingRemoteSync) return;

        console.log('[Sync] Broadcasting state to room:', state);
        ws.send(JSON.stringify({
            type: 'sync',
            state: state
        }));
    };

    function applyRemoteState(state) {
        if (!state) return;
        isApplyingRemoteSync = true;
        try {
            console.log('[Sync] Applying remote state:', state);
            // 1. If not even in game screen or different chapter, start chapter:
            if (!window.engine || window.currentChapterNum !== state.chapterNum) {
                if (typeof window.startChapter === 'function') {
                    window.startChapter(state.chapterNum);
                }
            }
            // 2. Sync pathChoice
            if (window.engine && state.pathChoice !== undefined) {
                if (window.engine.getPathChoice() !== state.pathChoice) {
                    window.engine.setPathChoice(state.pathChoice);
                }
            }
            // 3. Jump to section & re-render
            if (window.engine && state.sectionNum !== undefined) {
                const targetSecNum = state.sectionNum;
                const chapterData = window.engine.chapterData;
                const nextSec = chapterData.sections[targetSecNum];
                if (nextSec) {
                    window.engine.setCurrentSectionNum(
                        targetSecNum,
                        nextSec.locationsAdded,
                        nextSec.clearLocationsList,
                        nextSec.removeSpecificLocations,
                        chapterData.clue,
                        chapterData.clueLocation
                    );
                    if (typeof window.loadSection === 'function') {
                        window.loadSection(false);
                    }
                }
            }
        } catch (e) {
            console.error('[Sync] Error applying state:', e);
        } finally {
            setTimeout(() => { isApplyingRemoteSync = false; }, 300);
        }
    }

    // UI actions
    function createRoom() {
        initWs(() => {
            const randomCode = Math.floor(1000 + Math.random() * 9000).toString();
            const currentState = getCurrentLocalState();
            ws.send(JSON.stringify({
                type: 'create',
                room: randomCode,
                state: currentState
            }));
        });
    }

    function joinRoom(code) {
        if (!code) return;
        initWs(() => {
            ws.send(JSON.stringify({
                type: 'join',
                room: code
            }));
        });
    }

    function leaveRoom() {
        roomCode = null;
        isHost = false;
        syncEnabled = false;
        if (ws) {
            ws.close();
            ws = null;
        }
        document.getElementById('sync-room-info').classList.add('d-none');
        document.getElementById('sync-join-box').classList.remove('d-none');
        updateFloatingIndicator();
    }

    function getCurrentLocalState() {
        return {
            chapterNum: window.currentChapterNum || 1,
            sectionNum: window.engine ? window.engine.getCurrentSectionNum() : 0,
            pathChoice: window.engine ? window.engine.getPathChoice() : null
        };
    }

    function openModal() {
        const el = document.getElementById('sync-modal');
        if (el) {
            el.style.display = 'flex';
            el.style.zIndex = '99999';
        }
    }

    function closeModal() {
        const el = document.getElementById('sync-modal');
        if (el) el.style.display = 'none';
    }

    // Initialize auto URL room param checking (e.g. ?room=1234)
    $(function() {
        // Auto connect & join main room for logged in users
        const user = window.AuthClient ? window.AuthClient.getUser() : null;
        if (user) {
            const isAdmin = user.role === 'admin' || user.username.toLowerCase() === 'admin';
            if (isAdmin) {
                // Admin automatically creates/maintains the official main room: 1001
                initWs(() => {
                    const currentState = getCurrentLocalState();
                    ws.send(JSON.stringify({
                        type: 'create',
                        room: '1001',
                        user: user.username,
                        role: user.role || 'admin',
                        state: currentState
                    }));
                });
            } else {
                // Non-admin players automatically join main room: 1001
                initWs(() => {
                    ws.send(JSON.stringify({
                        type: 'join',
                        room: '1001',
                        user: user.username,
                        role: user.role || 'user'
                    }));
                });
            }
        }

        updateFloatingIndicator();

        // Wire Chat Panel events
        $('#chat-toggle-btn').on('click', function() {
            const panel = $('#chat-panel');
            panel.toggleClass('closed');
            if (!panel.hasClass('closed')) {
                $('#chat-unread-badge').hide().text('0');
                $('#chat-input-text').focus();
            }
        });

        $('#btn-chat-close').on('click', function() {
            $('#chat-panel').addClass('closed');
        });

        function doSendChat() {
            const input = $('#chat-input-text');
            const val = input.val();
            if (val && val.trim()) {
                sendChatMessage(val);
                input.val('');
            }
        }

        $('#btn-chat-send').on('click', doSendChat);
        $('#chat-input-text').on('keypress', function(e) {
            if (e.which === 13) {
                e.preventDefault();
                doSendChat();
            }
        });

        // Wire modal buttons
        $('#btn-sync-create').on('click', createRoom);
        $('#btn-sync-join').on('click', function() {
            const code = $('#sync-input-code').val().trim();
            if (code) joinRoom(code);
        });
        $('#btn-sync-leave').on('click', leaveRoom);
        $('#btn-sync-close').on('click', closeModal,
        sendChatMessage);
        $('#sync-modal').on('click', function(e) { if (e.target === this) closeModal,
        sendChatMessage(); });

        $('#btn-sync-copy-link').on('click', function() {
            if (!roomCode) return;
            const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
            navigator.clipboard.writeText(url).then(() => {
                const btn = document.getElementById('btn-sync-copy-link');
                const orig = btn.textContent;
                btn.textContent = '已複製連結！';
                setTimeout(() => { btn.textContent = orig; }, 1800);
            });
        });

        const params = new URLSearchParams(window.location.search);
        const autoRoom = params.get('room');
        if (autoRoom) {
            joinRoom(autoRoom);
        }
    });

    
    function sendChatMessage(text) {
        if (!text || !text.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;
        const user = window.AuthClient ? window.AuthClient.getUser() : null;
        ws.send(JSON.stringify({
            type: 'chat',
            text: text.trim(),
            user: user ? user.username : '訪客',
            role: user ? (user.role || 'user') : 'user'
        }));
    }

    function appendChatMessage(data) {
        const box = document.getElementById('chat-messages-container');
        if (!box) return;
        
        const isMe = window.AuthClient && window.AuthClient.getUser() && (window.AuthClient.getUser().username === data.user);
        const isAdmin = data.role === 'admin' || (data.user && data.user.toLowerCase() === 'admin');
        
        const row = document.createElement('div');
        row.className = `chat-message-row ${isMe ? 'me' : 'other'}`;
        
        const badge = isAdmin ? '<span class="chat-badge-admin">👑 隊長</span> ' : '';
        row.innerHTML = `
            <div class="chat-bubble">
                <div class="chat-meta">${badge}<strong>${data.user}</strong> <span class="chat-time">${data.time || ''}</span></div>
                <div class="chat-text">${escapeHtml(data.text)}</div>
            </div>
        `;
        box.appendChild(row);
        box.scrollTop = box.scrollHeight;

        // If chat panel is closed, show unread badge
        const panel = document.getElementById('chat-panel');
        if (panel && panel.classList.contains('closed')) {
            const badgeEl = document.getElementById('chat-unread-badge');
            if (badgeEl) {
                let count = parseInt(badgeEl.textContent || '0') + 1;
                badgeEl.textContent = count;
                badgeEl.style.display = 'inline-block';
            }
        }
    }

    function escapeHtml(str) {
        return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    window.RoomSync = {
        createRoom,
        joinRoom,
        leaveRoom,
        openModal,
        closeModal,
        sendChatMessage
    };
})();
