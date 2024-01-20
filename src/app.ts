// recursos/modulos necessarios.
import express from "express";
import oracledb from 'oracledb';
import cors from "cors";
// aqui vamos importar nossos tipos para organizar melhor (estao em arquivos .ts separados)
import { Aeronave } from "./aeronaves";
import { Aeroporto } from "./aeroporto";
import { Trecho } from "./trecho";
import { Voo } from "./voo";
import { Passagem } from "./passagem";
import { CustomResponse } from "./customResponse";
import { rowsToAssentoVoo, rowsToVooTrecho, rowsToPreco } from "./Conversores";

// validações
import { aeronaveValida  } from "./validacoes";
import { aeroportoValida } from "./validacoes";
import { trechoValida } from "./validacoes";
import { vooValida } from "./validacoes";
import { passagemValida } from "./validacoes";
import { assentoValida } from "./validacoes";
import { mapaAssentoValida } from "./validacoes";


// constante de conexão do oracle
import { oraConnAttribs } from "./OracleConnAtribs";
import { Assento } from "./assento";
import { buscaVoo } from "./buscaVoo";
import { MapaAssento } from "./mapa_assento";

//muda o formato para conseguir reeceber as respostas em JSON
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;

//definindo a porta 300 para rodar o servidor
const app = express();
const port = 3000;

// preparar o servidor para dialogar no padrao JSON 
app.use(express.json());
app.use(cors());


// servicos de backend
app.put("/cadastrarAeronave", async(req, res)=>{

  //obejto de resposta
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
   //definindo o objeto usado 
  const aeronave: Aeronave = req.body as Aeronave;
  console.log(aeronave);

  //validacao
  let [valida, mensagem] = aeronaveValida(aeronave);
  if(!valida) {
    // devolve mensagem de erro e encerra o servico
    cr.message = mensagem;
    res.send(cr);
  } else {
    //variavel da conexao
    let connection;
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs);
      //insert na tabela AERONAVES
      const cmdInsertAero = `INSERT INTO AERONAVES (CODIGO, MARCA, MODELO, NUM_ASSENTO, REGISTRO, ANO_FABRICACAO) VALUES (:1, :2, :3, :4, :5, :6)`;
      const dados = [aeronave.codigo, aeronave.marca, aeronave.modelo, aeronave.qtdeAssentos, aeronave.registro, aeronave.anoFabricacao];

      //executa o script assima
      let resInsert = await connection.execute(cmdInsertAero, dados);
      
      //commit no banco
      await connection.commit();
    
      // obter a informação de quantas linhas foram inseridas. 
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined &&  rowsInserted === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Aeronave inserida.";
      }//obtendo algum erro e retornado-o
    }catch(e){
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      //fechar a conexao.
      if(connection!== undefined){
        await connection.close();
      }
      //enviando a resposta
      res.send(cr);  
    }
  }
});

app.delete("/excluirAeronave", async(req,res)=>{
  //recebendo o codigo da aeronave para exclui-la
  const codigo = req.body.codigo as number;

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  //variavel da conexao
  let connection;
  try{
    //faz um delete na tabela aeronaves
    connection = await oracledb.getConnection(oraConnAttribs);
    const cmdDeleteAero = `DELETE AERONAVES WHERE codigo = :1`
    const dados = [codigo];

  //executa o script assima
    let resDelete = await connection.execute(cmdDeleteAero, dados);
    
    // commit no banco 
    await connection.commit();
    
    // obter a informação de quantas linhas foram inseridas. 
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Aeronave excluída.";
    }else{
      //mensagem de erro
      cr.message = "Aeronave não excluída. Verifique se o código informado está correto.";
    }
  }catch(e){
    //recebe possiveis erros
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha a conexao
    if(connection!== undefined){
      await connection.close();
    }
    //enviando a resposta
    res.send(cr);  
  }
});

app.post("/editarAeronave", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //recebendo o objeto AERONAVES
  const aeronave: Aeronave = req.body as Aeronave;
  console.log(aeronave)
  // validacao
  let [valida, mensagem] = aeronaveValida(aeronave);
  if(!valida) {
    //devolve a resposta se tiver um erro
    cr.message = mensagem;
    res.send(cr);
  } else {
    //variavel para conexao
    let connection;
    // continua com a conexao 
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs);

      //faz o update da aeronave pelo codigo dela
      const cmdUpdateAero = `UPDATE AERONAVES SET MARCA = :1, MODELO = :2, NUM_ASSENTO = :3, REGISTRO = :4, ANO_FABRICACAO = :5 WHERE CODIGO = :6`;
      const dados = [aeronave.marca, aeronave.modelo, aeronave.qtdeAssentos, aeronave.registro, aeronave.anoFabricacao, aeronave.codigo];

      //executa o script acima
      let resUpdate = await connection.execute(cmdUpdateAero, dados);
        
      //commit para o banco
      await connection.commit();
      
      // obter a informação de quantas linhas foram inseridas. 
      const rowsUpdated = resUpdate.rowsAffected
      if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Aeronave editada.";
      }else{
        //mensagem do erro 
        cr.message = "Aeronave não editada. Verifique se o código informado está correto.";
        }
      }catch(e){
        //caçando possiveis erros
        if(e instanceof Error){
          cr.message = e.message;
          console.log(e.message);
        }else{
          cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
      }finally {
        //fechar a conexao
        if(connection !== undefined){
          await connection.close();
        }
        //enviando a resposta
        res.send(cr);  
      }
  }
});

app.put("/cadastrarAeroporto", async(req, res)=>{

  //objeto de resposta
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //chamando o objeto AEROPORTO
  const aeroporto: Aeroporto = req.body as Aeroporto;
  console.log(aeroporto);

  //validacao
  let [valida, mensagem] = aeroportoValida(aeroporto);
  if(!valida) {
    //devolve com uma resposta se tiver algum erro
    cr.message = mensagem;
    res.send(cr);
  } else {
    //variavel de conexao
    let connection;
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs);
      //inserir na tabela AEROPORTOS
      const cmdInsertAeroporto = `INSERT INTO AEROPORTOS (COD_AEROPORTO, NOME, SIGLA) VALUES ( :1, :2, :3)`;
      const dados = [aeroporto.codigo, aeroporto.nomeAero, aeroporto.sigla];

      //executa o script acima
      let resInsert = await connection.execute(cmdInsertAeroporto, dados);
      
      //commit para o banco.
      await connection.commit();
    
      // obter a informação de quantas linhas foram inseridas. 
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined && rowsInserted === 1) {
        //se tudo estiver certo mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Aeroporto inserido.";
      }
    }catch(e){
      //caçando algum erro
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //caso encontre retorna essa mensagem
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      //fechar a conexao.
      if(connection!== undefined){
        await connection.close();
      }
      //enviando a resposta
      res.send(cr);  
    }
  }
});

app.delete("/excluirAeroporto", async(req,res)=>{
  // excluindo a aeroporto pelo código
  const codigo = req.body.codigo as number;
  console.log('Codigo recebido: ' + codigo);

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  // conectando 
  let connection;
  try{
    //da um delete na tabela AEROPORTOS
    connection = await oracledb.getConnection(oraConnAttribs);
    const cmdDeleteAeroporto = `DELETE AEROPORTOS WHERE COD_AEROPORTO = :1`;
    const dados = [codigo];
 
    //executa o script acima
    let resDelete = await connection.execute(cmdDeleteAeroporto, dados);
    
    //commit para o banco
    await connection.commit();
    
    // obter a informação de quantas linhas foram inseridas. 
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Aeroporto excluído.";
    }else{
      //mensagem de erro
      cr.message = "Aeroporto não excluído. Verifique se o nome do Aeroporto informado está correto.";
    }
  }catch(e){
    //buscando algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechando a conexao com o banco
    if(connection !== undefined){
      await connection.close();
    }
    //mandando resposta
    res.send(cr);  
  }
});

app.post("/editarAeroporto", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  //defindo o objeto AEROPORTO
  const aeroporto: Aeroporto = req.body as Aeroporto;
  console.log(aeroporto);

  //validacao
  let [valida, mensagem] = aeroportoValida(aeroporto);
  if(!valida) {
    //se tiver erro ja retorna-o
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continuamos a conexao.
    let connection;
    try{
      //abre conexao com o banco
      connection = await oracledb.getConnection(oraConnAttribs)
      //faz um UPDATE na tabela AEROPORTO
      const cmdUpdateAeroporto = `UPDATE AEROPORTOS SET NOME = :1, SIGLA = :2 WHERE COD_AEROPORTO = :3`;
      const dados = [aeroporto.nomeAero, aeroporto.sigla, aeroporto.codigo];
        //executa o scrip acima no banco
      let resUpdate = await connection.execute(cmdUpdateAeroporto, dados);
        
      // commit para o banco
      await connection.commit();
      
      // obter a informação de quantas linhas foram inseridas. 
      const rowsUpdated = resUpdate.rowsAffected
      if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Aeroporto editado.";
      }else{
        //mensagem de erro
        cr.message = "Aeroporto não editado. Verifique se o código informado está correto.";
      }
    }catch(e){
      //buscando algum erro
        if(e instanceof Error){
          cr.message = e.message;
          console.log(e.message);
        }else{
          //caso encontre retorna essa mensagem
          cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }finally {
        //fechar a conexao.
        if(connection !== undefined){
          await connection.close();
        }
        //lançando a resposta
        res.send(cr);  
    }
  }
});

app.put("/cadastrarTrecho", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //definindo o objeto Trecho 
  const trecho: Trecho = req.body as Trecho;
  console.log(trecho);

  //validação dos dados
  let [valida, mensagem] = trechoValida(trecho);
  if(!valida) {
    //se tiver erro ja devolve a resposta
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continuamos o processo porque passou na validação.
    let connection;
    try{
      //conectando com o banco de dados
      connection = await oracledb.getConnection(oraConnAttribs);
      //faz o INSERT das informações na tabela TRECHOS no banco
      const cmdInsertAeroporto = `INSERT INTO TRECHOS (COD_TRECHO, ORIGEM, DESTINO) VALUES (:1, :2, :3)`;
      const dados = [trecho.codigo, trecho.origem, trecho.destino];

      //executando o script acima 
      let resInsert = await connection.execute(cmdInsertAeroporto, dados);
      
      //commit para salvar no banco de dados
      await connection.commit();
    
      //obter a informação de quantas linhas foram inseridas
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined &&  rowsInserted === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Trecho inserido.";
      }
    }catch(e){
      //caçando possiveis erros
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //mensagem de erro
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    }finally {
      //fechar a conexao
      if(connection!== undefined){
        await connection.close();
      }
      //enviando a resposta
      res.send(cr);  
    }
  }
});

app.delete("/excluirTrecho", async(req,res)=>{
  // excluindo o trecho pelo código:
  const codigo = req.body.idtrecho as number;
  //verificacao do codigo
  console.log('Codigo recebido: ' + codigo);

  //obejrto de resposta
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  //variavel de conexao
  let connection;
  try{
    //conectando com o banco de dados
    connection = await oracledb.getConnection(oraConnAttribs);
    const cmdDeleteAeroporto = `DELETE TRECHOS WHERE COD_TRECHO = :1`;
    const dados = [codigo];
    
    //executando os scripts acima
    let resDelete = await connection.execute(cmdDeleteAeroporto, dados);
    
    //commit para salvar no banco de dados
    await connection.commit();
    
    //obter a informação de quantas linhas foram inseridas
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Trecho excluído.";
    }else{
      //mensagem de erro
      cr.message = "Trecho não excluído. Verifique se o codigo do trecho informado está correto.";
    }
  }catch(e){
    //caçando possiveis erros
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso algum erro foi encontrado, exibira essa mensagem
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  }finally {
    //fechando conexao com o banco
    if(connection !== undefined){
      await connection.close();
    }
    //enviando a resposta
    res.send(cr);  
  }
});

app.post("/editarTrecho", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //defindo objeto a ser usado
  const trecho: Trecho = req.body as Trecho;
  console.log(trecho);

  //validações das informações que chegaram
  let [valida, mensagem] = trechoValida(trecho);
  if(!valida) {
    //caso haja algum erro, retornara essa mensagem
    cr.message = mensagem;
    res.send(cr);
  } else {
  // continua a conexao
    let connection;
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs); 
      //faz o update na tabela TRECHOS
      const dados = [trecho.origem, trecho.destino, trecho.codigo];
      const cmdUpdateAeroporto = `UPDATE TRECHOS SET ORIGEM = :1, DESTINO = :2 WHERE COD_TRECHO = :3`;
    
      //executa o script acima
      let resUpdate = await connection.execute(cmdUpdateAeroporto, dados);
        
      //commit para salvar as informações no banco
      await connection.commit();
      
      // obter a informação de quantas linhas foram inseridas
      const rowsUpdated = resUpdate.rowsAffected
      if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Trecho editado.";
      }else{
        //mensagem de erro
        cr.message = "Trecho não editado. Verifique se o código informado está correto.";
        }
    }catch(e){
      //caçando possiveis erros
        if(e instanceof Error){
          cr.message = e.message;
          console.log(e.message);
        }else{
          //caso encontre, retorna essa mensagem de erro
          cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }finally {
        //fechar a conexão
        if(connection !== undefined){
          await connection.close();
        }
        //envia a reposta
        res.send(cr);  
      }
  }
});

app.put("/cadastrarVoo", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //definfo objeto
  const voo: Voo = req.body as Voo;
  console.log(voo);

  //validação dos dados que chegam
  let [valida, mensagem] = vooValida(voo);
  if(!valida) {
    //caso há algum erro, ja retorna uma mensagem
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continua a conexao
    let connection;
    try{
      //faz a conexao com o banco
      connection = await oracledb.getConnection(oraConnAttribs);
      //faz o INSERT na tabela VOOS
      const dados = [voo.codigo, voo.data, voo.horaIda, voo.horaChegada, voo.codAeronave, voo.codTrecho, voo.preco];
      const cmdInsertVoo = `INSERT INTO VOOS (COD_VOO, DATA_VOO, hora_ida, hora_volta, FK_AERONAVE_COD_AERONAVES, FK_TRECHO_COD_TRECHO, PRECO) VALUES (:1, TO_DATE(:2, 'DD-MM-YYYY'), :3, :4, :5, :6, :7)`;

      // executa o script acima
      let resInsert = await connection.execute(cmdInsertVoo, dados);
      
      //commit para salvar no banco de dados
      await connection.commit();
    
      // obter a informação de quantas linhas foram inseridas
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined &&  rowsInserted === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Voo inserido.";
      }
    }catch(e){
      //caçando possiveis erros 
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //caso encontre, retornara essa mensagem
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      //fechar a conexao
      if(connection!== undefined){
        await connection.close();
      }
      //enviando resposta
      res.send(cr);  
    }
  }
});

app.delete("/excluirVoo", async(req,res)=>{
  // excluindo o trecho pelo código:
  const voo: Voo = req.body as Voo;

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  // conectando 
  let connection;
  try{
    //conectando com o banco de dados
    connection = await oracledb.getConnection(oraConnAttribs); 
    const dados = [voo.codigo];
    const cmdDeleteVoo = `DELETE VOOS WHERE COD_VOO = :1`;
    //executando o script acima

    let resDelete = await connection.execute(cmdDeleteVoo, dados);
    
    //commit para salvar no banco de dados
    await connection.commit();
    
    // obter a informação de quantas linhas foram inseridas
    const rowsDeleted = resDelete.rowsAffected
    if(rowsDeleted !== undefined &&  rowsDeleted === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Voo excluído.";
    }else{
      //mensagem de erro
      cr.message = "Voo não excluído. Verifique se o codigo do voo informado está correto.";
    }
  }catch(e){
    //caçando possiveis erros
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso encontre retorna essa mensagem
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fechando conexao com o banco de dados
    if(connection !== undefined){
      await connection.close();
    }
    //enviando a resposta
    res.send(cr);  
  }
});

app.post("/editarVoo", async(req, res)=>{

  //objeto de resposta 
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  
  //defindo o objeto a ser usadao
  const voo: Voo = req.body as Voo;
  //viladando os dados que chegaram
  let [valida, mensagem] = vooValida(voo);
  if(!valida) {
    //caso ha algum erro retorna a mensagem de erro
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continua a conexao 
  let connection;
  try{
    //abre a conexao com o banco de dados
    connection = await oracledb.getConnection(oraConnAttribs);

    //UPDATE na tabela VOOS
    const dados = [voo.data, voo.horaIda, voo.horaChegada, voo.codAeronave, voo.codTrecho, voo.preco, voo.codigo];
    const cmdUpdateVoo = `UPDATE VOOS SET DATA_VOO = TO_DATE(:1, 'DD-MM-YYYY'), HORA_IDA = :2, HORA_VOLTA = :3,FK_AERONAVE_COD_AERONAVES = :4, FK_TRECHO_COD_TRECHO = :5, PRECO = :6 WHERE COD_VOO = :7`;
    
    //executa o script acima
    let resUpdate = await connection.execute(cmdUpdateVoo, dados);
      
    //commit para salvar no banco
    await connection.commit();
    
    // obter a informação de quantas linhas foram inseridas
    const rowsUpdated = resUpdate.rowsAffected
    if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Voo editado.";
    }else{
      //mensagem de erro
      cr.message = "Voo não editado. Verifique se o código informado está correto.";
      }
    }catch(e){
      //caçando algum erro
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //caso encontre o erro, retorna essa mensagem
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    }finally {
      //fecha a conexao
      if(connection !== undefined){
        await connection.close();
      }
      //envia a resposta da requisicao
      res.send(cr);  
    }
  }
});

//REQUISICOES DO MUDULO 2 ABAIXO

//busca ida do voo
app.post("/buscarVoo", async(req, res)=>{

  //defindo objeto de resposta
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined};
  //chamando o objeto
  const buscavoo: buscaVoo = req.body as buscaVoo;

  let connection;
  try{
    //abrindo a conexao
    connection = await oracledb.getConnection(oraConnAttribs);

    //faz um SELECT com join na tabela TRECHOS e VOO, para buscar origem, destino, data, preço, codigo do voo, hora ida e hora chegada
    const dados = [buscavoo.origem, buscavoo.destino, buscavoo.data];
    let resultadoConsulta = await connection.execute(
    `SELECT TRECHOS.ORIGEM, TRECHOS.DESTINO, VOOS.DATA_VOO, VOOS.PRECO, VOOS.COD_VOO, VOOS.HORA_IDA, VOOS.HORA_VOLTA
    FROM TRECHOS
    FULL OUTER JOIN VOOS ON TRECHOS.COD_TRECHO = VOOS.FK_TRECHO_COD_TRECHO
    WHERE TRECHOS.ORIGEM = :1 
    AND TRECHOS.DESTINO = :2 
    AND VOOS.DATA_VOO = TO_DATE(:3, 'DD-MM-YYYY')`, 
    dados);
    
    //mensagem de sucesso
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    //converte a resposta em um JSON
    cr.payload = (rowsToVooTrecho(resultadoConsulta.rows));
    console.log(cr.payload); 
  }catch(e){
    //busca algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //se achar retorna essa mensagem
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha a conexão com o banco de dados
    if(connection !== undefined){
      await connection.close();
    }
    //envia a resposta
    res.send(cr);  
  }
});

//cod_voo vai ter que vir do javascript
app.put("/cadastroPassagem", async(req, res)=>{
  //definindo um objeto de resposta
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  //definindo o objeto
  const passagem: Passagem = req.body as Passagem;
  console.log(passagem);

  //faz a validacao
  let [valida, mensagem] = passagemValida(passagem);
  if(!valida) {
    //caso chegue com algum erro retorna essa mensagem
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continua a conexao
    let connection;
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs);

      //INSERT na tabela PASSAGENS 
      const dados = [passagem.email_comprador, passagem.nome_comprador, passagem.codVoo];
      const cmdInsertPassagem = `INSERT INTO PASSAGENS VALUES (SQ_COD_TICKET.NEXTVAL,:1, :2, :3)`;
      
      //executa o script acima
      let resInsert = await connection.execute(cmdInsertPassagem, dados);
      
      //commit para salvar no banco de dados
      await connection.commit();
    
      // obter a informação de quantas linhas foram inseridas
      const rowsInserted = resInsert.rowsAffected
      if(rowsInserted !== undefined &&  rowsInserted === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Passagem inserida.";
      }
    }catch(e){
      //caçando um erro
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //caso encontre retorna essa mensagem
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    } finally {
      //fechar a conexao
      if(connection!== undefined){
        await connection.close();
      }
      //envia mensagem
      res.send(cr);  
    }
  }
});

//frontend/modulo 1
app.post("/atualizarStatusAssentos", async(req, res)=>{

  //objeto de resposta 
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };
  
  //defindo o objeto a ser usadao
  const assento: Assento = req.body as Assento;
  //viladando os dados que chegaram
  let [valida, mensagem] = assentoValida(assento);
  if(!valida) {
    //caso ha algum erro retorna a mensagem de erro
    cr.message = mensagem;
    res.send(cr);
  } else {
    // continua a conexao 
  let connection;
  try{
    //abre a conexao com o banco de dados
    connection = await oracledb.getConnection(oraConnAttribs);

    //UPDATE na tabela VOOS
    const dados = [assento.status, assento.codigo];
    const cmdUpdateAssento = `UPDATE ASSENTOS SET STATUS =:1 WHERE COD_ASSENTO = :2`;
    
    //executa o script acima
    let resUpdate = await connection.execute(cmdUpdateAssento, dados);
      
    //commit para salvar no banco
    await connection.commit();
    
    // obter a informação de quantas linhas foram inseridas
    const rowsUpdated = resUpdate.rowsAffected
    if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
      //mensagem de sucesso
      cr.status = "SUCCESS"; 
      cr.message = "Assento editado.";
    }else{
      //mensagem de erro
      cr.message = "Assento não editado. Verifique se o código informado está correto.";
      }
    }catch(e){
      //caçando algum erro
      if(e instanceof Error){
        cr.message = e.message;
        console.log(e.message);
      }else{
        //caso encontre o erro, retorna essa mensagem
        cr.message = "Erro ao conectar ao oracle. Sem detalhes";
      }
    }finally {
      //fecha a conexao
      if(connection !== undefined){
        await connection.close();
      }
      //envia a resposta da requisicao
      res.send(cr);  
    }
  }
});

//depois do pagamento
app.post("/ocuparAssento", async(req, res)=>{

  // definindo um objeto de resposta.
  let cr: CustomResponse = {
    status: "ERROR",
    message: "",
    payload: undefined,
  };

  //defindo objeto a ser usado
  const mapaAssento: MapaAssento = req.body as MapaAssento;
  console.log(mapaAssento);

  //validações das informações que chegaram
  let [valida, mensagem] = mapaAssentoValida(mapaAssento);
  if(!valida) {
    //caso haja algum erro, retornara essa mensagem
    cr.message = mensagem;
    res.send(cr);
  } else {
  // continua a conexao
    let connection;
    try{
      //abre a conexao
      connection = await oracledb.getConnection(oraConnAttribs); 
      //faz o update na tabela TRECHOS
      const dados = [mapaAssento.assento];
      const cmdUpdateMapaAssento = `UPDATE MAPAS_DE_ASSENTOS SET STATUS = 1 WHERE ASSENTO = :1`;
    
      //executa o script acima
      let resUpdate = await connection.execute(cmdUpdateMapaAssento, dados);
        
      //commit para salvar as informações no banco
      await connection.commit();
      
      // obter a informação de quantas linhas foram inseridas
      const rowsUpdated = resUpdate.rowsAffected
      if(rowsUpdated !== undefined &&  rowsUpdated === 1) {
        //mensagem de sucesso
        cr.status = "SUCCESS"; 
        cr.message = "Status do assento editado.";
      }else{
        //mensagem de erro
        cr.message = "Status do assento. Verifique se o código informado está correto.";
        }
    }catch(e){
      //caçando possiveis erros
        if(e instanceof Error){
          cr.message = e.message;
          console.log(e.message);
        }else{
          //caso encontre, retorna essa mensagem de erro
          cr.message = "Erro ao conectar ao oracle. Sem detalhes";
        }
    }finally {
        //fechar a conexão
        if(connection !== undefined){
          await connection.close();
        }
        //envia a reposta
        res.send(cr);  
      }
  }
});

app.post("/buscarAssentos", async(req, res)=>{

  //define o objeto de resposta
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined};
  //definindo o objeto
  const mapaAssento: MapaAssento = req.body as MapaAssento;

  //variavel de conexao do banco de dados
  let connection;
  try{
    //abre a conexao
    connection = await oracledb.getConnection(oraConnAttribs);

    //faz um SELECT do codigo, status e referencia da tabela MAPAS_DE_ASSENTOS com a condição do codigo do VOO
    const dados = [mapaAssento.voo];
    let resultadoConsulta = await connection.execute(`SELECT CODIGO, STATUS, REFERENCIA FROM MAPAS_DE_ASSENTOS WHERE VOO = :1 `, dados);

    //mensagem de sucesso
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";

    //converte a resposta do SELECT para JSON
    cr.payload = (rowsToAssentoVoo(resultadoConsulta.rows));
    console.log(cr.payload); 
  }catch(e){
    //busca algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso encontre retorna esse erro
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha a conexao 
    if(connection !== undefined){
      await connection.close();
    }
    //envia a resposta
    res.send(cr);  
  }
});

app.post("/getCode", async(req, res)=>{

  //definindo o objeto de resposta
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined};
  const mapaAssento: MapaAssento = req.body as MapaAssento;
  
  //variavel de conexao
  let connection;
  try{
    //abrindo a conexao
    connection = await oracledb.getConnection(oraConnAttribs);

    //executa um SELECT para receber o CODIGO na tabela MAPAS_DE_ASSENTOS com duas condiçoes o VOO que ele selecionou e a REFERENCIA do codigo
    const dados = [mapaAssento.voo, mapaAssento.referencia];
    let resultadoConsulta = await connection.execute(`SELECT ASSENTO FROM MAPAS_DE_ASSENTOS WHERE VOO = :1 AND REFERENCIA = :2 `, dados);

    //mensagem de sucesso
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    //converte a resposta em JSON
    cr.payload = (rowsToAssentoVoo(resultadoConsulta.rows));
    console.log(cr.payload); 
  }catch(e){
    //buscando algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso encontre retorna essa resposta
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha a conexao
    if(connection !== undefined){
      await connection.close();
    }
    //envia a resposta
    res.send(cr);  
  }
});

app.post("/buscarPreco", async(req, res)=>{

  //define o objeto de resposta
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined};
  //define o obejto a ser usado
  const voo: Voo = req.body as Voo;

  //variavel de conexao
  let connection;
  try{
    //abre a conexao com o banco de dados
    connection = await oracledb.getConnection(oraConnAttribs);

    //faz um SELECT para receber o preco do voo com a condicao do codigo do voo que o cliente selecionou
    const dados = [voo.codigo];
    let resultadoConsulta = await connection.execute(`SELECT PRECO FROM VOOS WHERE COD_VOO = :1`, dados);

    //mensagem de sucesso
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    //converte a resposta para JSON
    cr.payload = (rowsToPreco(resultadoConsulta.rows));
    console.log(cr.payload); 
  }catch(e){
    //busca algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso encontre retorna esse erro
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha aconexao
    if(connection !== undefined){
      await connection.close();
    }
    //envia a respota
    res.send(cr);  
  }
});

app.post("/getRef", async(req, res)=>{

  //definindo o objeto de resposta
  let cr: CustomResponse = {status: "ERROR", message: "", payload: undefined};
  const mapaAssento: MapaAssento = req.body as MapaAssento;
  
  //variavel de conexao
  let connection;
  try{
    //abrindo a conexao
    connection = await oracledb.getConnection(oraConnAttribs);

    //executa um SELECT para receber a REFERENCIA na tabela MAPAS_DE_ASSENTOS com uma condição, o assento
    const dados = [mapaAssento.assento,];
    let resultadoConsulta = await connection.execute(`SELECT REFERENCIA FROM MAPAS_DE_ASSENTOS WHERE ASSENTO = :1 `, dados);

    //mensagem de sucesso
    cr.status = "SUCCESS"; 
    cr.message = "Dados obtidos";
    //converte a resposta em JSON
    cr.payload = (rowsToAssentoVoo(resultadoConsulta.rows));
    console.log(cr.payload); 
  }catch(e){
    //buscando algum erro
    if(e instanceof Error){
      cr.message = e.message;
      console.log(e.message);
    }else{
      //caso encontre retorna essa resposta
      cr.message = "Erro ao conectar ao oracle. Sem detalhes";
    }
  } finally {
    //fecha a conexao
    if(connection !== undefined){
      await connection.close();
    }
    //envia a resposta
    res.send(cr);  
  }
});

app.listen(port,()=>{
  //localhost onde o servidor esta sendo executado
  console.log("Servidor HTTP funcionando...");
});