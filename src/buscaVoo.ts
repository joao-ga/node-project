//obejeto para receber as informacoes apos a busca de voo
export type buscaVoo = {
    codigo?: number,
    data?: Date,
    origem?: string,
    destino?: string,
    preco?: number,
    horaIda?: string,
    horaVolta?: string,
};