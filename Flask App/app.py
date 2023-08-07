from flask import Flask, request, render_template, jsonify
import RAG_model, db, sqlite3

def create_app():
    app = Flask(__name__, template_folder="templates")
    db.init_app(app)
    return app

app = create_app()
app.config.update(
    DATABASE = 'sqldb.db',
    TEMPLATES_AUTO_RELOAD = True
)

def page_not_found(e):
  return render_template('404.html'), 404

app.register_error_handler(404, page_not_found)

@app.route('/', methods = ['POST', 'GET', 'DELETE'])
def index():
    con = sqlite3.connect('sqldb.db')
    cur = con.cursor()
    curr_chat_id = 0
    res = cur.execute("SELECT chat_id FROM chat ORDER BY chat_id DESC LIMIT 1")
    row = res.fetchone()
    if row is None:
        curr_chat_id = 1
    else:
        curr_chat_id = row[0] + 1
    con.close()
    dialog = ""
    if request.method == 'POST':
        user_input = request.get_json()
        if dialog != "":
            dialog += "\n"
        dialog += "Human: " + user_input['user_dialog']
        res = {}
        output = RAG_model.generate(dialog)
        dialog += "\nAI: " + output
        res['output'] = output
        con = sqlite3.connect('sqldb.db')
        cur = con.cursor()
        cur.execute("INSERT INTO chat (author_id, chatbot, chat_id, query, response) values (?, ?, ?, ?, ?)", (0, "RAG" , curr_chat_id, user_input['user_dialog'], output))
        con.commit()
        con.close()
        return jsonify(res), 200
    if request.method == 'DELETE':
        dialog = ""
        curr_chat_id += 1
    return render_template('index.html')

@app.route('/info')
def info():
    return render_template('info.html')

if __name__ == '__main__':
    app.run()