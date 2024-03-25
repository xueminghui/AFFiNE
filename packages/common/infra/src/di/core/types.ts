import type { FrameworkProvider } from './provider';

// eslint-disable-next-line @typescript-eslint/ban-types
export type Type<T = any> = abstract new (...args: any) => T;

export type ComponentFactory<T = any> = (provider: FrameworkProvider) => T;
export type ComponentVariant = string;

export type FrameworkLayer = string[];

export type IdentifierValue = {
  identifierName: string;
  variant: ComponentVariant;
};

export type GeneralServiceIdentifier<T = any> = Identifier<T> | Type<T>;

export type Identifier<T> = {
  identifierName: string;
  variant: ComponentVariant;
  __TYPE__: T;
};

export type IdentifierType<T> =
  T extends Identifier<infer R> ? R : T extends Type<infer R> ? R : never;

export type TypesToDeps<T extends any[]> = {
  [index in keyof T]:
    | GeneralServiceIdentifier<T[index]>
    | (T[index] extends (infer I)[] ? [GeneralServiceIdentifier<I>] : never);
};
