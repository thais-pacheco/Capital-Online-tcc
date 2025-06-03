import sqlite3

banco = sqlite3.connect('financas.db')

cur = banco.cursor()
#cur.execute("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, email TEXT, senha TEXT)")

#cur.execute(""" INSERT INTO usuarios (id, nome, email, senha) VALUES(1, 'thais', 'thais@gmail.com', '123')""")

cur.execute(""" INSERT INTO usuarios (id, nome, email, senha) VALUES(2, 'amanda', 'amanda@gmail.com', '123')""")

#banco.commit()

res = cur.execute("SELECT * FROM usuarios")
print(cur.fetchall())