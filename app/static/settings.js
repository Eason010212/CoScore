// 从LocalStorage里面尝试提取apiReferer, apiKey, apiModel
function getLLMSettings() {
    const apiReferer = localStorage.getItem('apiReferer') || 'siliconflow';
    const apiKey = localStorage.getItem('apiKey') || '';
    const apiModel = localStorage.getItem('apiModel') || 'Pro/deepseek-ai/DeepSeek-V3';
    document.getElementById('apiReferer').value = apiReferer;
    document.getElementById('apiKey').value = apiKey;
    document.getElementById('apiModel').value = apiModel;
}

function saveLLMSettings() {
    const apiReferer = document.getElementById('apiReferer').value;
    const apiKey = document.getElementById('apiKey').value;
    const apiModel = document.getElementById('apiModel').value;

    localStorage.setItem('apiReferer', apiReferer);
    localStorage.setItem('apiKey', apiKey);
    localStorage.setItem('apiModel', apiModel);

    closeModal('LLMSettingModal');
}

const inject = `<div class="modal" id="LLMSettingModal">
        <div class="modal-background" onclick="closeModal('LLMSettingModal')"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title">` + langArr['llm-settings'][currentLang] + `</p>
                <button class="delete" aria-label="close" onclick="closeModal('LLMSettingModal')"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">` + langArr['api-provider'][currentLang] + `</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="apiReferer">
                                <option value="siliconflow">SiliconFlow</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="field">
                    <label class="label">API Key</label>
                    <div class="control">
                        <input class="input" type="password" id="apiKey" placeholder="` + langArr['enter-api-key'][currentLang] + `">
                    </div>
                </div>

                <div class="field">
                    <label class="label">` + langArr['model'][currentLang] + `</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="apiModel">
                                <option value="Pro/deepseek-ai/DeepSeek-V3">Pro/deepseek-ai/DeepSeek-V3</option>
                                <option value="Qwen/Qwen2.5-72B-Instruct">Qwen/Qwen2.5-72B-Instruct</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-success" onclick="saveLLMSettings()" style="margin-right:10px">
                    <span class="icon"><i class="fas fa-save"></i></span>
                    <span>` + langArr['save-settings'][currentLang] + `</span>
                </button>
                <button class="button" onclick="closeModal('LLMSettingModal')">` + langArr['cancel'][currentLang] + `</button>
            </footer>
        </div>
    </div>`

// inject the modal
document.body.innerHTML += inject

const inject2 = `<!-- Notification Modal -->
    <div class="modal" id="notificationModal">
        <div class="modal-background" onclick="closeModal('notificationModal')"></div>
        <div class="modal-card">
            <header class="modal-card-head">
                <p class="modal-card-title" id="notificationTitle">Notification</p>
                <button class="delete" aria-label="close" onclick="closeModal('notificationModal')"></button>
            </header>
            <section class="modal-card-body">
                <p id="notificationMessage">This is a notification message.</p>
            </section>
            <footer class="modal-card-foot">
                <button class="button" onclick="closeModal('notificationModal')">OK</button>
            </footer>
        </div>
    </div>`
    // inject the modal
document.body.innerHTML += inject2

function openLLMSettingModal() {
    document.getElementById('LLMSettingModal').classList.add('is-active');
    getLLMSettings();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}

function showNotification(title, message) {
    document.getElementById('notificationTitle').textContent = title;
    document.getElementById('notificationMessage').textContent = message;
    document.getElementById('notificationModal').classList.add('is-active');
}