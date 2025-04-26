//Importando o express
const express = require('express');

//Importando o express-handlebars
const { engine } = require('express-handlebars');

//Importado o express-fileupload
const fileUpload = require('express-fileupload');

//Importando o File System
const fs = require('fs');

//Rota sql
const mysql = require('mysql2');
const conexao = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '092126',
    database: 'projeto'
})

const app = express();

//Add bootstrap
app.use('/bootstrap', express.static('./node_modules/bootstrap/dist'));

//Add o css
app.use('/css', express.static('./css'));

//Referenciando a pasta imagens para o handlebars
app.use('/img', express.static('./img'));

//Config do express-handlebars
app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');

//Adaptando o express para receber JSON
app.use(express.json());

//Adaptando o express para receber dados de formulário
app.use(express.urlencoded({ extended: false }));

//usando o express-fileupload
app.use(fileUpload());

//Verificando conexão com o B.D
conexao.connect(function (erro) {
    if (erro) throw erro;
    console.log("Conexão com o B.D efetuada com sucesso!");
});

//rota principal
app.get('/', (req, res) => {

    let sql = 'SELECT * FROM produtos';
    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno })
    })
});
// Rota principal contendo a situação
app.get('/:situacao', (req, res) => {

    let sql = 'SELECT * FROM produtos';

    conexao.query(sql, function (erro, retorno) {
        res.render('formulario', { produtos: retorno, situacao: req.params.situacao });
    });
});

app.post('/cadastrar', (req, res) => {
    try {
        // Pegando os dados do formulário
        let nome = req.body.nome;
        let valor = req.body.valor;
        let imagem = req.files.imagem;

        if (nome === '' || valor === '' || isNaN(valor)) {
            res.redirect('/falhaDoCadastro');

        } else {
            // Salvando o arquivo na pasta 'img' com o nome original
            let imagemNome = imagem.name;
            imagem.mv(__dirname + '/img/' + imagemNome, (erro) => {
                if (erro) throw erro;

                // Inserindo os dados no banco de dados
                let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagemNome}')`;
                conexao.query(sql, function (erro, retorno) {
                    if (erro) throw erro;

                    console.log(retorno);
                    res.redirect('/cadastroSucesso');
                });
            });
        }

    } catch (error) {
        console.error("Erro no processo de cadastro:", error);
    }
});

//Rota para deletar o produto
app.get('/deletar/:codigo&:imagem', (req, res) => {
    let sql = `DELETE FROM produtos WHERE codigo = ${req.params.codigo}`;

    conexao.query(sql, function (erro, retorno) {
        if (erro) throw erro;
    })
    fs.unlink(__dirname + '/img/' + req.params.imagem, (err) => {
        console.log("Arquivo deletado com sucesso!");

        res.redirect('/');
    })
});

//Rota para formulário de edição
app.get('/formEditar/:codigo', (req, res) => {
    let sql = `SELECT * FROM produtos WHERE codigo = ${req.params.codigo}`;
    conexao.query(sql, function (erro, retorno) {
        if (erro) throw erro;
        res.render('formEditar', { produto: retorno[0] });
    })

})

//Rota para editar o produto
app.post('/editar', (req, res) => {
    let codigo = req.body.codigo;
    let nome = req.body.nome;
    let valor = req.body.valor;
    let imagemNome = req.body.imagemNome;

    // Validando os dados recebidos
    if (nome === '' || valor === '' || isNaN(valor)) {
        res.redirect('/falhaDaEdicao');
    } else {
        try {
            // Verifica se uma nova imagem foi enviada
            if (req.files && req.files.imagem) {
                let imagem = req.files.imagem;
                let novaImagemNome = imagem.name;

                imagem.mv(__dirname + '/img/' + novaImagemNome, (erro) => {
                    if (erro) {
                        console.error("Erro ao salvar nova imagem:", erro);
                    } else {
                        if (imagemNome && typeof imagemNome === 'string') {
                            fs.unlink(__dirname + '/img/' + imagemNome, (err) => {
                                if (err) console.error("Erro ao deletar imagem antiga:", err);
                            });
                        } else {
                            console.warn("Imagem antiga não encontrada ou inválida:", imagemNome);
                        }

                        let sql = 'UPDATE produtos SET nome = ?, valor = ?, imagem = ? WHERE codigo = ?';
                        conexao.query(sql, [nome, valor, novaImagemNome, codigo], function (erro, retorno) {
                            if (erro) throw erro;
                            res.redirect('/');
                        });
                    }
                });
            } // erro em relação aos dados do formulário
            else {
                let sql = 'UPDATE produtos SET nome = ?, valor = ? WHERE codigo = ?';
                conexao.query(sql, [nome, valor, codigo], function (erro, retorno) {
                    if (erro) {
                        console.error("Erro ao atualizar produto:", erro);
                    }
                    res.redirect('/');
                });
            }
        } catch (error) {
            console.error("Erro no processo de edição:", error);;
        }
    }
});

app.listen(3000, () => {
    console.log('server is running on port 3000');
});
