/**
 * Oathsworn User Authentication & Cloud Save Client
 */
(function() {
    const AUTH_KEY = 'oathsworn_user';

    function getUser() {
        try {
            const raw = localStorage.getItem(AUTH_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function setUser(user) {
        if (!user) {
            localStorage.removeItem(AUTH_KEY);
        } else {
            localStorage.setItem(AUTH_KEY, JSON.stringify(user));
        }
        updateAuthUI();
    }

    function updateAuthUI() {
        const user = getUser();
        let btn = document.getElementById('btn-auth-float');
        if (!btn) {
            btn = document.createElement('button');
            btn.id = 'btn-auth-float';
            btn.className = 'btn-auth-floating';
            document.body.appendChild(btn);
            btn.onclick = openModal;
        }

        if (user) {
            const isAdmin = user.role === 'admin' || user.username.toLowerCase() === 'admin';
            btn.innerHTML = `${isAdmin ? '👑 [主控隊長] ' : '👀 [連線中] '}${user.username}`;
            btn.classList.add('logged-in');
            if (isAdmin) btn.classList.add('admin-badge');
            document.getElementById('auth-form-box').classList.add('d-none');
            document.getElementById('auth-user-box').classList.remove('d-none');
            document.getElementById('auth-current-username').innerHTML = `${user.username} ${isAdmin ? '<span style="color:#ffd700;font-size:0.8rem;border:1px solid #ffd700;border-radius:10px;padding:2px 8px;margin-left:5px;">主控隊長</span>' : '<span style="color:#00c8ff;font-size:0.8rem;border:1px solid #00c8ff;border-radius:10px;padding:2px 8px;margin-left:5px;">隊員（同步跟隨）</span>'}`;
        } else {
            btn.innerHTML = `🔑 <span>登入 / 註冊</span>`;
            btn.classList.remove('logged-in');
            document.getElementById('auth-form-box').classList.remove('d-none');
            document.getElementById('auth-user-box').classList.add('d-none');
        }
    }

    async function apiRequest(path, data, method = 'POST') {
        const opts = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (data && method === 'POST') {
            opts.body = JSON.stringify(data);
        }
        const res = await fetch(path, opts);
        const json = await res.json();
        if (!res.ok || json.error) {
            throw new Error(json.error || '請求失敗');
        }
        return json;
    }

    async function handleLogin() {
        const username = $('#auth-input-user').val().trim();
        const password = $('#auth-input-pass').val();
        const errorEl = $('#auth-error-msg');
        errorEl.text('');

        if (!username || !password) {
            errorEl.text('請輸入帳號與密碼');
            return;
        }

        try {
            const res = await apiRequest('/api/login', { username, password });
            setUser(res.user);

            // If user has cloud save, ask/auto sync to local
            if (res.saveData && res.saveData !== '{}') {
                const cloudSave = typeof res.saveData === 'string' ? JSON.parse(res.saveData) : res.saveData;
                localStorage.setItem('oathsworn_save', JSON.stringify(cloudSave));
            } else {
                // Upload current local save to cloud for new login
                const currentLocal = localStorage.getItem('oathsworn_save');
                if (currentLocal && currentLocal !== '{}') {
                    await apiRequest('/api/save', { userId: res.user.id, saveData: currentLocal });
                }
            }

            closeModal();
            alert(`歡迎回來，守誓者 ${res.user.username}！雲端進度已同步。`);
            location.reload();
        } catch (e) {
            errorEl.text(e.message);
        }
    }

    async function handleRegister() {
        const username = $('#auth-input-user').val().trim();
        const password = $('#auth-input-pass').val();
        const errorEl = $('#auth-error-msg');
        errorEl.text('');

        if (!username || !password) {
            errorEl.text('請填寫完整帳號與密碼');
            return;
        }
        if (password.length < 4) {
            errorEl.text('密碼長度請至少 4 個字元');
            return;
        }

        try {
            const res = await apiRequest('/api/register', { username, password });
            setUser(res.user);

            // Upload current local save to newly registered account
            const currentLocal = localStorage.getItem('oathsworn_save');
            if (currentLocal && currentLocal !== '{}') {
                await apiRequest('/api/save', { userId: res.user.id, saveData: currentLocal });
            }

            closeModal();
            alert(`註冊成功！帳號 ${res.user.username} 已綁定此裝置戰役進度。`);
            location.reload();
        } catch (e) {
            errorEl.text(e.message);
        }
    }

    async function uploadCurrentSave() {
        const user = getUser();
        if (!user) return;
        const currentLocal = localStorage.getItem('oathsworn_save');
        try {
            await apiRequest('/api/save', { userId: user.id, saveData: currentLocal || '{}' });
            const btn = document.getElementById('btn-auth-manual-save');
            if (btn) {
                const orig = btn.textContent;
                btn.textContent = '✅ 已備份到雲端！';
                setTimeout(() => { btn.textContent = orig; }, 1800);
            }
        } catch (e) {
            alert('上傳失敗: ' + e.message);
        }
    }

    function handleLogout() {
        if (confirm('確定要登出此帳號嗎？')) {
            setUser(null);
            closeModal();
            location.reload();
        }
    }

    function openModal() {
        const el = document.getElementById('auth-modal');
        if (el) {
            el.style.display = 'flex';
            el.style.zIndex = '99999';
        }
    }

    function closeModal() {
        const el = document.getElementById('auth-modal');
        if (el) el.style.display = 'none';
    }

    $(function() {
        updateAuthUI();

        $('#btn-auth-login').on('click', handleLogin);
        $('#btn-auth-register').on('click', handleRegister);
        $('#btn-auth-logout').on('click', handleLogout);
        $('#btn-auth-manual-save').on('click', uploadCurrentSave);
        $('#btn-auth-close').on('click', closeModal);
        $('#auth-modal').on('click', function(e) { if (e.target === this) closeModal(); });

        // Auto upload save whenever GameState saves
        const origSave = window.localStorage.setItem;
        window.localStorage.setItem = function(key, val) {
            origSave.apply(this, arguments);
            if (key === 'oathsworn_save') {
                const user = getUser();
                if (user) {
                    apiRequest('/api/save', { userId: user.id, saveData: val }).catch(() => {});
                }
            }
        };
    });

    window.AuthClient = {
        getUser,
        openModal,
        closeModal
    };
})();
