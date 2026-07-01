/// <reference types="astro/client" />

interface Locals {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    mfaEnabled: boolean;
  } | null;
  license: {
    id: number;
    type: string;
    modules: string[];
    maxSessions: number;
    expiresAt: string;
    active: boolean;
  } | null;
}
