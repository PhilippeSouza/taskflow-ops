// Servidor estático mínimo, só para os testes (serve a pasta raiz do projeto)
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', '..');
const tipos = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

http
  .createServer((req, res) => {
    let rota = decodeURIComponent(req.url.split('?')[0]);
    if (rota === '/') rota = '/index.html';
    const arquivo = path.join(root, rota);
    if (!arquivo.startsWith(root)) {
      res.writeHead(403);
      return res.end();
    }
    fs.readFile(arquivo, (erro, dados) => {
      if (erro) {
        res.writeHead(404);
        return res.end('nao encontrado');
      }
      res.writeHead(200, { 'Content-Type': tipos[path.extname(arquivo)] || 'text/plain' });
      res.end(dados);
    });
  })
  .listen(8765, '127.0.0.1');
