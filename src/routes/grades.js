import {promises} from "fs";
import express from "express";

const router = express.Router();
const { readFile, writeFile} = promises

//Exercicio 1
//Crie um endpoint para criar uma grade. Este endpoint deverá receber como parâmetros os campos student, subject, type e value conforme descritos acima. Essa grade deverá ser salva no arquivo json grades.json, e deverá ter um id único associado. No campo timestamp deverá ser salvo a data e hora do momento da inserção. O endpoint deverá retornar o objeto da grade que foi criada. A API deverá garantir o incremento automático desse identificador, de forma que ele não se repita entre os registros. Dentro do arquivo grades.json que foi fornecido para utilização no desafio, o campo nextId já está com um valor definido. Após a inserção é preciso que esse nextId seja incrementado e salvo no próprio arquivo, de forma que na próxima inserção ele possa ser utilizado.
router.post("/", async (req, res) => {
    let dados = req.body;
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        dados = { id: json.nextId++, ...dados, timestamp: new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString() }
        json.grades.push(dados);
        await writeFile(global.fileName, JSON.stringify(json, null, 4));
        res.send(dados);
        logger.info(`POST /grades - ${ JSON.stringify(dados, null, 4)}`)
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`POST /grades - ${ error.message }`)
    }
});

//Exercicio 2
//Crie um endpoint para atualizar uma grade. Esse endpoint deverá receber como parâmetros o id da grade a ser alterada e os campos student, subject, type e value. O endpoint deverá validar se a grade informada existe, caso não exista deverá retornar um erro. Caso exista, o endpoint deverá atualizar as informações recebidas por parâmetros no registro, e realizar sua atualização com os novos dados alterados no arquivo grades.json.
router.put("/", async (req, res) => {
    let dados = req.body;
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const index = json.grades.findIndex(x => x.id === parseInt(dados.id, 10));
        if (index >= 0) {
            json.grades[index].student = dados.student;
            json.grades[index].subject = dados.subject;
            json.grades[index].type = dados.type;
            json.grades[index].value = dados.value;
            json.grades[index].timestamp = new Date(new Date().toString().split('GMT')[0] + ' UTC').toISOString();
            await writeFile(global.fileName, JSON.stringify(json, null, 4));
            res.send("Dados atualizados com sucesso!");
            logger.info(`PUT /grades - ${ JSON.stringify(dados, null, 4)}`)
        } else {
            throw new Error("Dados não encontrados para serem atualizados!");
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`PUT /grades - ${ error.message }`)
    }
});


//Exercicio 3
//Crie um endpoint para excluir uma grade. Esse endpoint deverá receber como parâmetro o id da grade e realizar sua exclusão do arquivo grades.json.
router.delete("/:id", async (req, res) => {
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const index = json.grades.findIndex(x => x.id === parseInt(req.params.id, 10));
        if (index >=0 ) {
            const grade = json.grades.filter(x => x.id !== parseInt(req.params.id, 10));
            json.grades = grade;
            await writeFile(global.fileName, JSON.stringify(json, null, 4));
            res.send("Dados excluídos com sucesso!");
            logger.info(`DELETE /grades - Id: ${ req.params.id }`)
        } else {
            throw new Error("Dados não encontrados para serem excluídos!");
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`DELETE /grades - ${ error.message }`)
    }
});

//Exercicio 4
//Crie um endpoint para consultar uma grade em específico. Esse endpoint deverá receber como parâmetro o id da grade e retornar suas informações.
router.get("/:id", async (req, res) => {
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const grade = json.grades.find(x => x.id === parseInt(req.params.id, 10));
        if (grade) {
            res.send(grade);
            logger.info(`GET /grades - Id: ${ req.params.id }`)
        } else {
            throw new Error("Dados não encontrados!");
        }
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`GET /grades - ${ error.message }`)
    }
});


//Exercicio 5
//Crie um endpoint para consultar a nota total de um aluno em uma disciplina. O endpoint deverá receber como parâmetro o student e o subject, e realizar a soma de todas as notas de atividades correspondentes àquele subject, para aquele student. O endpoint deverá retornar a soma da propriedade value dos registros encontrados.
router.get("/consultar/nota", async (req, res) => {
    let dados = req.body;
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const grades = json.grades.filter(x => x.student == dados.student && x.subject == dados.subject);    
        const somaValores = grades.reduce(function (sum, dado) {
            return sum + dado.value;
        }, 0);
        res.send(`Soma é igual:  ${somaValores}`);
        logger.info(`GET /grades Consultar Notas - Soma é igual:  ${somaValores}`)
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`GET /grades Consultar Notas - ${ error.message }`)
    }
});

//Exercicio 6
//Crie um endpoint para consultar a média das grades de determinado subject e type. O endpoint deverá receber como parâmetro um subject e um type, e retornar a média. A média é calculada somando o registro value de todos os registros que possuem o subject e type informados, dividindo pelo total de registros que possuem este mesmo subject e type.
router.get("/consultar/media", async (req, res) => {
    let dados = req.body;
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const grades = json.grades.filter(x => x.subject == dados.subject && x.type == dados.type);    
        const mediaValores = grades.reduce(function (sum, dado) {
            return sum + dado.value;
        }, 0) / grades.length;

        res.send(`Média é igual:  ${mediaValores}`);
        logger.info(`GET /grades Consultar Média - Média é igual:  ${mediaValores}`)
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`GET /grades Consultar Média - ${ error.message }`)
    }
});

//Exercicio 7
// Crie um endpoint para retornar as três melhores grades de acordo com determinado subject e type. O endpoint deve receber como parâmetro um subject e um type, e retornar um array com os três registros de maior value daquele subject e type. A ordem deve ser do maior para o menor
router.get("/consultar/registros", async (req, res) => {
    let dados = req.body;
    try {
        let data = await readFile(global.fileName, "utf-8");
        let json = JSON.parse(data);
        const grades = json.grades.filter(x => x.subject == dados.subject && x.type == dados.type);    
        grades.sort(function (a, b) {  return b.value - a.value  });
        const retorno = grades.slice(0, 3);
        res.send(retorno);
        logger.info(`GET /grades Consultar 3 maiores valores de registros -   ${retorno}`)
    } catch (error) {
        res.status(400).send({ error: error.message });
        logger.error(`GET /grades Consultar 3 maiores valores de registros - ${ error.message }`)
    }
});


export default router; 