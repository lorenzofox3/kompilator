import {parserFactory} from "../../src/index"
const parseFunc = parserFactory();
export const parse = code => parseFunc(code).expression();