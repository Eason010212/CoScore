// Task management functions
function openNewTaskModal() {
    document.getElementById('newTaskModal').classList.add('is-active');
}
function openNewResultModal() {
    document.getElementById('resultsModal').classList.add('is-active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}

function createTask() {
    const name = document.getElementById('taskName').value;
    const dataset = document.getElementById('taskDataset').value;
    const rule = document.getElementById('taskRule').value;

    if (!name || !dataset || !rule) {
        alert('Please fill all required fields');
        return;
    }

    $.ajax({
        url: '/api/createTask',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            data_name: dataset,
            rule_name: rule,
            task_name: name
        }),
        success: function (response) {
            location.reload();
        },
        error: function (error) {
            alert('Error creating task:', error);
        }
    });
    closeModal('newTaskModal');

    // Reset form
    document.getElementById('taskName').value = '';
    document.getElementById('taskDataset').value = '';
    document.getElementById('taskRule').value = '';
}

function viewResults(taskId) {
    document.getElementById('resultsTaskName').textContent = allTasksDict[taskId].task_name;
    document.getElementById('resultsDataset').textContent = allTasksDict[taskId].data_name;
    document.getElementById('resultsRule').textContent = allTasksDict[taskId].rule_name;
    if (allTasksDict[taskId].status == 'completed') {
        document.getElementById('resultsStatus').textContent = 'Running';
        document.getElementById('resultsStatus').className = 'tag is-success';
        document.getElementById('resultsError').style.display = 'none';
        document.getElementById('resultsTable').style.display = 'block';
        document.getElementById('completeTime').textContent = allTasksDict[taskId].executed;
    }
    else if (allTasksDict[taskId].status == 'failed') {
        document.getElementById('resultsStatus').textContent = 'Failed';
        document.getElementById('resultsStatus').className = 'tag is-danger';
        document.getElementById('resultsError').style.display = 'block';
        document.getElementById('resultsTable').style.display = 'none';
        document.getElementById('errorText').textContent = allTasksDict[taskId].result;
    }
    openNewResultModal();
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        // In a real app, this would delete the task via API
        alert(`Task ${taskId} would be deleted in a real implementation`);
    }
}


// Check if there are any tasks (for empty state)
window.addEventListener('DOMContentLoaded', function () {
    $.ajax({
        url: '/api/getData',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var datasetName = data[i].name + ' (' + data[i].type + ', ' + data[i].count + ' items)';
                document.getElementById('taskDataset').innerHTML += `<option value="${data[i].name}">${datasetName}</option>`;
            }
        },
        error: function (error) {
            alert('Error fetching datasets:', error);
        }
    });
    $.ajax({
        url: '/api/getRules',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                document.getElementById('taskRule').innerHTML += `<option value="${data[i].name}">${data[i].name}</option>`;
            }
        },
        error: function (error) {
            alert('Error fetching rules:', error);
        }
    });
    allTasks = []
    allTasksDict = {}
    $.ajax({
        url: '/api/getTasks',
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            if(data.length === 0) {
                document.getElementById('emptyTasks').style.display = 'block';
                document.getElementById('myTaskTable').style.display = 'none';
            }
            else{
                document.getElementById('emptyTasks').style.display = 'none';
                document.getElementById('myTaskTable').style.display = 'block';
                for (var i = 0; i < data.length; i++) {
                    allTasks.push(data[i].task_name)
                    allTasksDict[data[i].task_name] = data[i]
                    var tr = "<tr><td>" + data[i].data_name + "</td><td>" + data[i].rule_name + "</td><td>" + data[i].task_name + "</td>";
                    if(data[i].status == 'completed'){
                        tr += "<td><span class='tag status-tag status-completed'>Completed</span></td>";
                    }
                    else if(data[i].status == 'running'){
                        tr += "<td><span class='tag status-tag status-running'>Running</span></td>";
                    }
                    else if(data[i].status == 'failed'){
                        tr += "<td><span class='tag status-tag status-failed'>Failed</span></td>";
                    }
                    // if not running, view results; if running, view results (disabled)
                    tr += "<td>" + data[i].created + "</td>";
                    tr += "<td class='action-buttons'>";
                    if(data[i].status == 'running') {
                        tr += "<button disabled class='button is-small is-info' onclick='viewResults(\"" + data[i].task_name + "\")'>";
                    }
                    else {
                        tr += "<button class='button is-small is-info' onclick='viewResults(\"" + data[i].task_name + "\")'>";
                    }
                    tr += "<span class='icon'><i class='fas fa-eye'></i></span>";
                    tr += "<span>Results</span></button>";
                    if(data[i].status == 'running') {
                        tr += "<button disabled class='button is-small is-danger' style='margin-left:10px' onclick='deleteTask(\"" + data[i].task_name + "\")'>";
                    }
                    else {
                        tr += "<button class='button is-small is-danger' style='margin-left:10px' onclick='deleteTask(\"" + data[i].task_name + "\")'>";
                    }
                    tr += "<span class='icon'><i class='fas fa-trash'></i></span>";
                    tr += "<span>Delete</span></button>";
                    tr += "</button>";
                    tr += "</td></tr>";
                    document.getElementById('myTasks').innerHTML += tr;
                }
            }
            
        },
        error: function (error) {
            alert('Error fetching tasks:', error);
        }
    });
});