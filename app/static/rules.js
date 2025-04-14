// Generate a new rule
currentRuleId = ''

function generateRule() {
    const prompt = document.getElementById('rulePrompt').value;
    if (!prompt) {
        showNotification('Error', 'Please enter a prompt for rule generation');
        return;
    }

    // Show loading state
    const btn = document.getElementById('generateBtn');
    btn.classList.add('is-loading');
    let accumulatedContent = '';

    chat(prompt, (response) => {
        if (response.error) {
            btn.classList.remove('is-loading');
            showNotification('Error', 'Error: ' + response.error);
            return;
        }

        if (response.done) {
            btn.classList.remove('is-loading');
            return;
        }

        if (response.content) {
            accumulatedContent += response.content;
            document.getElementById('generatedRule').textContent = accumulatedContent;
        }
    });

}

// Save the current rule
function saveRule() {
    const ruleContent = document.getElementById('generatedRule').textContent;
    const thisprompt = document.getElementById('rulePrompt').value;
    if (!ruleContent) {
        showNotification('Error', 'No rule to save');
        return;
    }
    var ruleName = ""
    var isNew = false
    if (currentRuleId == "") {
        ruleName = prompt('Enter a name for this rule:', 'New Scoring Rule');
        isNew = true
    } else {
        ruleName = currentRuleId
    }
    if (ruleName) {
        var dup = false
        for (var i = 0; i < allRules.length; i++) {
            if (allRules[i] == ruleName) {
                dup = true
                break
            }
        }
        if (dup && isNew) {
            showNotification('Error', 'Rule name already exists');
            return;
        }
        $.ajax({
            url: '/api/saveRule',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: ruleName,
                prompt: thisprompt,
                rule: ruleContent
            }),
            success: function(response) {
                showNotification('Success', 'Rule saved successfully');
                allRules.push(ruleName)
                allRulesDict[ruleName] = ruleContent
                location.reload()
            },
            error: function(error) {
                showNotification('Error', 'Error saving rule');
            }
        });
    } else {
        showNotification('Error', 'Rule saving cancelled');
    }
}

// Test the current rule
function testRule() {
    var ruleContent = document.getElementById('generatedRule').textContent;
    const testText = document.getElementById('testText').value;

    if (!ruleContent) {
        showNotification('Error', 'No rule to test');
        return;
    }
    //ruleContent remove '```json' and '```'
    var rule = ruleContent.replace('```json', '').replace('```', '').replaceAll(" ", "").trim();
    console.log(rule)
    var ruleContent = JSON.parse(rule);

    if (!testText) {
        showNotification('Error', 'Please enter text to test');
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
    // Update UI
    document.querySelectorAll('.rule-card').forEach(card => {
        card.classList.remove('is-active');
    });
    event.currentTarget.classList.add('is-active');

    // Load the rule
    currentRuleId = ruleId;
    const rule = allRulesDict[ruleId];
    document.getElementById('generatedRule').textContent = rule.rule;
    document.getElementById('rulePrompt').value = rule.prompt;
    document.getElementById('testText').value = '';
    document.getElementById('testResult').textContent = '...';
}

// Delete a rule
function deleteRule(ruleId) {
    if (confirm(`Are you sure you want to delete "${ruleId}"?`)) {
        $.ajax({
            url: '/api/deleteRule',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: ruleId
            }),
            success: function(response) {
                showNotification('Success', 'Rule deleted successfully');
                location.reload()
            },
            error: function(error) {
                showNotification('Error', 'Error deleting rule');
            }
        });
    }
}

function newRule() {
    // 清空rulePrompt和generatedRule
    document.getElementById('rulePrompt').value = '';
    document.getElementById('generatedRule').textContent = '';
    document.getElementById('testText').value = '';
    document.getElementById('testResult').textContent = '...';
    currentRuleId = '';
    // request focus: rulePrompt
    document.getElementById('rulePrompt').focus();
}

allRules = []
allRulesDict = {}
    // Initialize with first rule loaded
window.addEventListener('DOMContentLoaded', function() {
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
                    allRules.push(rule.name)
                    allRulesDict[rule.name] = rule
                    const ruleCard = `
                        <div class="card rule-card" onclick="loadRule('${rule.name}')">
                            <div class="card-content">
                                <div class="media">
                                    <div class="media-content">
                                        <p class="title is-6">${rule.name}</p>
                                        <p class="subtitle is-7">Last modified: ${rule.modified}</p>
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
                    document.getElementById('rulesList').innerHTML += ruleCard;
                });
            }
        },
        error: function(xhr, status, error) {
            showNotification('Error', 'An error occurred: ' + error);
        }
    });
});