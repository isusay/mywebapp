declare module 'express' {
  export interface Request {
    body: any;
    params: any;
    query: any;
    headers: any;
    method: string;
    originalUrl: string;
    ip: string;
    get(name: string): string | undefined;
    user?: {
      userId: string;
      email: string;
      role: string;
    };
  }

  export interface Response {
    status(code: number): Response;
    json(data: any): Response;
    send(data: any): Response;
  }

  export interface NextFunction {
    (err?: any): void;
  }

  export function express(): any;
  export function Router(): any;
  export function json(options?: any): any;
  export function urlencoded(options?: any): any;

  const e: any;
  export default e;
}

declare module 'jsonwebtoken' {
  export function sign(payload: any, secret: string, options?: any): string;
  export function verify(token: string, secret: string, callback?: (err: any, decoded: any) => void): any;
}

declare module 'bcryptjs' {
  export function hash(password: string, saltRounds: number): Promise<string>;
  export function compare(password: string, hash: string): Promise<boolean>;
}

declare module 'cors' {
  export function cors(options?: any): any;
}

declare module 'cookie-parser' {
  export function cookieParser(): any;
}

declare module 'nodemailer' {
  export function createTransporter(config: any): any;
}

declare module 'express-validator' {
  export function body(field: string, message?: string): any;
  export function validationResult(req: any): any;
}