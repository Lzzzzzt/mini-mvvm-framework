export interface Data {
    [prop: string]: Data | any
}

export type Methods = Data

export interface Options {
    el: string
    data: Data
    methods?: Methods
}

export type SubscriberCallBack = (v: any) => void

