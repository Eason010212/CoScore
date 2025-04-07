from flask import Flask, jsonify, request
from flask import render_template
import sqlite3
import datetime

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

app.run(debug=True, port=5000)
