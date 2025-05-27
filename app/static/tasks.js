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
    if (allTasks.includes(name)) {
        alert('Task name already exists, please choose another one');
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
        success: function(response) {
            location.reload();
        },
        error: function(error) {
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
        document.getElementById('resultsStatus').textContent = 'Completed';
        document.getElementById('resultsStatus').className = 'tag is-success';
        document.getElementById('resultsError').style.display = 'none';
        document.getElementById('resultsTable').style.display = 'block';
        document.getElementById('stat').style.display = 'block';
        document.getElementById('completeTime').textContent = allTasksDict[taskId].executed;
        var result = JSON.parse(allTasksDict[taskId].result)
        var scores = result['scores']
        var avgScore = 0
        for (var i = 0; i < scores.length; i++) {
            avgScore += scores[i]
        }
        avgScore = avgScore / scores.length
        var maxScore = Math.max(...scores)
        var minScore = Math.min(...scores)
        document.getElementById('myAvg').textContent = avgScore.toFixed(2)
        document.getElementById('myMax').textContent = maxScore.toFixed(2)
        document.getElementById('myMin').textContent = minScore.toFixed(2)
        $.ajax({
            url: '/api/getDataByName',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                name: allTasksDict[taskId].data_name
            }),
            success: function(response) {
                var stdResults = []
                var oriData = response.data.split('\n')
                var csvData = 'text,score'
                for (var i = 1; i < oriData.length; i++) {
                    var text = oriData[i].split(',')[0]
                    if (response.type == 'labeled') {
                        stdResults.push(parseInt(oriData[i].split(',')[1]))
                    }
                    var score = scores[i - 1]
                    csvData += '\n' + text + ',' + score
                }
                $('#downloadCSV').attr('href', 'data:text/csv;charset=utf-8, ' + encodeURIComponent(csvData))
                document.getElementById('fig').style.display = 'block';
                // #fig-left 放scores的频数分布直方图
                // #fig-right 放scores和stdResults的热力图
                console.log(scores)
                var myChart = echarts.init(document.getElementById('fig-left'));
                var options = {
                    title: {
                        text: 'Scores Distribution',
                        left: 'center'
                    },
                    tooltip: {},
                    xAxis: {
                        type: 'category',
                        data: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                        name: 'Frequency',
                        type: 'bar',
                        data: Array.from({ length: scores.length }, (_, i) => scores.filter(x => Math.round(x) === i).length)
                    }]
                };
                // 图表无边距
                options.grid = {
                    left: '3%',
                    right: '4%',
                    bottom: '3%',
                    containLabel: true
                };
                myChart.setOption(options);
                // #fig-right 放scores和stdResults的热力图
                if (response.type == 'labeled') {
                    var myChart = echarts.init(document.getElementById('fig-right'));

                    // 准备数据 - 格式为[[y轴索引, x轴索引, 值], ...]
                    const scoreCategories = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
                    const resultCategories = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

                    // 创建映射表
                    const scoreIndexMap = new Map(scoreCategories.map((v, i) => [v, i]));
                    const resultIndexMap = new Map(resultCategories.map((v, i) => [v, i]));

                    // 统计每个组合的出现次数
                    const countMap = {};
                    scores.forEach((score, i) => {
                        const result = Math.round(stdResults[i]);
                        const key = `${Math.round(score)}-${result}`;
                        countMap[key] = (countMap[key] || 0) + 1;
                    });

                    // 转换为热力图数据格式
                    const heatmapData = [];
                    scoreCategories.forEach(score => {
                        resultCategories.forEach(result => {
                            const key = `${score}-${result}`;
                            if (countMap[key]) {
                                heatmapData.push([
                                    resultIndexMap.get(result), // y轴索引
                                    scoreIndexMap.get(score), // x轴索引
                                    countMap[key] // 值
                                ]);
                            }
                        });
                    });

                    function calculateQWK(raterA, raterB) {
                        // 获取分类类别
                        const categories = new Set([...raterA, ...raterB]);
                        const categoryList = Array.from(categories).sort((a, b) => a - b);
                        const numCategories = categoryList.length;

                        // 构建混淆矩阵
                        const confusionMatrix = Array.from({ length: numCategories }, () => Array(numCategories).fill(0));
                        for (let i = 0; i < raterA.length; i++) {
                            const row = categoryList.indexOf(raterA[i]);
                            const col = categoryList.indexOf(raterB[i]);
                            confusionMatrix[row][col]++;
                        }

                        // 构建权重矩阵
                        const weightMatrix = Array.from({ length: numCategories }, () => Array(numCategories).fill(0));
                        for (let i = 0; i < numCategories; i++) {
                            for (let j = 0; j < numCategories; j++) {
                                weightMatrix[i][j] = (i - j) ** 2;
                            }
                        }

                        // 计算边缘分布
                        const rowSums = confusionMatrix.map(row => row.reduce((a, b) => a + b, 0));
                        const colSums = confusionMatrix[0].map((_, colIndex) => confusionMatrix.reduce((a, row) => a + row[colIndex], 0));
                        const totalSum = rowSums.reduce((a, b) => a + b, 0);

                        // 计算观察一致性 P_o
                        let Po = 0;
                        for (let i = 0; i < numCategories; i++) {
                            for (let j = 0; j < numCategories; j++) {
                                Po += confusionMatrix[i][j] * weightMatrix[i][j];
                            }
                        }
                        Po /= totalSum;

                        // 计算期望一致性 P_e
                        let Pe = 0;
                        for (let i = 0; i < numCategories; i++) {
                            for (let j = 0; j < numCategories; j++) {
                                Pe += (rowSums[i] * colSums[j] / totalSum) * weightMatrix[i][j];
                            }
                        }
                        Pe /= totalSum;

                        // 计算QWK
                        const QWK = 1 - (Po / Pe);

                        return QWK;
                    }
                    // 计算QWK
                    const qwk = calculateQWK(scores.map(Math.round), stdResults.map(Math.round));
                    // 在图表上显示QWK


                    var options = {
                        title: {
                            text: 'QWK: ' + qwk.toFixed(3),
                            left: 'center'
                        },
                        grid: {
                            left: '3%',
                            right: '4%',
                            bottom: '3%',
                            containLabel: true
                        },
                        xAxis: {
                            type: 'category',
                            data: scoreCategories,
                            splitArea: {
                                show: true
                            },
                        },
                        yAxis: {
                            type: 'category',
                            data: resultCategories,
                            splitArea: {
                                show: true
                            },
                        },
                        visualMap: {
                            min: 0,
                            max: Math.max(...Object.values(countMap), 10), // 至少显示0-10的范围
                            calculable: true,
                            orient: 'horizontal',
                            left: 'center',
                            bottom: '5%',
                            inRange: {
                                color: ['#313695', '#4575b4', '#74add1', '#abd9e9', '#e0f3f8', '#ffffbf', '#fee090', '#fdae61', '#f46d43', '#d73027', '#a50026']
                            }
                        },
                        series: [{
                            name: 'Frequency',
                            type: 'heatmap',
                            data: heatmapData,
                            label: {
                                show: true,
                                formatter: function(params) {
                                    return params.data[2]; // 显示计数值
                                }
                            },
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            },
                            itemStyle: {
                                borderWidth: 1,
                                borderColor: '#fff'
                            }
                        }]
                    };

                    myChart.setOption(options);
                }
            },
            error: function(error) {
                alert('Error fetching data:', error);
            }
        })
    } else if (allTasksDict[taskId].status == 'failed') {
        document.getElementById('resultsStatus').textContent = 'Failed';
        document.getElementById('resultsStatus').className = 'tag is-danger';
        document.getElementById('resultsError').style.display = 'block';
        document.getElementById('resultsTable').style.display = 'none';
        document.getElementById('fig').style.display = 'none';
        document.getElementById('stat').style.display = 'none';
        document.getElementById('errorText').textContent = allTasksDict[taskId].result;
    }
    openNewResultModal();
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        $.ajax({
            url: '/api/deleteTask',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                task_name: taskId
            }),
            success: function(response) {
                location.reload();
            },
            error: function(error) {
                alert('Error deleting task:', error);
            }
        });
    }
}


// Check if there are any tasks (for empty state)
window.addEventListener('DOMContentLoaded', function() {
    $.ajax({
        url: '/api/getData',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                var datasetName = data[i].name + ' (' + data[i].type + ', ' + data[i].count + ' items)';
                document.getElementById('taskDataset').innerHTML += `<option value="${data[i].name}">${datasetName}</option>`;
            }
        },
        error: function(error) {
            alert('Error fetching datasets:', error);
        }
    });
    $.ajax({
        url: '/api/getRules',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                document.getElementById('taskRule').innerHTML += `<option value="${data[i].name}">${data[i].name}</option>`;
            }
        },
        error: function(error) {
            alert('Error fetching rules:', error);
        }
    });
    allTasks = []
    allTasksDict = {}
    $.ajax({
        url: '/api/getTasks',
        type: 'GET',
        dataType: 'json',
        success: function(data) {
            if (data.length === 0) {
                document.getElementById('emptyTasks').style.display = 'block';
                document.getElementById('myTaskTable').style.display = 'none';
            } else {
                document.getElementById('emptyTasks').style.display = 'none';
                document.getElementById('myTaskTable').style.display = 'block';
                for (var i = 0; i < data.length; i++) {
                    allTasks.push(data[i].task_name)
                    allTasksDict[data[i].task_name] = data[i]
                    var tr = "<tr><td>" + data[i].task_name + "</td><td>" + data[i].data_name + "</td><td>" + data[i].rule_name + "</td>";
                    if (data[i].status == 'completed') {
                        tr += "<td><span class='tag status-tag status-completed'>Completed</span></td>";
                    } else if (data[i].status == 'running') {
                        tr += "<td><span class='tag status-tag status-running'>Running</span></td>";
                    } else if (data[i].status == 'failed') {
                        tr += "<td><span class='tag status-tag status-failed'>Failed</span></td>";
                    }
                    // if not running, view results; if running, view results (disabled)
                    tr += "<td>" + data[i].created + "</td>";
                    tr += "<td class='action-buttons'>";
                    if (data[i].status == 'running') {
                        tr += "<button disabled class='button is-small is-info' onclick='viewResults(\"" + data[i].task_name + "\")'>";
                    } else {
                        tr += "<button class='button is-small is-info' onclick='viewResults(\"" + data[i].task_name + "\")'>";
                    }
                    tr += "<span class='icon'><i class='fas fa-eye'></i></span>";
                    tr += "<span>Results</span></button>";
                    if (data[i].status == 'running') {
                        tr += "<button disabled class='button is-small is-danger' style='margin-left:10px' onclick='deleteTask(\"" + data[i].task_name + "\")'>";
                    } else {
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
        error: function(error) {
            alert('Error fetching tasks:', error);
        }
    });
});