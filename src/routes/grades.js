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

export default router; 