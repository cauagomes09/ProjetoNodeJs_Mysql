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

//Rota principal
app.get('/', (req, res) => {
    res.render('formulario')
});
//Rota para cadastrar o produto
app.post('/cadastrar', (req, res) => {
    console.log(req.body);
    console.log(req.files.imagem.name);

    req.files.imagem.mv(__dirname + '/img/' + req.files.imagem.name)
    res.end();
})
//Iniciando o servidor
app.listen(3000, () => {
    console.log('server is running on port 3000');
});