// Generate a new rule 
function generateRule() {
    const prompt = document.getElementById('rulePrompt').value;
    if (!prompt) {
        alert('Please enter a prompt for rule generation');
        return;
    }

    // Show loading state
    const btn = document.getElementById('generateBtn');
    btn.classList.add('is-loading');

    // In a real app, this would call your LLM API
    // Here we simulate a delay and return a sample rule
}

// Save the current rule
function saveRule() {
    const ruleContent = document.getElementById('generatedRule').textContent;
    if (!ruleContent) {
        alert('No rule to save');
        return;
    }

    // In a real app, this would save to your backend
    // Here we just show a confirmation
    const ruleName = prompt('Enter a name for this rule:', 'New Scoring Rule');
    if (ruleName) {
        alert(`Rule "${ruleName}" would be saved in a real implementation`);
    }
}

// Test the current rule
function testRule() {
    const ruleContent = document.getElementById('generatedRule').textContent;
    const testText = document.getElementById('testText').value;

    if (!ruleContent) {
        alert('No rule to test');
        return;
    }

    if (!testText) {
        alert('Please enter text to test');
        return;
    }

    // Show loading state
    const btn = document.getElementById('testBtn');
    btn.classList.add('is-loading');

    // In a real app, this would call your scoring engine
    // Here we simulate a delay and return a sample result
    setTimeout(() => {
        const score = Math.min(10, Math.max(0, Math.floor(Math.random() * 10 * 10) / 10));
        document.getElementById('resultContent').innerHTML = `
                    <p><strong>Input Text:</strong> "${testText.substring(0, 50)}${testText.length > 50 ? '...' : ''}"</p>
                    <p><strong>Score:</strong> <span class="tag is-primary is-medium">${score}</span></p>
                    <p><strong>Details:</strong></p>
                    <ul>
                        <li>Rule component 1 matched: ${score > 5 ? 'Yes' : 'No'}</li>
                        <li>Rule component 2 matched: ${score > 3 ? 'Yes' : 'No'}</li>
                        <li>Score calculation: ${score > 5 ? 'Full' : 'Partial'} credit</li>
                    </ul>
                `;
        document.getElementById('testResult').style.display = 'block';
        btn.classList.remove('is-loading');
    }, 1000);
}

// Load a saved rule
function loadRule(ruleId) {
    if (!sampleRules[ruleId]) return;

    // Update UI
    document.querySelectorAll('.rule-card').forEach(card => {
        card.classList.remove('is-active');
    });
    event.currentTarget.classList.add('is-active');

    // Load the rule
    currentRuleId = ruleId;
    const rule = sampleRules[ruleId];
    document.getElementById('generatedRule').textContent = rule.rule;
}

// Delete a rule
function deleteRule(ruleId) {
    if (confirm(`Are you sure you want to delete "${sampleRules[ruleId].name}"?`)) {
        // In a real app, this would delete from your backend
        // Here we just show a confirmation
        alert(`Rule "${sampleRules[ruleId].name}" would be deleted in a real implementation`);
        event.stopPropagation();
    }
}

// Refresh rules list
function refreshRules() {
    // In a real app, this would reload from your backend
    alert('Rules list would be refreshed in a real implementation');
}

// Initialize with first rule loaded
window.addEventListener('DOMContentLoaded', function() {
    /*<div class="card rule-card is-active" onclick="loadRule('solarSystem')">
                                    <div class="card-content">
                                        <div class="media">
                                            <div class="media-content">
                                                <p class="title is-6">Solar System Accuracy</p>
                                                <p class="subtitle is-7">Last used: 2023-06-15</p>
                                            </div>
                                            <div class="media-right">
                                                <button class="delete is-small" onclick="event.stopPropagation();deleteRule('solarSystem')"></button>
                                            </div>
                                        </div>
                                        <div class="content">
                                            <small>Scores answers about planets and orbits</small>
                                        </div>
                                    </div>
                                </div>*/
    $.ajax({
        url: '/api/getRules',
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if (response.length == 0) {
                $("#emptyRules").css("display", "block")
            } else {
                $("#emptyRules").css("display", "none")
                response.forEach(function(rule) {
                    const ruleCard = `
                        <div class="card rule-card" onclick="loadRule('${rule.name}')">
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-content">
                                        <p class="title is-6">${rule.name}</p>
                                        <p class="subtitle is-7">Last used: ${rule.modified}</p>
                                    </div>
                                    <div class="media-right">
                                        <button class="delete is-small" onclick="event.stopPropagation();deleteRule('${rule.name}')"></button>
                                    </div>
                                </div>
                                <div class="content">
                                    <small>${rule.desc}</small>
                                </div>
                            </div>
                        </div>
                    `;
                    document.getElementById('ruleCards').innerHTML += ruleCard;
                });
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
});