export interface Data {
    [prop: string]: Data | any
}

export type Methods = Data

export interface Options {
    el: string
    data: Data
    methods?: Methods
    [prop: string]: Data | Methods | any
}
