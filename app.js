//Importando o express
const express = require('express');

//Importando o express-handlebars
const { engine } = require('express-handlebars');

//Importado o express-fileupload
const fileUpload = require('express-fileupload');

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

//Rota principal / listagem de produtos
app.get('/', (req, res) => {
    
    let sql = 'SELECT * FROM produtos';
    conexao.query(sql, function (erro, retorno){
        res.render('formulario', {produtos:retorno})
    })
});
//Rota para cadastrar o produto
app.post('/cadastrar', (req, res) => {
    // Pegando os dados do formulário
    let nome = req.body.nome;
    let valor = req.body.valor;
    let imagem = req.files.imagem;

    // Salvando o arquivo na pasta 'img' com o nome original
    let imagemNome = imagem.name;
    imagem.mv(__dirname + '/img/' + imagemNome, (erro) => {
        if (erro) throw erro;

        // Inserindo os dados no banco de dados
        let sql = `INSERT INTO produtos (nome, valor, imagem) VALUES ('${nome}', ${valor}, '${imagemNome}')`;
        conexao.query(sql, function (erro, retorno) {
            if (erro) throw erro;

            console.log(retorno);
            res.redirect('/');
        });
    });
});


//Rota para deletar o produto
app.get('/deletar/:codigo&:imagem', (req, res) => {
    console.log(req.params.codigo);
    console.log(req.params.imagem);
    res.end();

});

//Iniciando o servidor
app.listen(3000, () => {
    console.log('server is running on port 3000');
});