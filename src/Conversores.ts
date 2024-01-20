//esse arquivo recebe as linhas de array do oracle e transforma em JSON
import { MapaAssento } from "./mapa_assento";
import { buscaVoo } from "./buscaVoo";
import { Voo } from "./voo";

export function rowsToVooTrecho(oracleRows: unknown[] | undefined) : Array<buscaVoo> {
  //define o array
  let buscaVoos: Array<buscaVoo> = [];
  //variavel do objeto
  let buscaVoo;
  if (oracleRows !== undefined){
    //deixa cada variavel com o tipo any
    oracleRows.forEach((registro: any) => {
      buscaVoo = {
        codigo:registro.COD_VOO,
        data: registro.DATA_VOO,
        origem: registro.ORIGEM,
        destino: registro.DESTINO,
        preco:registro.PRECO,
        horaIda:registro.HORA_IDA,
        horaVolta:registro.HORA_VOLTA,

      } as buscaVoo;
      //inserindo o novo array convertido.
      buscaVoos.push(buscaVoo);
    })
  }
  //retorna o JSON
  return buscaVoos;
};

export function rowsToAssentoVoo(oracleRows: unknown[] | undefined) : Array<MapaAssento> {
  //define o array
  let assentosVoos: Array<MapaAssento> = [];
  //variavel do objeto
  let assentosVoo;
  if (oracleRows !== undefined){
    //deixa cada variavel com o tipo any
    oracleRows.forEach((registro: any) => {
      assentosVoo = {
        codigo: registro.CODIGO,
        voo: registro.VOO,
        assento: registro.ASSENTO,
        referencia: registro.REFERENCIA,
        status: registro.STATUS,
        ticket: registro.TICKET,
      } as MapaAssento;
      //inserindo o novo array convertido.
      assentosVoos.push(assentosVoo);
    })
  }
  //retorna o JSON
  return assentosVoos;
};

export function rowsToPreco(oracleRows: unknown[] | undefined) : Array<Voo> {
  //define o array
  let preco_voos: Array<Voo> = [];
  //variavel do objeto
  let preco_voo;
  if (oracleRows !== undefined){
    //deixa cada variavel com o tipo any
    oracleRows.forEach((registro: any) => {
      preco_voo = {
        preco:registro.PRECO,
      } as Voo;
      //inserindo o novo array convertido.
      preco_voos.push(preco_voo);
    })
  }
  //retorna o JSON
  return preco_voos;
};
