from flask import Flask, jsonify, request

app = Flask (__name__)

@app.route('/')
def home():
    return '<h1>Welcome</h1>'

if __name__ == '__main__':
    app.run(debug=True)