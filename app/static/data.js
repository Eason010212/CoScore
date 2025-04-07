// Modal functions
function openNewDatasetModal() {
    document.getElementById('newDatasetModal').classList.add('is-active');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('is-active');
}


function viewDataset(name) {
    document.getElementById('viewDatasetTitle').textContent = `Dataset: ${name}`;
    document.getElementById('viewDatasetModal').classList.add('is-active');
    // clear #viewDatasetHeaders
    document.getElementById('viewDatasetHeaders').innerHTML = '';
    // clear #viewDatasetContent
    document.getElementById('viewDatasetContent').innerHTML = '';
    var data = allDataDetail[name].data
        // update header
    var dataLines = data.split('\n');
    var dataHeaders = dataLines[0].split(',');
    for (var i = 0; i < dataHeaders.length; i = i + 1) {
        $('#viewDatasetHeaders').append(`<th>${dataHeaders[i]}</th>`);
    }
    // update content
    for (var i = 1; i < dataLines.length; i = i + 1) {
        var dataLine = dataLines[i].split(',');
        $('#viewDatasetContent').append(`<tr>`);
        for (var j = 0; j < dataLine.length; j = j + 1) {
            $('#viewDatasetContent').append(`<td>${dataLine[j]}</td>`);
        }
        $('#viewDatasetContent').append(`</tr>`);
    }
}


function confirmDelete(name) {
    document.getElementById('datasetToDelete').textContent = name;
    document.getElementById('deleteConfirmModal').classList.add('is-active');
}

function deleteDataset() {
    const name = document.getElementById('datasetToDelete').textContent;
    $.ajax({
        url: '/api/deleteData',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ name: name }),
        success: function(response) {
            closeModal('deleteConfirmModal');
            location.reload();
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
    closeModal('deleteConfirmModal');
}

function createDataset() {
    const name = document.getElementById('datasetName').value;
    const desc = document.getElementById('datasetDesc').value;
    const type = document.getElementById('datasetType').value;
    const csvData = document.getElementById('csvData').value;

    if (!name) {
        alert('Please enter a dataset name');
        return;
    }

    for (var i = 0; i < allData.length; i = i + 1) {
        if (name == allData[i]) {
            alert('Dataset name already exists');
            return;
        }
    }

    if (!desc) {
        alert('Please enter a dataset description');
        return;
    }

    if (!csvData) {
        alert('Please either paste CSV data or upload a file');
        return;
    }
    var length = 0
    if (type == "labeled") {
        // 检验csvData是否符合格式, 有且仅有text和score两列
        const lines = csvData.split('\n');
        length = lines.length - 1
        if (lines.length < 2) {
            alert('Please enter at least two lines of data');
            return;
        }
        const headers = lines[0].split(',');
        if (headers.length != 2) {
            alert('Please enter two columns of data (text and score)');
            return;
        }
        if (headers[0] != 'text' || headers[1] != 'score') {
            alert('Please enter two columns of data (text and score)');
            return;
        }
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].split(',');
            if (line.length != 2) {
                alert('Please enter two columns of data (text and score)');
                return;
            }
            if (isNaN(line[1])) {
                alert('Please enter a number for the score');
                return;
            }
        }
    } else if (type == "unlabeled") {
        // 检验csvData是否符合格式, 有且仅有text列
        const lines = csvData.split('\n');
        length = lines.length - 1
        if (lines.length < 2) {
            alert('Please enter at least two lines of data');
            return;
        }
        const headers = lines[0].split(',');
        if (headers.length != 1) {
            alert('Please enter one column of data (text)');
            return;
        }
        if (headers[0] != 'text') {
            alert('Please enter one column of data (text)');
            return;
        }
    }

    $.ajax({
        url: '/api/createData',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
            name: name,
            desc: desc,
            type: type,
            data: csvData,
            ulength: length
        }),
        success: function(response) {
            closeModal('newDatasetModal');
            location.reload();
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
}

function exportDataset() {
    // generate and download a CSV file of the current dataset
    const name = document.getElementById('viewDatasetTitle').textContent.split(': ')[1];
    const data = allDataDetail[name].data;
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    // download the file
    a.href = url;
    a.download = name + '.csv';
    document.body.appendChild(a);
    a.click();
}

// Handle file input display
document.getElementById('csvFile').addEventListener('change', function(e) {
    const fileName = e.target.files[0] ? e.target.files[0].name : 'No file selected';
    document.getElementById('fileName').textContent = fileName;

    if (e.target.files[0]) {
        // Read the file and populate the textarea
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('csvData').value = event.target.result;
        };
        reader.readAsText(e.target.files[0]);
    }
});
allData = []
allDataDetail = {}
    // Check if there are any datasets (for empty state)
window.addEventListener('DOMContentLoaded', function() {
    $.ajax({
        url: '/api/getData',
        type: 'GET',
        contentType: 'application/json',
        success: function(response) {
            if (response.length === 0) {
                document.getElementById('emptyState').style.display = 'block';
            } else {
                response.forEach(function(dataset) {
                    allData.push(dataset.name)
                    allDataDetail[dataset.name] = dataset
                    const datasetCard = `
                        <div class="column is-one-third">
                            <div class="card dataset-card">
                                <div class="card-content">
                                    <div class="media">
                                        <div class="media-content">
                                            <p class="title is-4">${dataset.name}</p>
                                            <p class="subtitle is-6">
                                                <span class="tag is-light">${dataset.count} items</span>
                                                <span class="tag tag-${dataset.type}">${dataset.type=="labeled" ? 'Labeled' : 'Unlabeled'}</span>
                                            </p>
                                        </div>
                                    </div>
                                    <div class="content">
                                        <p>${dataset.desc}</p>
                                        <time datetime="${dataset.created}">Created: ${dataset.created}</time>
                                    </div>
                                </div>
                                <footer class="card-footer">
                                    <a href="#" class="card-footer-item" onclick="viewDataset('${dataset.name}')">View</a>
                                    
                                    <a href="#" class="card-footer-item" onclick="confirmDelete('${dataset.name}')">Delete</a>
                                </footer>
                            </div>
                        </div>
                    `;
                    document.getElementById('datasetCards').innerHTML += datasetCard;
                });
            }
        },
        error: function(xhr, status, error) {
            alert('An error occurred: ' + error);
        }
    });
});