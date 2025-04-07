// 从LocalStorage里面尝试提取apiReferer, apiKey, apiModel
function getLLMSettings() {
    const apiReferer = localStorage.getItem('apiReferer') || 'siliconflow';
    const apiKey = localStorage.getItem('apiKey') || '';
    const apiModel = localStorage.getItem('apiModel') || 'deepseek-v3';
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
                <p class="modal-card-title">LLM API Settings</p>
                <button class="delete" aria-label="close" onclick="closeModal('LLMSettingModal')"></button>
            </header>
            <section class="modal-card-body">
                <div class="field">
                    <label class="label">API Provider</label>
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
                        <input class="input" type="password" id="apiKey" placeholder="Enter your API key">
                    </div>
                    <p class="help">Your API key will be stored securely</p>
                </div>

                <div class="field">
                    <label class="label">Model</label>
                    <div class="control">
                        <div class="select is-fullwidth">
                            <select id="apiModel">
                                <option value="deepseek-v3">Pro/deepseek-ai/DeepSeek-V3</option>
                                <option value="qwen-v2.5">Qwen/Qwen2.5-72B-Instruct</option>
                            </select>
                        </div>
                    </div>
                    <p class="help">Select the model you want to use</p>
                </div>
            </section>
            <footer class="modal-card-foot">
                <button class="button is-success" onclick="saveLLMSettings()" style="margin-right:10px">
                    <span class="icon"><i class="fas fa-save"></i></span>
                    <span>Save Settings</span>
                </button>
                <button class="button" onclick="closeModal('LLMSettingModal')">Cancel</button>
            </footer>
        </div>
    </div>`

// inject the modal
document.body.innerHTML += inject

function openLLMSettingModal() {
    document.getElementById('LLMSettingModal').classList.add('is-active');
    getLLMSettings();
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}