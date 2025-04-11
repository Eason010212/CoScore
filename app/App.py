from flask import Flask, jsonify, request
from flask import render_template
import sqlite3
import datetime
from Rule import Rule
import json
# multi-threading
import threading

# Create a Flask application instance
app = Flask(__name__)

def init_sqlite_db():

    conn = sqlite3.connect('database.db')
    print("Opened database successfully")

    # table 'data', with columns: name, description, type, data, length, create_time
    conn.execute('CREATE TABLE IF NOT EXISTS data (name TEXT, description TEXT, type TEXT, data TEXT, length TEXT, create_time TEXT)')
    # table 'rules', with columns: name, prompt, description, rule, create_time, modify_time
    conn.execute('CREATE TABLE IF NOT EXISTS rules (name TEXT, prompt TEXT, description TEXT, rule TEXT, create_time TEXT, modify_time TEXT)')
    # table 'tasks', with columns: data_name, rule_name, task_name, status, create_time, executed_time, result
    conn.execute('CREATE TABLE IF NOT EXISTS tasks (data_name TEXT, rule_name TEXT, task_name TEXT, status TEXT, create_time TEXT, executed_time TEXT, result TEXT)')
    conn.commit()
    conn.close()

init_sqlite_db()

@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')

@app.route('/data', methods=['GET'])
def data():
    return render_template('data.html')

@app.route('/rules', methods=['GET'])
def rules():
    return render_template('rules.html')

@app.route('/tasks', methods=['GET'])
def tasks():
    return render_template('tasks.html')

@app.route('/manual', methods=['GET'])
def manual():
    return render_template('manual.html')

@app.route('/settings', methods=['GET'])
def settings():
    return render_template('settings.html')

@app.route('/api/createData', methods=['POST'])
def createData():
    data = request.get_json()
    name = data['name']
    description = data['desc']
    utype = data['type']
    udata = data['data']
    ulength = data['ulength']
    create_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    conn = sqlite3.connect('database.db')
    conn.execute('INSERT INTO data (name, description, type, data, length, create_time) VALUES (?, ?, ?, ?, ?, ?)', (name, description, utype, udata, ulength, create_time))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Dataset created successfully'})

@app.route('/api/getData', methods=['GET'])
def getData():
    conn = sqlite3.connect('database.db')
    cursor = conn.execute('SELECT * FROM data')
    data = []
    for row in cursor:
        data.append({
            'name': row[0],
            'desc': row[1],
            'type': row[2],
            'data': row[3],
            'count': row[4],
            'created': row[5]
        })
    conn.close()
    return jsonify(data)

@app.route('/api/deleteData', methods=['POST'])
def deleteData():
    data = request.get_json()
    name = data['name']

    conn = sqlite3.connect('database.db')
    conn.execute('DELETE FROM data WHERE name = ?', (name,))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Dataset deleted successfully'})

@app.route('/api/getRules', methods=['GET'])
def getRule():
    conn = sqlite3.connect('database.db')
    cursor = conn.execute('SELECT * FROM rules')
    data = []
    for row in cursor:
        data.append({
            'name': row[0],
            'prompt': row[1],
            'desc': row[2],
            'rule': row[3],
            'created': row[4],
            'modified': row[5]
        })
    conn.close()
    return jsonify(data)

@app.route('/api/testRule', methods=['POST'])
def testTask():
    data = request.get_json()
    rule = data['rule']
    answer = data['answer']
    rule = Rule(rule)
    score, debugInfo = rule.calculate(answer)
    # delete calMemory in debugInfo
    del debugInfo['calMemory']
    return jsonify({'score': score, 'debugInfo': debugInfo})

@app.route('/api/saveRule', methods=['POST'])
def saveRule():
    data = request.get_json()
    uname = data['name']
    prompt = data['prompt']
    desc = prompt[0:20] + '...' if len(prompt) > 20 else prompt
    rule = data['rule'].replace('```json', '').replace('```', '').strip()
    # if already have this rule name, modify it with prompt, desc, rule, and modify_time
    conn = sqlite3.connect('database.db')
    cursor = conn.execute('SELECT * FROM rules WHERE name = ?', (uname, ))
    if cursor.fetchone() is not None:
        conn.execute('UPDATE rules SET prompt = ?, description = ?, rule = ?, modify_time = ? WHERE name = ?', (prompt, desc, rule, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), uname))
    else:
        conn.execute('INSERT INTO rules (name, prompt, description, rule, create_time, modify_time) VALUES (?, ?, ?, ?, ?, ?)', (uname, prompt, desc, rule, datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")))
    conn.commit()
    conn.close()
    return jsonify({'message': 'Rule saved successfully'})

@app.route('/api/deleteRule', methods=['POST'])
def deleteRule():
    data = request.get_json()
    name = data['name']

    conn = sqlite3.connect('database.db')
    conn.execute('DELETE FROM rules WHERE name = ?', (name, ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Rule deleted successfully'})

@app.route('/api/getTasks', methods=['GET'])
def getTasks():
    conn = sqlite3.connect('database.db')
    cursor = conn.execute('SELECT * FROM tasks')
    data = []
    for row in cursor:
        data.append({
            'data_name': row[0],
            'rule_name': row[1],
            'task_name': row[2],
            'status': row[3],
            'created': row[4],
            'executed': row[5],
            'result': row[6]
        })
    conn.close()
    return jsonify(data)

@app.route('/api/createTask', methods=['POST'])
def createTask():
    data = request.get_json()
    data_name = data['data_name']
    rule_name = data['rule_name']
    task_name = data['task_name']
    status = 'running'
    create_time = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    executed_time = ''
    result = ''

    conn = sqlite3.connect('database.db')
    conn.execute('INSERT INTO tasks (data_name, rule_name, task_name, status, create_time, executed_time, result) VALUES (?, ?, ?, ?, ?, ?, ?)', (data_name, rule_name, task_name, status, create_time, executed_time, result))
    conn.commit()
    conn.close()
    # run the task in a new thread
    thread = threading.Thread(target=runTask, args=(data_name, rule_name, task_name))
    thread.start()
    return jsonify({'message': 'Task created successfully'})

@app.route('/api/deleteTask', methods=['POST'])
def deleteTask():
    data = request.get_json()
    task_name = data['task_name']
    conn = sqlite3.connect('database.db')
    conn.execute('DELETE FROM tasks WHERE task_name = ?', (task_name, ))
    conn.commit()
    conn.close()

    return jsonify({'message': 'Task deleted successfully'})

def runTask(data_name, rule_name, task_name):
    try:
        print('Running task: ' + task_name)
        conn = sqlite3.connect('database.db')
        cursor = conn.execute('SELECT * FROM data WHERE name = ?', (data_name, ))
        data = cursor.fetchone()
        if data is None:
            return 'Data not found'
        data = {
            'name': data[0],
            'desc': data[1],
            'type': data[2],
            'data': data[3].split('\n'),
            'count': data[4],
            'created': data[5]
        }
        cursor = conn.execute('SELECT * FROM rules WHERE name = ?', (rule_name, ))
        rule = cursor.fetchone()
        print(rule[3])
        rule = {
            'name': rule[0],
            'prompt': rule[1],
            'desc': rule[2],
            'rule': json.loads(rule[3]),
            'created': rule[4],
            'modified': rule[5]
        }

        # run the task
        ruleObj = Rule(rule['rule'])
        allData = []
        for i in range(1, int(data['count'])):
            allData.append(ruleObj.calculate(data['data'][i].split(',')[0].split('-')))
        allScore = []
        allLog = []
        for i in range(len(allData)):
            score, debugInfo = ruleObj.calculate(allData[i])
            del debugInfo['calMemory']
            allScore.append(score)
            allLog.append(debugInfo)
        # update the task status
        myResult = {
            'scores': allScore,
            'logs': allLog
        }
        conn.execute('UPDATE tasks SET status = ?, executed_time = ?, result = ? WHERE data_name = ? AND rule_name = ? AND task_name = ?', ('completed', datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), json.dumps(myResult), data_name, rule_name, task_name))
        conn.commit()
        conn.close()
        print('Task finished: ' + task_name)
        return 'Task finished'
    except Exception as e:
        import traceback
        traceback.print_exc()
        conn.execute('UPDATE tasks SET status = ?, executed_time = ?, result = ? WHERE data_name = ? AND rule_name = ? AND task_name = ?', ('failed', datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"), str(e), data_name, rule_name, task_name))
        conn.commit()
        conn.close()
        print('Task failed: ' + task_name)
        return 'Task failed'



# if have 'running' tasks, run them
def runAllTasks():
    conn = sqlite3.connect('database.db')
    cursor = conn.execute('SELECT * FROM tasks WHERE status = ?', ('running', ))
    for row in cursor:
        data_name = row[0]
        rule_name = row[1]
        task_name = row[2]
        thread = threading.Thread(target=runTask, args=(data_name, rule_name, task_name))
        thread.start()
    conn.close()
runAllTasks()

app.run(debug=True, port=5000)
