//arquivo para realizar as validacoes dos dados
import { Aeronave } from "./aeronaves";
import { Trecho } from "./trecho";
import { Aeroporto } from "./aeroporto";
import { Voo } from "./voo";
import { Passagem } from "./passagem";
import { Assento } from "./assento";
import { MapaAssento } from './mapa_assento';



export function aeronaveValida(aeronave: Aeronave) {
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";
    
    if(aeronave.codigo === undefined) {
        mensagem = "Codigo não informado.";
    }

    if(aeronave.codigo !== undefined && aeronave.codigo <= 0 ){
        mensagem = "Codigo deve ser maior que 0";
    }

    if(aeronave.marca === undefined){
      mensagem = "Marca não informada";
    }
  
    if(aeronave.marca !== 'Embraer' && aeronave.marca !== 'Airbus' && aeronave.marca !== 'Boeing'){
      mensagem = "Fabricante deve ser: Embraer, Airbus ou Boeing.";
    }
  
    if(aeronave.modelo === undefined){
      mensagem = "Modelo não informado.";
    }
  
    if(aeronave.qtdeAssentos === undefined){
      mensagem = "Total de assentos não informado";
    }
  
    if((aeronave.qtdeAssentos !== undefined) && (aeronave.qtdeAssentos < 100 || aeronave.qtdeAssentos > 1000)){
      mensagem = "Total de assentos é inválido";
    }
  
    if(aeronave.anoFabricacao === undefined){
      mensagem = "Ano de fabricação não informado";
    }
  
    if((aeronave.anoFabricacao!== undefined) && (aeronave.anoFabricacao < 1990 || aeronave.anoFabricacao > 2026)){
      mensagem = "Ano de fabricação deve ser entre 1990 e 2026";
    }
  
    if(aeronave.registro === undefined){
      mensagem = "Registro da aeronave não fornecida.";
    }
  
    //se passou em toda a validação.
    if(mensagem === ""){
        //retorna true
      valida = true;
    }
    
    //retornando a mensagem de valicao
    return [valida, mensagem] as const;
};

export function aeroportoValida(aeroporto: Aeroporto) {
     //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(aeroporto.codigo === undefined) {
        mensagem = "Codigo não informado.";
    }

    if(aeroporto.codigo !== undefined && aeroporto.codigo <= 0 ){
        mensagem = "Codigo deve ser maior que 0.";
    }

    if(aeroporto.nomeAero === undefined) {
        mensagem = "Nome do aeroporto não fornecido.";
    }

    if(aeroporto.sigla === undefined) {
        mensagem = "Pais não fornecido.";
    }

    // se passou em toda a validação.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }

    //retorna a mensagem de validacao
    return [valida, mensagem] as const;
};

export function trechoValida(trecho: Trecho) {
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(trecho.codigo === undefined){
        mensagem = "Trecho não informado";
    }

    if(trecho.codigo !== undefined && trecho.codigo <= 0){
        mensagem = "Codigo deve ser maior que 0";
    }

    if (trecho.origem === undefined){
        mensagem = "Origem não informada";
    }

    if(trecho.destino === undefined){
        mensagem = "Destino não informado";
    }
    //se paasou em toda validacao.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }

    //retona a mensagem de validacao
    return [valida, mensagem] as const;
};

export function vooValida(voo: Voo){
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(voo.codigo === undefined){
        mensagem = "Trecho não informado";
    }

    if(voo.codigo !== undefined && voo.codigo <= 0){
        mensagem = "Codigo deve ser maior que 0";
    }

    if(voo.data === undefined) {
        mensagem = "Data não informada.";
    }

    if(voo.horaIda === undefined){
        mensagem = "Hora de ida não informada.";
    }

    if(voo.horaChegada === undefined) {
        mensagem = "Hora de chegada não informado.";
    }

    if(voo.codAeronave === undefined){
        mensagem = "Codigo da Aeronave não informado.";
    }

    if(voo.codTrecho === undefined) {
        mensagem = "Codigo do Trecho não informado.";
    }

    if(voo.preco === undefined) {
        mensagem = "Preço não informado";
    }
    if(voo.preco !== undefined && voo.preco <= 0){
        mensagem = "Preço deve ser maior que 0";
    }

    //se paasou em toda validacao.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }
    
    //retorna a mensagem
    return [valida, mensagem] as const;
};

export function passagemValida(passagem: Passagem){
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(passagem.nome_comprador === undefined) {
        mensagem = "Hora de chegada não informado.";
    }

    if(passagem.email_comprador === undefined){
        mensagem = "Codigo da Aeronave não informado.";
    }

    //se paasou em toda validacao.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }
    
    //retorna a mensagem
    return [valida, mensagem] as const;
};

export function assentoValida(assento: Assento){
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(assento.codigo === undefined) {
        mensagem = "Código do assento não informado.";
    }

    if(assento.status === undefined){
        mensagem = "Novo status do assento não informado.";
    }

    //se paasou em toda validacao.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }
    
    //retorna a mensagem
    return [valida, mensagem] as const;
};

export function mapaAssentoValida(mapaAssento: MapaAssento){
    //condicoes para os dados prosseguirem
    let valida = false;
    let mensagem = "";

    if(mapaAssento.assento === undefined) {
        mensagem = "Assento do Mapa de Assento não informado.";
    }

    //se paasou em toda validacao.
    if(mensagem === ""){
        //retorna true
        valida = true;
    }
    
    //retorna a mensagem
    return [valida, mensagem] as const;
};