from flask import Flask, jsonify, request
from flask import render_template

# Create a Flask application instance
app = Flask(__name__)

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


app.run(debug=True, port=5000)
