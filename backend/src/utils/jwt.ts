// src/utils/jwt.ts
import jwt, { Secret, SignOptions, JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";

const accessSecret: Secret = env.jwt.accessSecret;
const refreshSecret: Secret = env.jwt.refreshSecret;

// Creamos los options de forma segura para TS con exactOptionalPropertyTypes
const accessOptions: SignOptions = {};
if (env.jwt.accessExpires) {
  // forzamos el tipo aquí para no pelear con exactOptionalPropertyTypes
  (accessOptions as any).expiresIn = env.jwt.accessExpires;
}

const refreshOptions: SignOptions = {};
if (env.jwt.refreshExpires) {
  (refreshOptions as any).expiresIn = env.jwt.refreshExpires;
}

export const signAccess = (payload: object): string => {
  return jwt.sign(payload, accessSecret, accessOptions);
};

export const signRefresh = (payload: object): string => {
  return jwt.sign(payload, refreshSecret, refreshOptions);
};

export const verifyAccess = (token: string): JwtPayload | string => {
  return jwt.verify(token, accessSecret);
};

export const verifyRefresh = (token: string): JwtPayload | string => {
  return jwt.verify(token, refreshSecret);
};
