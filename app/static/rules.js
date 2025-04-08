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
    chat(prompt, (response) => {
        btn.classList.remove('is-loading');
        if (response.ok) {
            response.json().then(data => {
                const rule = data.choices[0].message.content;
                document.getElementById('generatedRule').textContent = rule;
            });
        } else {
            alert('Error generating rule');
        }
    });

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
    var ruleContent = document.getElementById('generatedRule').textContent;
    const testText = document.getElementById('testText').value;

    if (!ruleContent) {
        alert('No rule to test');
        return;
    }
    //ruleContent remove '```json' and '```'
    var rule = ruleContent.replace('```json', '').replace('```', '').trim();
    var ruleContent = JSON.parse(rule);

    if (!testText) {
        alert('Please enter text to test');
        return;
    }

    // Show loading state
    const btn = document.getElementById('testBtn');
    btn.classList.add('is-loading');

    $.ajax({
        url: '/api/testRule',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            rule: ruleContent,
            answer: testText.split('-')
        }),
        success: function(response) {
            btn.classList.remove('is-loading');
            $("#testResult").html(`Rule test result: ${JSON.stringify(response)}`);
        },
        error: function(error) {
            btn.classList.remove('is-loading');
            $("#testResult").html('Error testing rule');
        }
    });
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
    $("#rulePrompt").val("流程通顺（5分）：[前进、红灯、停车/等待、左转、前进] 单向贴近得分；逻辑正确（3分）：如果/是否/若/反之；程序完整（2分）：开始,结束")
});