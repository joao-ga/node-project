import {ConnectionAttributes} from "oracledb";
import dotenv from "dotenv";
//recebe o arquivo .env para fazer a conexao com o banco de dados
dotenv.config();

export const oraConnAttribs: ConnectionAttributes = {
  //faz a conexao com o banco de dados
  user: process.env.ORACLE_DB_USER,
  password: process.env.ORACLE_DB_PASSWORD,
  connectionString: process.env.ORACLE_CONN_STR,
}